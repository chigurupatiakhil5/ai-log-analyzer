const BASE_URL = 'http://127.0.0.1:8000'

export async function uploadLog(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE_URL}/upload`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function queryLog(sessionId, question, onToken) {
  const res = await fetch(`${BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, question }),
  })
  if (!res.ok) throw new Error(await res.text())

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onToken(decoder.decode(value))
  }
}
