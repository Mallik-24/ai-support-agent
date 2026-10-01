// ai-engine.js — AI response engine: Groq → Ollama → KB fallback
const axios = require("axios");
const Fuse = require("fuse.js");
const Groq = require("groq-sdk");
const knowledgeBase = require("../data/knowledge-base");

const OLLAMA_BASE = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";
const GROQ_MODEL = process.env.GROQ_MODEL || "compound-beta-mini";

// Init Groq client (uses GROQ_API_KEY env var automatically)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Fuse.js fuzzy search index over KB ──────────────────────────────────────
const fuseOptions = {
  keys: [
    { name: "questions", weight: 0.6 },
    { name: "tags", weight: 0.3 },
    { name: "answer", weight: 0.1 },
  ],
  threshold: 0.6,        // more permissive — catches more question variants
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

// Keep questions as array so Fuse searches each variant individually
const flatKB = knowledgeBase.map((entry) => ({
  ...entry,
  tags: entry.tags.join(" "),
}));

const fuse = new Fuse(flatKB, fuseOptions);

// ─── Detect if message is conversational (not a support question) ─────────────
function isConversational(message) {
  const text = message.toLowerCase().trim();
  const patterns = [
    /^(hi|hello|hey|howdy|hiya|sup|yo)\b/,
    /^how are you/,
    /^how('s| is) it going/,
    /^what('s| is) up/,
    /^good (morning|afternoon|evening|night)/,
    /^thanks?(\s|!|$)/,
    /^thank you/,
    /^ok(ay)?(\s|!|$)/,
    /^bye|goodbye|see you|cya/,
    /^nice|great|awesome|cool|wow/,
    /^lol|haha|😂|😊|👍/,
    /^who are you/,
    /^what (can|do) you (do|help)/,
  ];
  return patterns.some((p) => p.test(text));
}

// ─── KB fuzzy search ──────────────────────────────────────────────────────────
function searchKnowledgeBase(userQuestion) {
  // Skip KB for conversational messages — let LLM handle them naturally
  if (isConversational(userQuestion)) return null;

  const results = fuse.search(userQuestion);
  if (!results.length) return null;
  // Accept match if score is within acceptable range (lower score = better match in Fuse)
  if (results[0].score > 0.8) return null;
  return results[0].item;
}

// ─── Build KB context string ──────────────────────────────────────────────────
function buildKBContext(kbEntry) {
  const tags = Array.isArray(kbEntry.tags) ? kbEntry.tags.join(", ") : kbEntry.tags;
  return `Category: ${kbEntry.category}\nQuestion type: ${tags}\nAnswer: ${kbEntry.answer}`;
}

// ─── Build full KB summary for general context ────────────────────────────────
function buildFullKBSummary() {
  const categories = [...new Set(knowledgeBase.map((e) => e.category))];
  return `We handle support for: ${categories.join(", ")}. Topics include orders, tracking, returns, refunds, shipping, payment methods, promo codes, account management, warranties, and more.`;
}

// ─── System prompt builder ────────────────────────────────────────────────────
function buildSystemPrompt(kbEntry) {
  const kbContext = kbEntry
    ? `Relevant knowledge base entry:\n${buildKBContext(kbEntry)}`
    : `No specific FAQ matched. General store info:\n${buildFullKBSummary()}`;

  return `You are a friendly, helpful AI Customer Support Agent for an online store.

${kbContext}

Guidelines:
- For greetings like "hi", "hello", "how are you" — respond warmly and naturally, then offer to help
- For support questions — use the knowledge base context as your primary source
- Keep responses concise, clear and friendly
- Use markdown formatting (bold, bullet points) when it helps readability
- If you genuinely don't know something, say so and offer to connect them with a human agent
- Never make up prices, policies or order details not in the context
- Keep responses under 180 words unless detail is truly needed`;
}

// ─── Groq LLM call ────────────────────────────────────────────────────────────
async function callGroq(userMessage, kbEntry, conversationHistory = []) {
  const systemPrompt = buildSystemPrompt(kbEntry);

  // Build message history (last 8 messages for context)
  const historyMessages = conversationHistory
    .slice(-8)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

  const messages = [
    { role: "system", content: systemPrompt },
    ...historyMessages,
    { role: "user", content: userMessage },
  ];

  const completion = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 400,
  });

  const raw = completion.choices[0]?.message?.content || "";
  // Strip <think>...</think> reasoning blocks some models output
  return raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

// ─── Check Groq availability ──────────────────────────────────────────────────
function isGroqConfigured() {
  const key = process.env.GROQ_API_KEY;
  return !!key && key !== "your_groq_api_key_here" && key.startsWith("gsk_");
}

// ─── Check Ollama availability ────────────────────────────────────────────────
async function isOllamaAvailable() {
  try {
    const res = await axios.get(`${OLLAMA_BASE}/api/tags`, { timeout: 2000 });
    const models = res.data?.models || [];
    return res.status === 200 && models.length > 0;
  } catch {
    return false;
  }
}

// ─── Ollama chat call ─────────────────────────────────────────────────────────
async function callOllama(userMessage, kbEntry, conversationHistory = []) {
  const systemPrompt = buildSystemPrompt(kbEntry);

  const res = await axios.get(`${OLLAMA_BASE}/api/tags`, { timeout: 2000 });
  const models = (res.data.models || []).map((m) => m.name);
  const model = models[0] || OLLAMA_MODEL;

  const historyMessages = conversationHistory
    .slice(-8)
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

  const payload = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: userMessage },
    ],
    stream: false,
    options: { temperature: 0.7, num_predict: 400 },
  };

  const chatRes = await axios.post(`${OLLAMA_BASE}/api/chat`, payload, {
    timeout: 30000,
  });

  return { answer: chatRes.data.message?.content || "", model };
}

