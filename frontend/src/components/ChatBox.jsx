import { useState, useRef, useEffect } from 'react'
import { queryLog } from '../api/client'

const SUGGESTIONS = [
  'What errors occurred?',
  'What caused the spike?',
  'Summarize the log',
]

export default function ChatBox({ sessionId }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e) {
    e?.preventDefault()
    if (!question.trim() || loading) return

    const q = question.trim()
    setQuestion('')
    setLoading(true)
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: q },
      { role: 'assistant', content: '' },
    ])

    try {
      await queryLog(sessionId, q, (token) => {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + token,
          }
          return updated
        })
      })
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1].content = 'Error: Could not get a response. Is the backend running?'
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(167,139,250,0.5)' }}>
        Ask a Question
      </h2>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setQuestion(s)}
              className="text-xs rounded-xl px-3 py-2 transition-all duration-200 hover:scale-105"
              style={{
                color: 'rgba(167,139,250,0.8)',
                background: 'rgba(167,139,250,0.08)',
                border: '1px solid rgba(167,139,250,0.2)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1"
                  style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', color: 'white' }}
                >
                  AI
                </div>
              )}
              <div
                className="max-w-prose rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={
                  msg.role === 'user'
                    ? {
                        background: 'rgba(167,139,250,0.12)',
                        border: '1px solid rgba(167,139,250,0.2)',
                        color: '#e2e0ff',
                      }
                    : {
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#d4d4d8',
                        fontFamily: 'ui-monospace, monospace',
                      }
                }
              >
                {msg.content || (
                  loading && i === messages.length - 1 ? (
                    <span
                      className="inline-block w-2 h-4 rounded-sm animate-pulse"
                      style={{ background: '#a78bfa' }}
                    />
                  ) : null
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. what errors occurred? what caused the spike?"
          disabled={loading}
          className="flex-1 rounded-xl px-4 py-3 text-sm text-zinc-100 outline-none transition-all duration-200 disabled:opacity-50"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(167,139,250,0.2)',
          }}
          onFocus={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.5)'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(167,139,250,0.2)'}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
          style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', color: 'white' }}
        >
          →
        </button>
      </form>
    </div>
  )
}
