'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has already seen the loading page in this session
    const hasSeenLoading = sessionStorage.getItem('hasSeenLoading')
    
    if (!hasSeenLoading) {
      // First visit - redirect to loading page
      router.replace('/loading')
    } else {
      // Returning user in same session - go directly to home
      router.replace('/home')
    }
  }, [router])

  // Show nothing while redirecting
  return null
}