// ─── KB-only fallback ─────────────────────────────────────────────────────────
function generateKBResponse(kbEntry, userMessage) {
  // Handle conversational greetings without needing AI
  if (isConversational(userMessage)) {
    return {
      answer:
        "👋 **Hello! I'm your AI Customer Support Assistant.**\n\nI'm here to help you with:\n- 📦 Orders & Tracking\n- 🔄 Returns & Refunds\n- 🚚 Shipping & Delivery\n- 💳 Payments & Promo Codes\n- 👤 Account Management\n- 🛍️ Products & Warranty\n\nWhat can I help you with today?",
      source: "knowledge_base",
      category: "General",
    };
  }

  if (!kbEntry) {
    return {
      answer:
        "I don't have specific information about that right now. Could you please **rephrase your question**, or I can connect you with a human support agent?\n\n📞 Phone: 1-800-123-4567\n📧 Email: support@example.com\n💬 Live Chat available 24/7 on our website",
      source: "fallback",
      category: "General",
    };
  }
  return {
    answer: kbEntry.answer,
    source: "knowledge_base",
    category: kbEntry.category,
    matchedId: kbEntry.id,
  };
}

// ─── Main response function ───────────────────────────────────────────────────
async function generateResponse(userMessage, conversationHistory = []) {
  const kbEntry = searchKnowledgeBase(userMessage);

  // 1. Try Groq first (fast, free, no local setup needed)
  if (isGroqConfigured()) {
    try {
      const answer = await callGroq(userMessage, kbEntry, conversationHistory);
      if (answer) {
        return {
          answer,
          source: "groq",
          model: GROQ_MODEL,
          category: kbEntry?.category || "General",
          ollamaAvailable: false,
        };
      }
    } catch (err) {
      console.warn("Groq call failed:", err.message);
    }
  }

  // 2. Try Ollama (local LLM, if running with a model)
  const ollamaAvailable = await isOllamaAvailable();
  if (ollamaAvailable) {
    try {
      const { answer, model } = await callOllama(
        userMessage,
        kbEntry,
        conversationHistory
      );
      if (answer) {
        return {
          answer,
          source: "ollama",
          model,
          category: kbEntry?.category || "General",
          ollamaAvailable: true,
        };
      }
    } catch (err) {
      console.warn("Ollama call failed:", err.message);
    }
  }

  // 3. KB-only fallback
  const response = generateKBResponse(kbEntry, userMessage);
  return { ...response, ollamaAvailable };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getCategories() {
  return [...new Set(knowledgeBase.map((e) => e.category))];
}

function getSuggestedQuestions() {
  return [
    "Where is my order?",
    "How do I return an item?",
    "What payment methods do you accept?",
    "How long does shipping take?",
    "I forgot my password",
    "What is your warranty policy?",
    "How do I apply a promo code?",
    "Do you offer free shipping?",
    "How do I cancel my order?",
    "How do I contact support?",
  ];
}

module.exports = {
  generateResponse,
  searchKnowledgeBase,
  isOllamaAvailable,
  isGroqConfigured,
  getCategories,
  getSuggestedQuestions,
};
