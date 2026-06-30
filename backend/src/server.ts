import "dotenv/config";
import "./lib/error-capture";
import { createServer } from "http";
import { PageIndexClient } from "@pageindex/sdk";
import { VectorlessRAG, type TreeNode } from "./rag";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const PAGE_INDEX_KEY = process.env.PAGE_INDEX_KEY;

if (!GROQ_API_KEY || !PAGE_INDEX_KEY) {
  console.error("Missing GROQ_API_KEY or PAGE_INDEX_KEY in .env");
  process.exit(1);
}

const pageClient = new PageIndexClient({ apiKey: PAGE_INDEX_KEY });
const rag = new VectorlessRAG(pageClient, GROQ_API_KEY);

let documentTree: TreeNode[] = [];

console.log("INFO: Processing resume PDF and building tree index...");
rag.processDocument("jags.pdf")
  .then((tree) => {
    documentTree = tree;
    console.log("INFO: Document tree loaded. Ready for queries.");
  })
  .catch((err) => {
    console.error("CRITICAL ERROR loading document tree:", err);
  });

const server = createServer(async (req, res) => {
  try {
    if (req.method !== "POST" || req.url !== "/api/chat") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }

    const buffers: Buffer[] = [];
    for await (const chunk of req) buffers.push(chunk);
    const rawBody = Buffer.concat(buffers).toString();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch (parseErr) {
      console.error("JSON parse error. Raw body:", rawBody.slice(0, 500));
      throw parseErr;
    }
    const rawMessages = body?.messages;

    if (!Array.isArray(rawMessages)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Messages are required" }));
      return;
    }

    if (documentTree.length === 0) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Document tree is still being built. Try again shortly." }));
      return;
    }

    // Get the last user message as the query
    const lastUserMsg = [...rawMessages].reverse().find((m: any) => m.role === "user");
    let query = "";
    if (typeof lastUserMsg?.content === "string") {
      query = lastUserMsg.content.trim();
    } else if (Array.isArray(lastUserMsg?.content)) {
      query = lastUserMsg.content.map((p: any) => p.text ?? "").join(" ").trim();
    } else if (Array.isArray(lastUserMsg?.parts)) {
      query = lastUserMsg.parts.map((p: any) => p.text ?? "").join(" ").trim();
    }
    if (!query) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User message cannot be empty" }));
      return;
    }

    const textId = crypto.randomUUID();
    const sse = (data: object) => `data: ${JSON.stringify(data)}\n\n`;

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Connection": "keep-alive",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    });

    res.write(sse({ type: "text-start", id: textId }));

    try {
      for await (const chunk of rag.queryPipelineStream(query, documentTree)) {
        if (chunk) {
          res.write(sse({ type: "text-delta", id: textId, delta: chunk }));
        }
      }
    } catch (err) {
      console.error("RAG pipeline error:", err);
      res.write(sse({ type: "text-delta", id: textId, delta: `\n\n[Error: ${err}]` }));
    }

    res.write(sse({ type: "text-end", id: textId }));
    res.end();
  } catch (err) {
    console.error("request error", err);
    const captured = consumeLastCapturedError();
    if (captured) console.error(captured);

    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderErrorPage());
    } else {
      res.end();
    }
  }
});

const port = parseInt(process.env.PORT || "3001", 10);
server.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
