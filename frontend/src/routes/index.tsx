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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowUpRight, Github, Mail, Sparkle } from "lucide-react";
import assistantAvatar from "@/assets/assistant-avatar.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Jagan K K — Computer Science Graduate" },
      {
        name: "description",
        content:
          "Portfolio of Jagan K K, CS graduate passionate about AI, ML, and game development. Chat with an AI assistant about Jagan's work, skills, and availability.",
      },
      { property: "og:title", content: "Jagan K K — Computer Science Graduate" },
      {
        property: "og:description",
        content:
          "Chat with an AI-powered assistant about Jagan's projects, skills, and how to get in touch.",
      },
    ],
  }),
  component: Index,
});

const SUGGESTED_PROMPTS = [
  "What projects has Jagan worked on?",
  "Tell me about Jagan's technical skills.",
  "What is Jagan's educational background?",
  "Is Jagan available for opportunities?",
];

const PROJECTS = [
  {
    name: "Cerbi — Retro OS Desktop Experience",
    blurb: "Full-stack app recreating a desktop OS as a retro game-style experience, with real-time code chat and AI-generated news summaries.",
    tag: "TypeScript · React · TanStack Start · Supabase",
    github: "https://github.com/jagan-kk/cerbi-daily-hub",
    link: "https://cerbi-daily-hub.vercel.app",
    highlights: [
      "Recreates a desktop operating system with draggable, stackable windows, pixel-art UI, and z-order management.",
      "Real-time code-only chat rooms via Supabase Realtime.",
      "AI-generated news summaries via OpenRouter, plus occupation-based daily quizzes with score tracking.",
      "Points shop with item management and Spotify streaming integration (premium).",
      "Built on TanStack Start (React + Vite + Nitro), styled with Tailwind CSS v4, deployed on Vercel.",
    ],
  },
  {
    name: "Zithr — Music Streaming & Browser Cache",
    blurb: "Music streaming platform importing Spotify playlists via CSV, resolving free streams, and caching audio in the browser.",
    tag: "Python · FastAPI · MongoDB · React · Docker",
    github: "https://github.com/jagan-kk/Zithr",
    link: "https://vinylcloud-ivory.vercel.app",
    highlights: [
      "Import Spotify playlists via CSV and resolve each track to a free stream.",
      "Cache audio in-browser using IndexedDB for offline playback.",
      "Expose key-protected public REST API (FastAPI + MongoDB) for other apps.",
      "Containerized backend with Docker; React + Vite frontend.",
    ],
  },
  {
    name: "Stateful RAG Pipeline",
    blurb: "RAG system with sha256-hashed incremental indexing that skips unchanged PDF chunks to cut embedding API costs.",
    tag: "Python · LangChain · Google Gemini · ChromaDB",
    github: "https://github.com/jagan-kk/RAG-deduplication-",
    link: null,
    highlights: [
      "Retrieval-Augmented Generation using LangChain, Google Gemini embeddings, and ChromaDB.",
      "Stateful incremental indexing with sha256 hashing (SQLRecordManager) to skip unchanged chunks.",
      "Strict QA guardrails that restrict answers to retrieved document context to prevent hallucination.",
      "Autonomous deep agent for dynamic content retrieval.",
    ],
  },
  {
    name: "AI AR Data Augmentation",
    blurb: "Admin web app and mobile app delivering documents without login, gated by geofencing and YOLO object detection.",
    tag: "Python · Flask · Unity · OpenCV · MongoDB",
    github: "https://github.com/jagan-kk/AI-AR-Augmentation",
    link: null,
    highlights: [
      "Web admin portal plus mobile app that delivers documents without requiring login.",
      "Geofencing + YOLO object detection ensures only users at specified locations can access data.",
      "AI depth estimation and document summarization turn PDFs into interactive 3D AR cards.",
      "Mobile AR experience built with Unity + AR Foundation.",
    ],
  },
  {
    name: "SketchPlay AI",
    blurb: "Real-time 2D augmented game driven by hand-drawn sketches using YOLOv8 and MediaPipe at 30 FPS.",
    tag: "Python · OpenCV · YOLOv8 · MediaPipe",
    github: "https://github.com/jagan-kk/AI-AR-Sketch-Game",
    link: null,
    highlights: [
      "Real-time AR game where hand-drawn sketches become 2D game platforms.",
      "Trained YOLOv8 and RNN models for object detection and interaction.",
      "Optimized to run at 30 FPS on medium-spec laptops.",
      "Gameplay controlled via hand gestures using MediaPipe.",
    ],
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
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-brand text-brand-foreground text-sm font-semibold">
            J
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Jagan K K</span>
            <span className="text-xs text-muted-foreground">Computer Science Graduate</span>
          </div>
        </div>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
          <a href="#projects" className="hover:text-foreground transition">Projects</a>
          <a href="#stack" className="hover:text-foreground transition">Stack</a>
          <a
href="mailto:jagsonjob@gmail.com"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background hover:bg-foreground/90"
          >
            <Mail className="size-3.5" /> Contact
          </a>
        </nav>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-24 pt-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-12">
        {/* Left: Hero + portfolio */}
        <section className="flex flex-col gap-10">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              Open to opportunities · 2026
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Building with curiosity,<br />
              <span className="text-brand">one project at a time.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              I'm Jagan — a CS graduate passionate about AI, machine learning,
              and game development. I love turning ideas into working software.
              Ask my assistant anything about my work.
            </p>
          </div>

          <div id="projects" className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                2024 — 2026
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <Accordion type="multiple" className="flex flex-col gap-3">
                {PROJECTS.map((p) => (
                  <AccordionItem
                    key={p.name}
                    value={p.name}
                    className="overflow-hidden rounded-2xl border border-border bg-card/70 backdrop-blur transition hover:border-brand/50 hover:bg-card"
                  >
                    <AccordionTrigger className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{p.name}</span>
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand hover:bg-brand/20"
                          >
                            Live <ArrowUpRight className="size-2.5" />
                          </a>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 pt-0">
                      <p className="text-sm text-muted-foreground">{p.blurb}</p>
                      <p className="mt-2 text-[11px] uppercase tracking-widest text-brand/80">
                        {p.tag}
                      </p>
                      <ul className="mt-3 flex flex-col gap-1.5">
                        {p.highlights.map((h, i) => (
                          <li key={i} className="flex gap-2 text-sm text-foreground/80">
                            <span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand" />
                            {h}
                          </li>
                        ))}
                      </ul>
                      <a
                        href={p.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:border-brand/60 hover:text-brand"
                      >
                        <Github className="size-3.5" /> View on GitHub
                      </a>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          <div id="stack" className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {[
                "Python",
                "TypeScript",
                "JavaScript",
                "React",
                "Node.js",
                "FastAPI",
                "Flask",
                "LangChain",
                "RAG",
                "ChromaDB",
                "Supabase",
                "MongoDB",
                "OpenCV",
                "YOLOv8",
                "MediaPipe",
                "Unity",
                "Docker",
                "Git",
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
            <a href="mailto:jagsonjob@gmail.com" className="inline-flex items-center gap-1.5 hover:text-foreground">
              <Mail className="size-4" /> jagsonjob@gmail.com
            </a>
            <a href="https://github.com/jagan-kk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-foreground">
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
                <span className="text-sm font-semibold">Ask about Jagan</span>
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
                    title="Hi, I'm Jagan's assistant."
                    description="Ask me about projects, skills, education, or anything else."
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
                  placeholder="Ask about Jagan's work…"
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
