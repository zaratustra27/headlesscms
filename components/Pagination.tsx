import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

/**
 * Pagination component with Google-style numbering.
 */
export default function Pagination({
  currentPage,
  totalPages,
  basePath
}: PaginationProps) {
  if (totalPages <= 1) return null

  const maxButtons = 10
  let startPage: number
  let endPage: number

  if (totalPages <= maxButtons) {
    // Show all pages if total is less than max
    startPage = 1
    endPage = totalPages
  } else {
    // Calculate start and end pages for the sliding window
    if (currentPage <= 6) {
      // Near the beginning
      startPage = 1
      endPage = 10
    } else if (currentPage + 4 >= totalPages) {
      // Near the end
      startPage = totalPages - 9
      endPage = totalPages
    } else {
      // Somewhere in the middle
      startPage = currentPage - 5
      endPage = currentPage + 4
    }
  }

  const pages = Array.from(
    {length: endPage - startPage + 1},
    (_, i) => startPage + i
  )

  /**
   * Helper to build the pagination URL.
   */
  const getPageUrl = (page: number) => {
    const connector = basePath.includes('?') ? '&' : '?'
    return page === 1 ? basePath : `${basePath}${connector}page=${page}`
  }

  return (
    <footer className="container mx-auto flex flex-wrap items-center justify-center gap-2 px-4 pb-12">
      {/* Previous Button */}
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="mr-2 flex h-10 items-center justify-center rounded-lg bg-gray-200 px-4 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
        >
          &larr; Prev
        </Link>
      )}

      {/* Numbered Buttons */}
      {pages.map((pageNumber) => (
        <Link
          key={pageNumber}
          className={`flex h-10 w-10 items-center justify-center rounded-lg font-semibold transition-colors ${
            pageNumber === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          href={getPageUrl(pageNumber)}
        >
          {pageNumber}
        </Link>
      ))}

      {/* Next Button */}
      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="ml-2 flex h-10 items-center justify-center rounded-lg bg-gray-200 px-4 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
        >
          Next &rarr;
        </Link>
      )}
    </footer>
  )
}
