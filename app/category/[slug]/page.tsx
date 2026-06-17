import getCategoryBySlug from '@/lib/queries/getCategoryBySlug'
import type {Post, DynamicPageProps} from '@/lib/types'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'

/**
 * The category archive route.
 */
export default async function Category({params}: Readonly<DynamicPageProps>) {
  // Get the slug from the params.
  const {slug} = await params

  // Fetch posts by category from WordPress.
  const posts = await getCategoryBySlug(slug)

  // No posts? Bail...
  if (!posts || posts.length === 0) {
    notFound()
  }

  return (
    <main className="flex flex-col gap-12 py-8">
      <header className="container mx-auto px-4">
        <h1 className="text-4xl font-bold capitalize">
          Category: {slug.replace('-', ' ')}
        </h1>
      </header>

      <div className="container mx-auto grid grid-cols-1 gap-12 px-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: Post, index: number) => (
          <article className="flex flex-col gap-4" key={post.databaseId}>
            {post.featuredImage?.node && (
              <Link
                className="block overflow-hidden rounded-lg"
                href={`/${post.slug}`}
              >
                <Image
                  alt={post.featuredImage.node.altText ?? post.title ?? ''}
                  height={post.featuredImage.node.mediaDetails?.height ?? 400}
                  src={post.featuredImage.node.sourceUrl ?? ''}
                  width={post.featuredImage.node.mediaDetails?.width ?? 600}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="h-64 w-full object-cover transition-transform duration-300 hover:scale-105"
                  priority={index < 3}
                />
              </Link>
            )}
            <div className="flex flex-col gap-2">
              <Link href={`/${post.slug}`}>
                <h2
                  className="text-2xl font-bold transition-colors hover:text-blue-600"
                  dangerouslySetInnerHTML={{__html: post.title ?? ''}}
                />
              </Link>
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
    </main>
  )
}
