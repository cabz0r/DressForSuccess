import React, { useState, useRef, useEffect } from 'react'
import { sendChat } from '../api'

interface Msg { role: 'user' | 'bot'; content: string }

const QUICK_REPLIES = ['Book an appointment', 'Browse the store', 'About referrals', 'Volunteer login']

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'bot', content: 'Hello! 👋 Welcome to Dress for Success. How can I help you today? I can help you book an appointment, browse our store, or answer any questions.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Msg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }))
      const res = await sendChat(text, history)
      setMessages(prev => [...prev, { role: 'bot', content: res.data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I\'m having trouble connecting. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div>
              <h3>💬 Dress for Success Assistant</h3>
              <p>We typically reply instantly</p>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}
                dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
            {loading && <div className="chat-msg bot typing">Typing...</div>}
            <div ref={bottomRef} />
          </div>
          <div className="chat-quick">
            {QUICK_REPLIES.map(q => (
              <button key={q} onClick={() => send(q)}>{q}</button>
            ))}
          </div>
          <div className="chat-input">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(input)}
              placeholder="Type a message..."
            />
            <button onClick={() => send(input)}>➤</button>
          </div>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen(o => !o)} title="Chat with us">
        {open ? '✕' : '💬'}
      </button>
    </>
  )
}

export default Chatbot

