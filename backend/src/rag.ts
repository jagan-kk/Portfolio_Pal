import { readFileSync } from "fs";
import { PageIndexClient } from "@pageindex/sdk";

export interface TreeNode {
  node_id: string;
  title: string;
  page_index?: number;
  text?: string;
  nodes?: TreeNode[];
}

export interface CompressedNode {
  node_id: string;
  title: string;
  page: number | string;
  summary: string;
  children?: CompressedNode[];
}

export const SYSTEM_PROMPT = `You are Jagan K K's personal portfolio assistant. You answer questions about his resume, projects, skills, education, and experience. Along with it you can reply to simple coversations

Rules:
- Use ONLY the document context provided in the user message to answer.
- Extract and present specific facts, project details, skills, and education.
- NEVER say "the document context appears to be about" or similar meta-commentary — just answer directly.
- If the query asks about projects, list them with their tech stacks and descriptions.
- If the query asks about skills, list specific technologies with context.
- If the query asks about education, include institution names, degrees, and scores.
- Use Markdown: ## headings, **bold** for key terms, bullet lists.
- you can do replay to simple conversation.
- do not use markdown for nomal coversation.
- only use markdown for the relevant topic they asked for. 
- If the context doesn't contain the answer, say "I don't have that information in the resume."`;

export class VectorlessRAG {
  private groqApiKey: string;

  constructor(
    private pageClient: PageIndexClient,
    private groqKey: string,
    private model: string = "openai/gpt-oss-20b",
    private systemPrompt: string = SYSTEM_PROMPT,
  ) {
    this.groqApiKey = groqKey;
  }

  async processDocument(pdfPath: string, pollInterval = 3000): Promise<TreeNode[]> {
    const file = readFileSync(pdfPath);
    const result = await this.pageClient.api.submitDocument(file, pdfPath.split("/").pop() || "document.pdf");
    const docId = result.doc_id;

    console.log(`Document submitted. ID: ${docId}`);

    while (true) {
      const tree = await this.pageClient.api.getTree(docId, { nodeSummary: true });
      if (tree.status === "completed") {
        console.log("Document tree ready.");
        return tree.result as TreeNode[];
      }
      if (tree.status === "failed") {
        throw new Error("Document processing failed on PageIndex server.");
      }
      await new Promise((r) => setTimeout(r, pollInterval));
    }
  }

  private compressTree(nodes: TreeNode[]): CompressedNode[] {
    return nodes.map((n) => ({
      node_id: n.node_id,
      title: n.title,
      page: n.page_index ?? "?",
      summary: (n.text ?? "").slice(0, 200),
      ...(n.nodes ? { children: this.compressTree(n.nodes) } : {}),
    }));
  }

  private findNodesById(nodeIds: string[], nodes: TreeNode[]): TreeNode[] {
    const found: TreeNode[] = [];
    for (const node of nodes) {
      if (nodeIds.includes(node.node_id)) {
        found.push(node);
      }
      if (node.nodes) {
        found.push(...this.findNodesById(nodeIds, node.nodes));
      }
    }
    return found;
  }

  async llmTreeSearch(query: string, tree: TreeNode[]): Promise<{ thinking: string; node_list: string[] }> {
    const compressed = this.compressTree(tree);

    const prompt = `You are an information retrieval agent. A user will provide a query and a document tree. The document tree is a hierarchical representation of a document, where each node has a title, page number, and a text snippet. Your task is to reason over the document tree and identify which nodes are relevant to the user's query.

Query: ${query}
Document Tree (in JSON format):
${JSON.stringify(compressed, null, 2)}

Reply strictly in this json format:
{
  "thinking": "your reasoning process here",
  "node_list": ["list", "of", "relevant", "node_ids"]
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: "You are an information retrieval agent. Return JSON with thinking and node_list fields." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("GROQ tree search error:", await response.text());
      return { thinking: "API error", node_list: [] };
    }

    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    const rawContent = data.choices?.[0]?.message?.content ?? "";
    const cleanJson = rawContent.replace(/^```json\s*|\s*```$/gm, "").trim();
    try {
      return JSON.parse(cleanJson);
    } catch {
      return { thinking: "Failed to parse LLM response", node_list: [] };
    }
  }

  async *generateAnswer(query: string, relevantNodes: string[], tree: TreeNode[]): AsyncGenerator<string> {
    const relevantTreeNodes = this.findNodesById(relevantNodes, tree);
    const context = relevantTreeNodes.length > 0 ? relevantTreeNodes : this.compressTree(tree).slice(0, 3);

    const userContent = `Query: ${query}

Document Context:
${JSON.stringify(context, null, 2)}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: this.systemPrompt },
          { role: "user", content: userContent },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      yield `\n\n[Error: GROQ API returned ${response.status}]`;
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield "\n\n[Error: No response body]";
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          const jsonStr = trimmed.slice(6).trim();

          if (jsonStr === "[DONE]") continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content ?? "";
            if (content) yield content;
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch (err) {
      yield `\n\n[Stream error: ${err}]`;
    }
  }

  async *queryPipelineStream(query: string, tree: TreeNode[]): AsyncGenerator<string> {
    const searchResult = await this.llmTreeSearch(query, tree);
    const relevantNodes = searchResult.node_list ?? [];
    yield* this.generateAnswer(query, relevantNodes, tree);
  }
}
