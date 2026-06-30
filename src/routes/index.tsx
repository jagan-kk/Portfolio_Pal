import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { ArrowUpRight, Github, Linkedin, Mail, Sparkle } from "lucide-react";
import assistantAvatar from "@/assets/assistant-avatar.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alex Rivera — Senior Full-Stack Engineer" },
      {
        name: "description",
        content:
          "Portfolio of Alex Rivera, senior full-stack engineer. Chat with an AI assistant about Alex's work, skills, and availability.",
      },
      { property: "og:title", content: "Alex Rivera — Senior Full-Stack Engineer" },
      {
        property: "og:description",
        content:
          "Chat with an AI-powered assistant about Alex's projects, stack, and how to hire him.",
      },
    ],
  }),
  component: Index,
});

const SUGGESTED_PROMPTS = [
  "What's Alex's strongest tech stack?",
  "Walk me through a recent project.",
  "Is Alex available for contract work?",
  "Why hire Alex over another senior engineer?",
];

const PROJECTS = [
  {
    name: "Pulse",
    blurb: "Real-time analytics dashboard handling 1.2B events/day on Clickhouse.",
    tag: "React · Clickhouse · tRPC",
  },
  {
    name: "Loom CRM",
    blurb: "Multi-tenant CRM with row-level security and per-workspace billing.",
    tag: "Next.js · Postgres · Stripe",
  },
  {
    name: "Quill",
    blurb: "AI writing assistant with streaming completions and RAG over notes.",
    tag: "OpenAI · pgvector · Edge",
  },
];

function Index() {
  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" })).current;
  const { messages, sendMessage, status, error, stop } = useChat({
    transport,
    onError: (e) => console.error(e),
  });

  const [draft, setDraft] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [status]);

  const isBusy = status === "submitted" || status === "streaming";

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    void sendMessage({ text: trimmed });
    setDraft("");
  };

  const handlePromptSubmit = (message: PromptInputMessage) => {
    send(message.text ?? "");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 size-[40rem] rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 size-[36rem] rounded-full bg-accent-warm/30 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-brand text-brand-foreground font-serif text-lg">
            A
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Alex Rivera</span>
            <span className="text-xs text-muted-foreground">Senior Full-Stack Engineer</span>
          </div>
        </div>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
          <a href="#projects" className="hover:text-foreground transition">Projects</a>
          <a href="#stack" className="hover:text-foreground transition">Stack</a>
          <a
            href="mailto:alex@riveradev.example"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background hover:bg-foreground/90"
          >
            <Mail className="size-3.5" /> Hire me
          </a>
        </nav>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-24 pt-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-12">
        {/* Left: Hero + portfolio */}
        <section className="flex flex-col gap-10">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Open to senior &amp; staff roles · Q3
            </span>
            <h1 className="font-serif mt-5 text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Building thoughtful software,
              <span className="text-brand"> end&nbsp;to&nbsp;end.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              I'm Alex — a full-stack engineer with 7+ years shipping calm,
              fast products in fintech, ML tooling, and developer platforms.
              Ask my assistant anything about my work.
            </p>
          </div>

          <div id="projects" className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-2xl">Selected work</h2>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                2020 — present
              </span>
            </div>
            <div className="grid gap-3">
              {PROJECTS.map((p) => (
                <article
                  key={p.name}
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur transition hover:border-brand/50 hover:bg-card"
                >
                  <div>
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-widest text-brand/80">
                      {p.tag}
                    </p>
                  </div>
                  <ArrowUpRight className="mt-1 size-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
                </article>
              ))}
            </div>
          </div>

          <div id="stack" className="flex flex-col gap-3">
            <h2 className="font-serif text-2xl">Working with</h2>
            <div className="flex flex-wrap gap-2">
              {[
                "TypeScript",
                "React",
                "Next.js",
                "Node.js",
                "Postgres",
                "tRPC",
                "AWS",
                "Python",
                "Go",
                "RAG / LLMs",
              ].map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/80"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="mailto:alex@riveradev.example" className="inline-flex items-center gap-1.5 hover:text-foreground">
              <Mail className="size-4" /> alex@riveradev.example
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 hover:text-foreground">
              <Linkedin className="size-4" /> LinkedIn
            </a>
            <a href="#" className="inline-flex items-center gap-1.5 hover:text-foreground">
              <Github className="size-4" /> GitHub
            </a>
          </div>
        </section>

        {/* Right: Chat */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="flex h-[calc(100vh-9rem)] min-h-[560px] flex-col overflow-hidden rounded-3xl border border-border bg-card/90 shadow-xl shadow-brand/5 backdrop-blur">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <img
                src={assistantAvatar}
                alt=""
                width={36}
                height={36}
                className="size-9 rounded-full ring-1 ring-border"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">Ask about Alex</span>
                <span className="text-xs text-muted-foreground">
                  AI assistant · usually replies instantly
                </span>
              </div>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand">
                <Sparkle className="size-2.5" /> AI
              </span>
            </div>

            <Conversation className="flex-1">
              <ConversationContent className="px-4 py-5">
                {messages.length === 0 ? (
                  <ConversationEmptyState
                    title="Hi, I'm Alex's assistant."
                    description="Ask me about projects, stack, availability, or anything else."
                    icon={
                      <img
                        src={assistantAvatar}
                        alt=""
                        width={56}
                        height={56}
                        className="size-14 rounded-full"
                      />
                    }
                  />
                ) : (
                  messages.map((m: UIMessage) => (
                    <Message key={m.id} from={m.role === "user" ? "user" : "assistant"}>
                      <MessageContent
                        className={
                          m.role === "user"
                            ? "bg-chat-user text-chat-user-foreground"
                            : "bg-transparent p-0 text-foreground"
                        }
                      >
                        {m.parts.map((part, i) => {
                          if (part.type === "text") {
                            return m.role === "assistant" ? (
                              <MessageResponse key={i}>{part.text}</MessageResponse>
                            ) : (
                              <span key={i} className="whitespace-pre-wrap">
                                {part.text}
                              </span>
                            );
                          }
                          return null;
                        })}
                      </MessageContent>
                    </Message>
                  ))
                )}

                {status === "submitted" && (
                  <Message from="assistant">
                    <MessageContent className="bg-transparent p-0">
                      <Shimmer className="text-sm text-muted-foreground">
                        Thinking…
                      </Shimmer>
                    </MessageContent>
                  </Message>
                )}

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    Something went wrong. Please try again.
                  </div>
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    disabled={isBusy}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground/80 transition hover:border-brand/60 hover:text-brand disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-border bg-background/60 p-3">
              <PromptInput onSubmit={handlePromptSubmit}>
                <PromptInputTextarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask about Alex's work…"
                />
                <PromptInputFooter className="justify-end">
                  <PromptInputSubmit
                    status={status}
                    disabled={!draft.trim() && !isBusy}
                    onStop={stop}
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
