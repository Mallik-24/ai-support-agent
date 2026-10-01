// server.js — Express backend for AI Customer Support Agent
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require("uuid");
const {
  generateResponse,
  isOllamaAvailable,
  isGroqConfigured,
  getCategories,
  getSuggestedQuestions,
} = require("./ai-engine");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: ["http://localhost:3000", "http://127.0.0.1:3000"] }));
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

// Rate limiting — 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});
app.use("/api", limiter);

// ─── In-memory conversation store (per session) ───────────────────────────────
const conversations = new Map();

function getOrCreateSession(sessionId) {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, {
      id: sessionId,
      messages: [],
      createdAt: new Date().toISOString(),
    });
  }
  return conversations.get(sessionId);
}

// Clean up old sessions every 30 minutes
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [id, session] of conversations) {
    if (new Date(session.createdAt).getTime() < cutoff) {
      conversations.delete(id);
    }
  }
}, 30 * 60 * 1000);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", async (req, res) => {
  const ollamaOk = await isOllamaAvailable();
  const groqOk = isGroqConfigured();
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    ai: groqOk ? "groq" : ollamaOk ? "ollama" : "kb-fallback",
    groq: groqOk ? "configured" : "not configured",
    ollama: ollamaOk ? "connected" : "not running",
    activeSessions: conversations.size,
  });
});

// Get suggested questions & categories
app.get("/api/suggestions", (req, res) => {
  res.json({
    suggestions: getSuggestedQuestions(),
    categories: getCategories(),
  });
});

// Start a new session
app.post("/api/session", (req, res) => {
  const sessionId = uuidv4();
  getOrCreateSession(sessionId);
  res.json({ sessionId });
});

// Main chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required." });
  }

  if (message.trim().length > 500) {
    return res.status(400).json({ error: "Message is too long (max 500 chars)." });
  }

  // Get or create session
  const sid = sessionId || uuidv4();
  const session = getOrCreateSession(sid);

  // Build the user message object
  const userMsg = {
    id: uuidv4(),
    role: "user",
    content: message.trim(),
    timestamp: new Date().toISOString(),
  };
  session.messages.push(userMsg);

  try {
    const startTime = Date.now();
    const aiResult = await generateResponse(
      message.trim(),
      session.messages.slice(-10) // last 10 msgs for context
    );
    const latency = Date.now() - startTime;

    const assistantMsg = {
      id: uuidv4(),
      role: "assistant",
      content: aiResult.answer,
      timestamp: new Date().toISOString(),
      meta: {
        source: aiResult.source,
        category: aiResult.category,
        model: aiResult.model || null,
        latencyMs: latency,
      },
    };
    session.messages.push(assistantMsg);

    res.json({
      sessionId: sid,
      message: assistantMsg,
      ollamaAvailable: aiResult.ollamaAvailable,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({
      error: "Sorry, something went wrong. Please try again.",
      sessionId: sid,
    });
  }
});

// Get conversation history for a session
app.get("/api/session/:sessionId/history", (req, res) => {
  const session = conversations.get(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: "Session not found." });
  }
  res.json({ sessionId: session.id, messages: session.messages });
});

// Clear a session
app.delete("/api/session/:sessionId", (req, res) => {
  conversations.delete(req.params.sessionId);
  res.json({ success: true });
});

// ─── 404 & Error handlers ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🤖 AI Customer Support Agent — Backend`);
  console.log(`   Running on: http://localhost:${PORT}`);
  console.log(`   Health:     http://localhost:${PORT}/api/health`);
  console.log(`   Press Ctrl+C to stop\n`);
});

module.exports = app;
