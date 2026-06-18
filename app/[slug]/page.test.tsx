import * as getAllPostsModule from '@/lib/queries/getAllPosts'
import * as getPostBySlugModule from '@/lib/queries/getPostBySlug'
import {render, screen} from '@/test-utils'
import type {Metadata} from 'next'
import Post, {generateMetadata, generateStaticParams} from './page'
// Mock notFound to throw, matching Next.js behavior in runtime
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('not found')
  }
}))

describe('app/blog/[slug]/page (Server Component)', () => {
  // No network mocking needed; we stub query functions directly

  const examplePost = {
    databaseId: 101,
    slug: 'hello-world',
    title: 'Hello <em>World</em>',
    excerpt: '<p>Excerpt</p>',
    content: '<p>Content</p>',
    date: '2024-01-01',
    author: {node: {name: 'Greg'}},
    seo: {title: 'SEO Title', metaDesc: 'SEO Desc'},
    categories: {
      nodes: [{databaseId: 1, name: 'Tech'}]
    },
    tags: {
      nodes: [{databaseId: 2, name: 'Next.js'}]
    },
    comments: {
      nodes: [
        {
          databaseId: 501,
          content: '<p>Nice post!</p>',
          date: '2024-01-02',
          author: {
            node: {name: 'Alice', avatar: {url: 'https://example.com/a.png'}}
          }
        }
      ]
    }
  }

  it('generateStaticParams returns slugs from getAllPosts()', async () => {
    // Spy on query function to avoid needing real MSW data shape here
    const spy = vi
      .spyOn(getAllPostsModule, 'default')
      .mockResolvedValue({
        nodes: [
          {slug: 'hello-world'},
          {slug: null},
          {slug: 'another-post'}
        ]
      } as any)

    const params = await generateStaticParams()
    expect(params).toEqual([{slug: 'hello-world'}, {slug: 'another-post'}])
    spy.mockRestore()
  })

  it('generateMetadata returns SEO fields for a post', async () => {
    const spy = vi
      .spyOn(getPostBySlugModule, 'default')
      .mockResolvedValue(examplePost as any)

    const meta = (await generateMetadata({
      params: Promise.resolve({slug: 'hello-world'})
    } as any)) as Metadata

    expect(meta).toMatchObject({
      title: 'SEO Title',
      description: 'SEO Desc'
    })

    spy.mockRestore()
  })

  it('generateMetadata returns empty object when post not found', async () => {
    const spy = vi
      .spyOn(getPostBySlugModule, 'default')
      .mockResolvedValue(null as any)
    const meta = (await generateMetadata({
      params: Promise.resolve({slug: 'missing'})
    } as any)) as Metadata
    expect(meta).toEqual({})
    spy.mockRestore()
  })

  it('renders blog post with categories, tags, and comments', async () => {
    const spy = vi
      .spyOn(getPostBySlugModule, 'default')
      .mockResolvedValue(examplePost as any)

    const Component = await Post({
      params: Promise.resolve({slug: 'hello-world'}),
      searchParams: Promise.resolve({})
    } as any)

    const {container} = render(Component)
    expect(container).toBeInTheDocument()
    expect(screen.getByRole('heading', {level: 2})).toHaveTextContent(
      'Hello World'
    )

    // Categories
    expect(
      screen.getByRole('heading', {name: /Categories/i})
    ).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'Tech'})).toHaveAttribute(
      'href',
      '/category/Tech'
    )

    // Tags
    expect(screen.getByRole('heading', {name: /Tags/i})).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'Next.js'})).toHaveAttribute(
      'href',
      '/tag/Next.js'
    )

    spy.mockRestore()
  })

  it('renders horario card when horario=true searchParam is present', async () => {
    const postWithAcf = {
      ...examplePost,
      apagones: {
        barrio: 'Palermo',
        ciudad: 'CABA',
        fecha: '2024-12-25',
        hora: '10:00'
      }
    }
    const spy = vi
      .spyOn(getPostBySlugModule, 'default')
      .mockResolvedValue(postWithAcf as any)

    const Component = await Post({
      params: Promise.resolve({slug: 'hello-world'}),
      searchParams: Promise.resolve({horario: 'true'})
    } as any)

    render(Component)
    expect(screen.getByText(/Información de Horario/i)).toBeInTheDocument()
    expect(screen.getByText('Palermo')).toBeInTheDocument()
    expect(screen.getByText('CABA')).toBeInTheDocument()
    expect(screen.getByText('2024-12-25')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()

    // Content should NOT be present when horario=true
    expect(screen.queryByText('Content')).not.toBeInTheDocument()

    spy.mockRestore()
  })

  it('throws via notFound() when post is missing', async () => {
    const spy = vi
      .spyOn(getPostBySlugModule, 'default')
      .mockResolvedValue(null as any)

    await expect(
      Post({
        params: Promise.resolve({slug: 'missing'}),
        searchParams: Promise.resolve({})
      } as any)
    ).rejects.toThrow('not found')
    spy.mockRestore()
  })
})
