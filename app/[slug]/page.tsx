import type {Category, Tag} from '@/lib/generated'
import getAllPosts from '@/lib/queries/getAllPosts'
import getPostBySlug from '@/lib/queries/getPostBySlug'
import type {DynamicPageProps} from '@/lib/types'
import {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {notFound} from 'next/navigation'

/**
 * Generate the static routes at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-static-params
 */
export async function generateStaticParams() {
  // Get blog posts.
  const data = await getAllPosts(100)
  const posts = data?.nodes

  // No posts? Bail...
  if (!posts) {
    return []
  }

  // Return the slugs for each post.
  return posts
    .filter((post: {slug?: string | null}) => post.slug)
    .map((post: {slug?: string | null}) => ({
      slug: post.slug as string
    }))
}

/**
 * Generate the metadata for each static route at build time.
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata#generatemetadata-function
 */
export async function generateMetadata({
  params
}: DynamicPageProps): Promise<Metadata | null> {
  // Get the slug from the params.
  const {slug} = await params

  // Get the blog post.
  const post = await getPostBySlug(slug)

  // No post? Bail...
  if (!post) {
    return {}
  }

  return {
    title: post.seo?.title ?? '',
    description: post.seo?.metaDesc ?? ''
  }
}

/**
 * The blog post route.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#pages
 */
export default async function Post({
  params,
  searchParams
}: Readonly<DynamicPageProps>) {
  // Get the slug from the params.
  const {slug} = await params
  const {horario} = await searchParams

  // Fetch a single post from WordPress.
  const post = await getPostBySlug(slug)

  // No post? Bail...
  if (!post) {
    notFound()
  }

  const showHorario = horario === 'true'

  return (
    <article>
      <header>
        <h2 dangerouslySetInnerHTML={{__html: post.title ?? ''}} />
      </header>

      {showHorario && post.apagones && (
        <section className="my-8 rounded-lg border p-6 shadow-md">
          <h3 className="mt-0 mb-4 text-xl font-bold">
            Información de Horario
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="m-0 text-sm font-semibold text-gray-500 uppercase">
                Barrio
              </p>
              <p className="m-0 text-lg">{post.apagones.barrio || 'N/A'}</p>
            </div>
            <div>
              <p className="m-0 text-sm font-semibold text-gray-500 uppercase">
                Ciudad
              </p>
              <p className="m-0 text-lg">{post.apagones.ciudad || 'N/A'}</p>
            </div>
            <div>
              <p className="m-0 text-sm font-semibold text-gray-500 uppercase">
                Fecha
              </p>
              <p className="m-0 text-lg">{post.apagones.fecha || 'N/A'}</p>
            </div>
            <div>
              <p className="m-0 text-sm font-semibold text-gray-500 uppercase">
                Hora
              </p>
              <p className="m-0 text-lg">{post.apagones.hora || 'N/A'}</p>
            </div>
          </div>
        </section>
      )}

      {!showHorario && (
        <div dangerouslySetInnerHTML={{__html: post.content ?? ''}} />
      )}
      <footer className="flex items-center justify-between gap-4 pb-4">
        <div>
          <h3>Categories</h3>
          <ul className="m-0 flex list-none gap-2 p-0">
            {post.categories?.nodes?.map((category: Category) => (
              <li className="m-0 p-0" key={category.databaseId}>
                <Link href={`/category/${category.name}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Tags</h3>
          <ul className="m-0 flex list-none gap-2 p-0">
            {post.tags?.nodes?.map((tag: Tag) => (
              <li className="m-0 p-0" key={tag.databaseId}>
                <Link href={`/tag/${tag.name}`}>{tag.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </article>
  )
}
