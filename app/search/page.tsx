import SearchForm from '@/components/SearchForm'
import { Suspense } from 'react'

/**
 * Search page.
 */
export default function Page() {
  const title = 'Search'
  return (
    <main className="flex flex-col gap-8">
      <h1>{title}</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <SearchForm />
      </Suspense>
    </main>
  )
}