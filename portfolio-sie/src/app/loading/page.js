'use client'

import { useState, useEffect } from 'react'
import styles from './loading.module.css'

export default function LoadingPage() {
  const loadingTexts = [
    "Initializing portfolio...",
    "Loading creative projects...",
    "Preparing visual elements...",
    "Optimizing user experience...",
    "Finalizing details...",
    "Almost ready...",
    "Welcome!"
  ]

  const [visibleTexts, setVisibleTexts] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < loadingTexts.length) {
      const timer = setTimeout(() => {
        setVisibleTexts(prev => [...prev, {
          text: loadingTexts[currentIndex],
          id: currentIndex,
          timestamp: Date.now()
        }])
        setCurrentIndex(prev => prev + 1)
      }, 800) // Delay between each text appearance

      return () => clearTimeout(timer)
    }
  }, [currentIndex, loadingTexts])

  // Auto-redirect after all texts are shown
  useEffect(() => {
    if (currentIndex >= loadingTexts.length) {
      const redirectTimer = setTimeout(() => {
        // Mark that user has seen the loading page
        sessionStorage.setItem('hasSeenLoading', 'true')
        // Redirect to home page
        window.location.href = '/home'
      }, 2000)

      return () => clearTimeout(redirectTimer)
    }
  }, [currentIndex, loadingTexts.length])

  return (
    <div className={styles.container}>
      <div className={styles.textContainer}>
        {visibleTexts.map((item, index) => (
          <div
            key={item.id}
            className={styles.cascadingText}
            style={{
              animationDelay: `${index * 0.2}s`,
              '--cascade-order': index
            }}
          >
            {item.text}
          </div>
        ))}
      </div>
      
      {/* Loading indicator */}
      <div className={styles.loadingIndicator}>
        <div className={styles.spinner}></div>
      </div>
    </div>
  )
}