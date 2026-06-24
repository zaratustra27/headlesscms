'use client'

import {searchQuery} from '@/lib/functions'
import {SearchResults} from '@/lib/types'
import Link from 'next/link'
import {useSearchParams} from 'next/navigation'
import {useCallback, useEffect, useRef, useState} from 'react'

/**
 * Search component.
 */
export default function Search() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResults[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update query state if URL parameter changes
  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  // Perform the search.
  const performSearch = useCallback(async (searchQueryString: string) => {
    // If the query is empty or too long, return early.
    if (searchQueryString.length === 0 || searchQueryString.length > 100) return

    setIsSearching(true)
    setHasSearched(true)

    try {
      const data = await searchQuery(searchQueryString)
      setResults(data)
    } catch (error) {
      console.error(error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounce the search query.
  useEffect(() => {
    if (query.length > 0) {
      const debounceTimeout = setTimeout(() => performSearch(query), 500)
      return () => clearTimeout(debounceTimeout)
    } else {
      setResults([])
      setHasSearched(false)
    }
  }, [query, performSearch])

  // Reset the search.
  function resetSearch() {
    setIsSearching(false)
    setQuery('')
    setResults([])
    setHasSearched(false)
  }

  return (
    <>
      <div className="relative flex items-center gap-4 pb-8">
        <input
          aria-label="Search"
          className="w-full rounded-lg border p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          name="search"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Begin typing to search..."
          ref={inputRef}
          type="search"
          value={query}
        />
        <button
          aria-label="reset search"
          onClick={resetSearch}
          type="reset"
          className="rounded-lg bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300"
        >
          Reset
        </button>
      </div>

      {query.length > 0 && !hasSearched && (
        <p className="m-0 italic">Searching...</p>
      )}
      {!isSearching && hasSearched && results.length === 0 && (
        <p className="m-0 text-red-600">
          Bummer. No results found for &quot;{query}&quot;.
        </p>
      )}
      {!isSearching && results.length > 0 && (
        <div className="w-full">
          <p className="mb-6">
            Nice! You found{' '}
            <span className="border-b-2 border-orange-300 font-bold">
              {results.length}
            </span>{' '}
            results for{' '}
            <span className="rounded bg-orange-100 px-2 py-1 font-medium text-zinc-800">
              &quot;{query}&quot;
            </span>
          </p>
          <div className="grid gap-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md"
              >
                <Link
                  href={result.url
                    .replace('http://localhost/nextjs', '')
                    .replace('https://blog.', 'https://')}
                  onClick={resetSearch}
                  className="block"
                >
                  <h3
                    className="m-0 text-xl font-bold text-blue-600 hover:underline"
                    dangerouslySetInnerHTML={{__html: result.title}}
                  />
                  <p className="mt-1 text-sm tracking-wider text-gray-500 uppercase">
                    {result.subtype || result.type}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
