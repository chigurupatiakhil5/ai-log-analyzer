import { useState, useEffect } from 'react'
import FileUpload from './components/FileUpload'
import SpikeReport from './components/SpikeReport'
import ChatBox from './components/ChatBox'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default function App() {
  const [sessionId, setSessionId] = useState(null)
  const [spikeReport, setSpikeReport] = useState(null)
  const [fileName, setFileName] = useState('')
  const [chunkCount, setChunkCount] = useState(0)
  const [backendReady, setBackendReady] = useState(false)

  useEffect(() => {
    const wake = async () => {
      try {
        await fetch(`${BASE_URL}/health`)
        setBackendReady(true)
      } catch {
        setBackendReady(false)
      }
    }
    wake()
  }, [])

  function handleUploadSuccess(result, file) {
    setSessionId(result.session_id)
    setSpikeReport(result.spike_report)
    setChunkCount(result.chunk_count)
    setFileName(file.name)
  }

  function handleReset() {
    setSessionId(null)
    setSpikeReport(null)
    setFileName('')
    setChunkCount(0)
  }

  return (
    <div className="min-h-screen text-zinc-100" style={{ background: 'linear-gradient(135deg, #1e1b3a 0%, #1a1a2e 60%, #1e1b3a 100%)' }}>

      {/* Header — no border, just subtle blur */}
      <header
        className="px-8 py-4"
        style={{ background: 'rgba(26,26,46,0.7)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50 }}
      >
        <div className="flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white transition-all duration-200 group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)' }}
            >
              AI
            </div>
            <div className="text-left">
              <h1 className="text-sm font-semibold text-zinc-100 leading-none">AI Log Analyzer</h1>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(167,139,250,0.55)' }}>
                Semantic search + LLM analysis
              </p>
            </div>
          </button>

          {sessionId && (
            <div className="flex items-center gap-2 text-xs">
              <span style={{ color: '#86efac' }}>✓</span>
              <span className="font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{fileName}</span>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>{chunkCount} chunks indexed</span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      {!sessionId ? (
        <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-16">
          {!backendReady && (
            <div
              className="mb-4 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2"
              style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', color: 'rgba(167,139,250,0.7)' }}
            >
              <div className="w-3 h-3 rounded-full animate-spin flex-shrink-0" style={{ border: '1.5px solid rgba(167,139,250,0.2)', borderTopColor: '#a78bfa' }} />
              Waking up backend — first load may take ~30 seconds…
            </div>
          )}
          <FileUpload onSuccess={handleUploadSuccess} />
        </div>
      ) : (
        <div className="flex gap-6 p-8 h-[calc(100vh-64px)]">
          {/* Left column — spike report */}
          <div className="w-72 flex-shrink-0 space-y-6">
            <SpikeReport report={spikeReport} />
          </div>

          {/* Divider */}
          <div className="w-px" style={{ background: 'rgba(167,139,250,0.1)' }} />

          {/* Right column — chat */}
          <div className="flex-1 flex flex-col min-h-0">
            <ChatBox sessionId={sessionId} />
          </div>
        </div>
      )}
    </div>
  )
}
