import Pagination from '@/components/Pagination'
import getCategoryBySlug, {
  getCategoryPaginationMap
} from '@/lib/queries/getCategoryBySlug'
import type {DynamicPageProps, Post} from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'

const POSTS_PER_PAGE = 12

/**
 * The category archive route.
 */
export default async function Category({
  params,
  searchParams
}: Readonly<DynamicPageProps>) {
  // Get the slug and page number from the params and search params.
  const {slug} = await params
  const {page} = await searchParams
  const currentPage = typeof page === 'string' ? parseInt(page) : 1

  // Fetch all cursors for this category to build the pagination map.
  const allCursors = await getCategoryPaginationMap(slug)
  const totalPosts = allCursors.length
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE)

  // Determine the cursor for the current page.
  const cursorIndex = (currentPage - 1) * POSTS_PER_PAGE - 1
  const afterCursor = cursorIndex >= 0 ? allCursors[cursorIndex] : ''

  // Fetch posts by category from WordPress with pagination.
  const data = await getCategoryBySlug(slug, POSTS_PER_PAGE, afterCursor)
  const posts = data?.nodes

  // No posts? Bail...
  if (!posts?.length && currentPage !== 1) {
    notFound()
  }

  return (
    <main className="flex flex-col gap-12 py-8">
      <header className="container mx-auto px-4">
        <h1 className="text-4xl font-bold capitalize">
          Category: {slug.replace('-', ' ')}
        </h1>
      </header>

      {posts?.length ? (
        <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: Post, index: number) => (
            <article className="flex flex-col gap-4" key={post.databaseId}>
              <Link
                className="group relative block h-64 w-full overflow-hidden rounded-lg"
                href={`/${post.slug}`}
              >
                {post.featuredImage?.node ? (
                  <Image
                    alt={post.featuredImage.node.altText ?? post.title ?? ''}
                    fill
                    src={post.featuredImage.node.sourceUrl ?? ''}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority={index < 3}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-6 text-center transition-colors group-hover:bg-black/50">
                  <h2
                    className="text-2xl font-bold text-white"
                    dangerouslySetInnerHTML={{__html: post.title ?? ''}}
                  />
                </div>
              </Link>
              <div className="flex flex-col gap-2">
                <div
                  className="line-clamp-3 text-gray-700"
                  dangerouslySetInnerHTML={{__html: post.excerpt ?? ''}}
                />
                <Link
                  className="mt-2 font-semibold text-blue-600 hover:underline"
                  href={`/${post.slug}`}
                >
                  Read More &rarr;
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <p>No posts found in this category.</p>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/category/${slug}`}
      />
    </main>
  )
}
