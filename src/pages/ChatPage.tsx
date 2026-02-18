import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, RotateCcw, Bot, User } from "lucide-react";

type Message = { 
  role: "user" | "assistant"; 
  content: string;
  detectedRole?: string;
};

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || "http://localhost:4000";

const suggestedPrompts = [
  "What's her experience with data pipelines?",
  "Tell me about her GenAI projects",
  "What cloud platforms has she worked with?",
  "What's her experience as a Data Engineer?",
  "What analytics tools does she know?",
];

type RagStatus = {
  pineconeConfigured: boolean;
  groqConfigured: boolean;
  vectorCount: number | null;
  error?: string;
} | null;

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ragStatus, setRagStatus] = useState<RagStatus>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check RAG status and warm up the server (load embedding model) when chat page opens
  useEffect(() => {
    let cancelled = false;
    fetch(`${CHAT_API_URL}/api/rag-status`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setRagStatus({
          pineconeConfigured: data.pineconeConfigured ?? false,
          groqConfigured: data.groqConfigured ?? false,
          vectorCount: data.vectorCount ?? null,
          error: data.error ?? undefined,
        });
      })
      .catch(() => {
        if (!cancelled) setRagStatus(null);
      });
    // Start loading the AI model in the background so first message is faster
    fetch(`${CHAT_API_URL}/api/warmup`).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const CHAT_TIMEOUT_MS = 60_000; // 1 min — production uses API-only embeddings (fast); long timeouts are bad practice

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

    try {
      const res = await fetch(`${CHAT_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data: { answer?: string; detectedRole?: string; error?: string; details?: string } = await res.json().catch(() => ({}));

      if (res.status === 503 && (data.error === "warming_up" || data.details?.toLowerCase().includes("warm"))) {
        throw new Error("The AI is still warming up. Please wait a moment and try again.");
      }

      if (!res.ok) {
        const errMsg = data.details || data.error || `API error: ${res.status}`;
        throw new Error(errMsg);
      }

      const answer =
        data.answer ||
        "I couldn't generate an answer from the resume data, but Nishita has strong experience across data, AI, and engineering.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
          detectedRole: data.detectedRole,
        },
      ]);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Chat error", err);
      const isAbort = err instanceof Error && err.name === "AbortError";
      const isNetwork = err instanceof TypeError && err.message?.includes("fetch");
      const message =
        isAbort || isNetwork
          ? "The request timed out. Please try again. If this keeps happening, check that your backend is running and that HUGGINGFACE_API_TOKEN is set (production requires it for embeddings)."
          : err instanceof Error
            ? err.message
            : "Something went wrong talking to the AI backend. Please check that the resume chat server is running and try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-serif text-xl font-medium text-foreground">Chat with My Experience</h1>
            <p className="text-xs text-muted-foreground">AI-powered · Based on resume data</p>
          </div>
        </div>
      </div>

      {/* RAG status: embeddings in DB + similarity → Groq → here */}
      {ragStatus && (
        <div className="max-w-3xl mx-auto px-6 py-2">
          <div className={`text-xs rounded-lg px-3 py-2 ${ragStatus.error || (ragStatus.vectorCount !== null && ragStatus.vectorCount === 0) ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground"}`}>
            {ragStatus.error ? (
              <>Vector DB error: {ragStatus.error}</>
            ) : ragStatus.vectorCount === null ? (
              <>Checking… Pinecone {ragStatus.pineconeConfigured ? "configured" : "not configured"} · Groq {ragStatus.groqConfigured ? "configured" : "not configured"}</>
            ) : ragStatus.vectorCount === 0 ? (
              <>No embeddings in database. Run <code className="px-1 rounded bg-background">npm run ingest-resumes</code> then restart the server.</>
            ) : (
              <>Flow: your question → embedding → similarity in vector DB ({ragStatus.vectorCount} vectors) → Groq → answer here</>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Bot size={24} className="text-primary" />
              </div>
              <h2 className="font-serif text-2xl text-foreground mb-2">Ask Nishita's AI</h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                I'm an AI trained on Nishita's resume and experience. Ask me anything about her skills, projects, or background!
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-xs px-4 py-2 rounded-full border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 mb-6 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot size={14} className="text-primary" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[75%]">
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-card border border-border text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.detectedRole && msg.role === "assistant" && (
                  <span className="text-[10px] text-muted-foreground px-2">
                    Answering as: {msg.detectedRole}
                  </span>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <User size={14} className="text-foreground" />
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-primary" />
              </div>
              <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                title="Clear conversation"
              >
                <RotateCcw size={16} />
              </button>
            )}
            <div className="flex-1 flex items-center border border-border rounded-full bg-card px-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask about Nishita's experience..."
                className="flex-1 py-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="p-1.5 text-primary disabled:opacity-30 transition-opacity"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            AI-powered responses based on resume data · Not a real-time conversation
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
