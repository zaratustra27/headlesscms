'use client'

import {useRouter} from 'next/navigation'
import {useState} from 'react'

/**
 * Search box for the header that redirects to the search page.
 */
export default function HeaderSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <input
        type="search"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-32 rounded-full bg-gray-100 px-4 py-1.5 text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none md:w-48"
      />
      <button
        type="submit"
        className="absolute right-3 text-gray-500 hover:text-gray-700"
        aria-label="Search"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </button>
    </form>
  )
}
