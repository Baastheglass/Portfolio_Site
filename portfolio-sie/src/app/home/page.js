'use client'

import { useEffect, useState, useRef } from 'react'
import styles from "./home.module.css";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'system', content: 'BAASIL_AI_TERMINAL v2.0.1 initialized...\nRAG System: ONLINE | Knowledge Base: LOADED | Status: READY', timestamp: Date.now() }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    // Trigger fade-in effect after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input.trim(), timestamp: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call the backend search endpoint
      const response = await fetch('http://localhost:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const aiResponse = {
        role: 'assistant',
        content: data.results || 'No response received from the AI.',
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error calling backend:', error)
      const errorResponse = {
        role: 'assistant',
        content: `Error: Unable to connect to the AI service. Please make sure the backend server is running.\n\nDetails: ${error.message}`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const clearTerminal = () => {
    setMessages([
      { role: 'system', content: 'Terminal cleared. BAASIL_AI_TERMINAL ready...', timestamp: Date.now() }
    ])
  }

  return (
    <div className={`${styles.container} ${isVisible ? styles.fadeIn : styles.fadeOut}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.prompt}>baasil@ai-terminal:~$</span>
          <span className={styles.subtitle}>Neural Interface v2.0.1</span>
        </div>
        <button onClick={clearTerminal} className={styles.clearBtn}>
          [CLEAR]
        </button>
      </div>

      {/* Messages Area */}
      <div className={styles.messagesContainer}>
        <div className={styles.messages}>
          {messages.map((message, index) => {
            // Find the latest system message index
            const latestSystemIndex = messages.map((msg, idx) => msg.role === 'system' ? idx : -1)
                                           .filter(idx => idx !== -1)
                                           .pop()
            
            const isLatestSystem = message.role === 'system' && index === latestSystemIndex
            
            return (
              <div key={index} className={`${styles.message} ${styles[message.role]} ${isLatestSystem ? styles.latest : ''}`}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageRole}>
                    {message.role === 'user' ? '> USER' : 
                     message.role === 'assistant' ? '> AI' : '> SYS'}
                  </span>
                  <span className={styles.timestamp}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className={styles.messageContent}>
                  {message.content}
                </div>
              </div>
            )
          })}
          
          {isLoading && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.messageHeader}>
                <span className={styles.messageRole}>&gt; AI</span>
                <span className={styles.timestamp}>Processing...</span>
              </div>
              <div className={styles.messageContent}>
                <span className={styles.loadingDots}>Analyzing</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className={styles.inputArea}>
        <div className={styles.inputContainer}>
          <span className={styles.inputPrompt}>baasil@query:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your query..."
            className={styles.input}
            disabled={isLoading}
          />
          <button type="submit" disabled={!input.trim() || isLoading} className={styles.sendBtn}>
            [EXEC]
          </button>
        </div>
      </form>

      {/* Status Bar */}
      <div className={styles.statusBar}>
        <span className={styles.status}>
          STATUS: {isLoading ? 'PROCESSING' : 'READY'} | 
          MSGS: {messages.length} | 
          UPTIME: {Math.floor((Date.now() - messages[0]?.timestamp) / 1000)}s
        </span>
      </div>
    </div>
  );
}