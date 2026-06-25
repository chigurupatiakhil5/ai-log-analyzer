import { useState, useRef } from 'react'
import { uploadLog } from '../api/client'

export default function FileUpload({ onSuccess }) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  async function handleFile(file) {
    if (!file) return
    if (!file.name.endsWith('.log') && !file.name.endsWith('.txt')) {
      setError('Only .log or .txt files are supported')
      return
    }
    setError('')
    setLoading(true)
    try {
      const result = await uploadLog(file)
      onSuccess(result, file)
    } catch {
      setError('Upload failed. Make sure the backend is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-16 space-y-6">

      {/* Hero text */}
      <div className="text-center space-y-3 mb-4">
        <h2 className="text-3xl font-semibold tracking-tight" style={{ color: '#e2e0ff' }}>
          Analyze your logs with AI
        </h2>
        <p className="text-sm" style={{ color: 'rgba(167,139,250,0.6)' }}>
          Upload a server log file and ask questions in plain English
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => !loading && inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className="w-full max-w-3xl rounded-2xl p-24 text-center cursor-pointer transition-all duration-300"
        style={{
          border: `2px dashed ${dragging ? '#a78bfa' : 'rgba(167,139,250,0.25)'}`,
          background: dragging
            ? 'rgba(167,139,250,0.08)'
            : 'rgba(167,139,250,0.03)',
          boxShadow: dragging ? '0 0 40px rgba(167,139,250,0.12)' : 'none',
          pointerEvents: loading ? 'none' : 'auto',
          opacity: loading ? 0.7 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".log,.txt"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {loading ? (
          <div className="space-y-4">
            <div
              className="w-12 h-12 rounded-full mx-auto animate-spin"
              style={{ border: '2px solid rgba(167,139,250,0.2)', borderTopColor: '#a78bfa' }}
            />
            <div>
              <p className="text-zinc-200 font-medium">Processing your log file</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(167,139,250,0.5)' }}>
                Parsing, embedding and indexing chunks...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-2xl"
              style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}
            >
              📄
            </div>
            <div>
              <p className="font-medium text-zinc-200">Drop your log file here</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(167,139,250,0.5)' }}>
                or click to browse
              </p>
            </div>
            <p className="text-xs text-zinc-700">Supports .log and .txt files</p>
          </div>
        )}
      </div>

      {error && (
        <p
          className="text-sm rounded-xl px-4 py-2.5"
          style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
