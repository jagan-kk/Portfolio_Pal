# Portfolio Pal

AI-powered portfolio assistant. Chat with a RAG-backed assistant that answers questions about Jagan K K's projects, skills, and education from the resume PDF.

## Live
https://portfolio-fkttx5bs6-jagan-kks-projects.vercel.app/ 

## Tech Stack

### Frontend
| Category | Technology |
|----------|-----------|
| **Framework** | [React 19](https://react.dev) · [TypeScript](https://www.typescriptlang.org/) |
| **Bundler** | [Vite 8](https://vitejs.dev) · [`vite-tsconfig-paths`](https://github.com/aleclarson/vite-tsconfig-paths) |
| **Routing** | [@tanstack/react-router](https://tanstack.com/router) |
| **Data Fetching** | [@tanstack/react-query](https://tanstack.com/query) |
| **AI SDK** | [Vercel AI SDK](https://sdk.vercel.ai) (`ai` · `@ai-sdk/react`) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com) · `tailwind-merge` · `clsx` · `class-variance-authority` · `tw-animate-css` |
| **UI Components** | [Radix UI primitives](https://www.radix-ui.com) · `cmdk` · `vaul` · `sonner` · `embla-carousel-react` · `react-resizable-panels` |
| **Forms** | `react-hook-form` · `@hookform/resolvers` · `zod` |
| **Charts** | `recharts` · `lucide-react` · `motion` |
| **Markdown** | `react-markdown` · `streamdown` (code · math · mermaid · CJK) |

### Backend
| Category | Technology |
|----------|-----------|
| **Runtime** | [Node.js](https://nodejs.org) · [TypeScript](https://www.typescriptlang.org/) |
| **Server** | Raw Node.js `http` module · `tsx` (dev runner) · `tsc` (build) |
| **AI / RAG** | [@langchain/groq](https://js.langchain.com) · [Groq API](https://console.groq.com) (OpenAI-compatible) |
| **Document Processing** | [@pageindex/sdk](https://pageindex.com) |
| **Monitoring** | [LangSmith](https://smith.langchain.com) · [Sentry](https://sentry.io) (via `@sentry/node`) |
| **Architecture** | **VectorlessRAG** — LLM-guided tree search over PDF document hierarchy + streaming synthesis |
| **Config** | `dotenv` · `uuid` |

### DevOps
| Category | Technology |
|----------|-----------|
| **Linting** | ESLint 9 · Prettier · `eslint-plugin-react-hooks` · `typescript-eslint` |
| **Deploy** | [Vercel](https://vercel.com) (frontend) · [Render](https://render.com) (backend) |
