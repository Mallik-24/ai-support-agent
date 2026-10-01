import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format } from 'date-fns'
import './App.css'

// ─── Floating particles background ───────────────────────────────────────────
function FloatingParticles() {
  return (
    <div aria-hidden="true" className="particles-bg">
      {Array.from({ length: 18 }, (_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${5 + (i * 97 / 18) % 95}%`,
            width: `${4 + (i % 5) * 3}px`,
            height: `${4 + (i % 5) * 3}px`,
            background: i % 3 === 0
              ? 'rgba(99,102,241,0.55)'
              : i % 3 === 1
              ? 'rgba(192,132,252,0.45)'
              : 'rgba(56,189,248,0.45)',
            animationDuration: `${12 + (i * 3.7) % 16}s`,
            animationDelay: `${(i * 2.1) % 14}s`,
            bottom: `-${8 + (i % 4) * 6}px`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Helper: format timestamp ─────────────────────────────────────────────────
function formatTime(isoString) {
  try {
    return format(new Date(isoString), 'h:mm a')
  } catch {
    return ''
  }
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="message-row assistant" role="status" aria-label="Agent is typing">
      <div className="avatar agent-avatar" aria-hidden="true">🤖</div>
      <div className="bubble typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div className="avatar agent-avatar" aria-hidden="true">🤖</div>
      )}
      <div className={`bubble ${isUser ? 'user-bubble' : 'agent-bubble'}`}>
        {isUser ? (
          <p className="message-text">{message.content}</p>
        ) : (
          <div className="message-text markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div className="message-meta">
          {message.meta?.source && (
            <span className={`source-badge ${message.meta.source}`}>
              {message.meta.source === 'groq'
                ? '⚡ Groq AI'
                : message.meta.source === 'ollama'
                ? '🧠 Ollama'
                : message.meta.source === 'knowledge_base'
                ? '📚 KB'
                : '💬'}
            </span>
          )}
          <span className="timestamp">{formatTime(message.timestamp)}</span>
        </div>
      </div>
      {isUser && (
        <div className="avatar user-avatar" aria-hidden="true">👤</div>
      )}
    </div>
  )
}

// ─── Suggestion chips ─────────────────────────────────────────────────────────
function SuggestionChips({ suggestions, onSelect, disabled }) {
  if (!suggestions.length) return null
  return (
    <div className="suggestions-container" role="group" aria-label="Suggested questions">
      <p className="suggestions-label">💡 Common questions:</p>
      <div className="chips">
        {suggestions.map((s) => (
          <button
            key={s}
            className="chip"
            onClick={() => onSelect(s)}
            disabled={disabled}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState(null)
  const [isOnline, setIsOnline] = useState(null) // null = checking
  const [showSuggestions, setShowSuggestions] = useState(true)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const chatBoxRef = useRef(null)

  // ── Auto-scroll to bottom ───────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // ── Initialize: create session + fetch suggestions ──────────────────────────
  useEffect(() => {
    async function init() {
      try {
        // Check health
        const health = await axios.get('/api/health')
        setIsOnline(health.data.status === 'ok')

        // Create session
        const sessionRes = await axios.post('/api/session')
        setSessionId(sessionRes.data.sessionId)

        // Fetch suggestions
        const suggestRes = await axios.get('/api/suggestions')
        setSuggestions(suggestRes.data.suggestions || [])
        setCategories(suggestRes.data.categories || [])

        // Welcome message
        setMessages([
          {
            id: 'welcome',
            role: 'assistant',
            content:
              "👋 **Hi there! I'm your AI Customer Support Assistant.**\n\nI can help you with orders, returns, shipping, payments, account issues, and more. Ask me anything or pick a question below!",
            timestamp: new Date().toISOString(),
            meta: { source: 'system' },
          },
        ])
      } catch (err) {
        console.error('Init error:', err)
        setIsOnline(false)
        setError('Unable to connect to the support backend. Please ensure the server is running on port 3001.')
      }
    }
    init()
  }, [])

  // ── Send a message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || input).trim()
      if (!trimmed || isLoading) return

      setInput('')
      setError(null)
      setShowSuggestions(false)

      const userMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)

      try {
        const res = await axios.post('/api/chat', {
          message: trimmed,
          sessionId,
        })

        const agentMsg = res.data.message
        setMessages((prev) => [...prev, agentMsg])
        if (!res.data.ollamaAvailable && agentMsg.meta?.source !== 'ollama') {
          // silently note KB mode — no banner needed
        }
      } catch (err) {
        console.error('Chat error:', err)
        const errorMsg =
          err.response?.data?.error || 'Something went wrong. Please try again.'
        setError(errorMsg)
        // Remove the user message optimistic update if request failed
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
      } finally {
        setIsLoading(false)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    },
    [input, isLoading, sessionId]
  )

  // ── Handle form submit ───────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  // ── Handle Enter key ─────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Clear chat ────────────────────────────────────────────────────────────────
  const clearChat = async () => {
    if (sessionId) {
      try {
        await axios.delete(`/api/session/${sessionId}`)
        const newSession = await axios.post('/api/session')
        setSessionId(newSession.data.sessionId)
      } catch {
        // ignore
      }
    }
    setMessages([
      {
        id: 'welcome-new',
        role: 'assistant',
        content: "Chat cleared! 👋 How can I help you today?",
        timestamp: new Date().toISOString(),
        meta: { source: 'system' },
      },
    ])
    setShowSuggestions(true)
    setError(null)
    inputRef.current?.focus()
  }

  const hasMessages = messages.length > 0
  const charCount = input.length
  const maxChars = 500

  return (
    <div className="app-container">
      <FloatingParticles />
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="chat-header" role="banner">
        <div className="header-left">
          <div className="brand-icon" aria-hidden="true">🤖</div>
          <div className="brand-info">
            <h1 className="brand-name">AI Support Agent</h1>
            <p className="brand-status">
              <span
                className={`status-dot ${isOnline === null ? 'checking' : isOnline ? 'online' : 'offline'}`}
                aria-hidden="true"
              />
              <span className="status-text">
                {isOnline === null ? 'Connecting…' : isOnline ? 'Online' : 'Offline'}
              </span>
            </p>
          </div>
        </div>
        <div className="header-right">
          {categories.length > 0 && (
            <div className="category-pills" aria-label="Topics covered">
              {categories.slice(0, 3).map((c) => (
                <span key={c} className="category-pill">{c}</span>
              ))}
            </div>
          )}
          <button
            className="clear-btn"
            onClick={clearChat}
            disabled={isLoading}
            title="Start a new conversation"
            aria-label="Clear conversation and start over"
            type="button"
          >
            🔄 New Chat
          </button>
        </div>
      </header>

      {/* ── Chat body ──────────────────────────────────────────────────────── */}
      <main className="chat-body" ref={chatBoxRef} role="main">
        <div
          className="messages-list"
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          {!hasMessages && (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">💬</div>
              <p>Start a conversation below</p>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        {/* ── Suggestion chips ─────────────────────────────────────────── */}
        {showSuggestions && suggestions.length > 0 && !isLoading && (
          <SuggestionChips
            suggestions={suggestions.slice(0, 8)}
            onSelect={sendMessage}
            disabled={isLoading}
          />
        )}
      </main>

      {/* ── Error banner ───────────────────────────────────────────────────── */}
      {error && (
        <div className="error-banner" role="alert">
          <span>⚠️ {error}</span>
          <button
            className="error-dismiss"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            type="button"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Input area ─────────────────────────────────────────────────────── */}
      <footer className="chat-footer" role="contentinfo">
        <form className="input-form" onSubmit={handleSubmit} noValidate>
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              className="message-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question here… (Enter to send)"
              disabled={isLoading || isOnline === false}
              maxLength={maxChars}
              rows={1}
              aria-label="Message input"
              aria-describedby="char-count"
            />
            <div className="input-meta">
              <span
                id="char-count"
                className={`char-count ${charCount > 400 ? 'warn' : ''}`}
                aria-live="polite"
              >
                {charCount}/{maxChars}
              </span>
            </div>
          </div>
          <button
            className="send-btn"
            type="submit"
            disabled={!input.trim() || isLoading || isOnline === false}
            aria-label="Send message"
          >
            {isLoading ? (
              <span className="spinner" aria-hidden="true" />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </form>
        <p className="footer-note">
          Powered by AI · Responses may not be 100% accurate · For urgent help call{' '}
          <a href="tel:18001234567">1-800-123-4567</a>
        </p>
      </footer>
    </div>
  )
}
