'use client'

import { useEffect, useState, useRef } from 'react'
import styles from "./home.module.css";
import { welcomeMessage, API_BASE_URL } from '../utils/constants';

export default function Home() {
  const neofetchBanner = `
    ╔════════════════════════════════════════════════════════════════╗
    ║                                                                ║
    ║   ██████╗  ██████╗  ██████╗ ███████╗██╗██╗                    ║
    ║   ██╔══██╗██╔══██╗██╔══██╗██╔════╝██║██║                    ║
    ║   ██████╔╝███████║███████║███████╗██║██║                    ║
    ║   ██╔══██╗██╔══██║██╔══██║╚════██║██║██║                    ║
    ║   ██████╔╝██║  ██║██║  ██║███████║██║███████╗               ║
    ║   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚══════╝               ║
    ║                                                                ║
    ╚════════════════════════════════════════════════════════════════╝

    root@baasil
    ────────────────────────────────────────────────────────────────
    OS: Neural Interface v2.0.1
    Host: AI Terminal Framework
    Kernel: RAG-Linux 6.x-quantum
    Uptime: Just booted
    Shell: bash 5.0.3
    Resolution: Infinite x Dynamic
    Terminal: BAASIL_AI_TERM
    CPU: DeepSeek-R1 @ Neural Hz
    Memory: Knowledge Base [LOADED]
    ────────────────────────────────────────────────────────────────
    Status: ONLINE | Ready for queries
  `;

  const [isVisible, setIsVisible] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'system', content: neofetchBanner, timestamp: Date.now() }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingMessageId, setTypingMessageId] = useState(null)
  const [isClient, setIsClient] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const typingIntervalRef = useRef(null)

  useEffect(() => {
    // Mark as client-side to prevent hydration issues
    setIsClient(true)
    
    // Trigger fade-in effect after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive, but only if user hasn't scrolled up
    // Allow manual scrolling during typing animation
    const container = messagesEndRef.current?.parentElement?.parentElement
    if (container) {
      const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100
      if (isScrolledToBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [messages])

  // Typewriter effect function
  const typeMessage = (message, callback) => {
    const messageId = Date.now()
    setTypingMessageId(messageId)
    setIsTyping(true)
    
    // Add empty message first
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      timestamp: messageId,
      isTyping: true
    }])
    
    let currentIndex = 0
    const typingSpeed = 5 // milliseconds per character - much faster
    
    typingIntervalRef.current = setInterval(() => {
      if (currentIndex <= message.length) {
        setMessages(prev => prev.map(msg => 
          msg.timestamp === messageId 
            ? { ...msg, content: message.slice(0, currentIndex) }
            : msg
        ))
        currentIndex++
      } else {
        clearInterval(typingIntervalRef.current)
        setMessages(prev => prev.map(msg => 
          msg.timestamp === messageId 
            ? { ...msg, isTyping: false }
            : msg
        ))
        setIsTyping(false)
        setTypingMessageId(null)
        if (callback) callback()
      }
    }, typingSpeed)
  }

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus()
    
    // Start typing welcome message after 5 seconds to appreciate the banner
    const welcomeTimer = setTimeout(() => {
      typeMessage(welcomeMessage)
    }, 5000) // 5 second delay to appreciate the banner
    
    return () => {
      clearTimeout(welcomeTimer)
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isTyping) return

    const userMessage = { role: 'user', content: input.trim(), timestamp: Date.now() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call the backend search endpoint
      const response = await fetch(`${API_BASE_URL}/search`, {
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
    // Clear any ongoing typing
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
    }
    setIsTyping(false)
    setTypingMessageId(null)
    
    setMessages([
      { role: 'system', content: neofetchBanner, timestamp: Date.now() }
    ])
    
    // Type welcome message after clearing
    setTimeout(() => {
      typeMessage(welcomeMessage)
    }, 800) // Shorter delay after clearing
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
            // Find the latest SYSTEM (assistant) message index
            const latestSystemIndex = messages.map((msg, idx) => msg.role === 'assistant' ? idx : -1)
                                           .filter(idx => idx !== -1)
                                           .pop()
            
            const isLatestSystem = message.role === 'assistant' && index === latestSystemIndex
            
            return (
              <div key={index} className={`${styles.message} ${styles[message.role]} ${isLatestSystem ? styles.latest : ''}`}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageRole}>
                    {message.role === 'user' ? '> USER' : 
                     message.role === 'assistant' ? '> SYSTEM' : '> SYS'}
                  </span>
                  <span className={styles.timestamp}>
                    {isClient ? new Date(message.timestamp).toLocaleTimeString() : '--:--:--'}
                  </span>
                </div>
                <div className={styles.messageContent}>
                  {message.content}
                  {message.isTyping && <span className={styles.typingCursor}>_</span>}
                </div>
              </div>
            )
          })}
          
          {isLoading && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.messageHeader}>
                <span className={styles.messageRole}>&gt; SYSTEM</span>
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