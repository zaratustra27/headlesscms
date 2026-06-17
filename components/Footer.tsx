'use client'

import config from '@/lib/config'

/**
 * Footer component.
 */
export default function Footer() {
  return (
    <footer className="border-t-2 p-8 text-center text-sm">
      &copy; 2025-{new Date().getFullYear()} - {config.siteName} by{' '}
      <a href="https://demo.myprompt.website">My Prompt Website</a> |{' '}
      
    </footer>
  )
}
