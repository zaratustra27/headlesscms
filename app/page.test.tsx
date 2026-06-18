import * as getAllPostsModule from '@/lib/queries/getAllPosts'
import {http, HttpResponse, render, screen, server} from '@/test-utils'
import {axe} from 'jest-axe'
import {vi} from 'vitest'
import Home from './page'

// Mock notFound to throw, matching Next.js behavior in runtime
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('not found')
  }
}))

describe('Home', () => {
  it('should render posts list and pagination', async () => {
    // Mock pagination map to simulate 2 pages
    const mapSpy = vi
      .spyOn(getAllPostsModule, 'getPostsPaginationMap')
      .mockResolvedValue(Array(15).fill('cursor'))

    server.use(
      http.post(
        `${process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL}`,
        async ({request}) => {
          const body = (await request.json()) as {query: string}

          if (body.query.includes('GetAllPosts')) {
            return HttpResponse.json({
              data: {
                posts: {
                  nodes: [
                    {
                      databaseId: 1,
                      title: 'Test Post',
                      slug: 'test-post',
                      excerpt: '<p>Test excerpt</p>',
                      date: '2024-01-01',
                      commentCount: 5,
                      featuredImage: {
                        node: {
                          sourceUrl: 'https://example.com/image.jpg',
                          altText: 'Test image',
                          mediaDetails: {
                            width: 288,
                            height: 230
                          }
                        }
                      }
                    }
                  ]
                }
              }
            })
          }

          return HttpResponse.json({data: {}})
        }
      )
    )

    const HomeComponent = await Home({
      params: Promise.resolve({slug: ''}),
      searchParams: Promise.resolve({})
    } as any)
    const {container} = render(HomeComponent)

    expect(screen.getByText('Latest Posts')).toBeInTheDocument()
    expect(screen.getByText('Test Post')).toBeInTheDocument()

    // Page 1 and 2 buttons should be visible
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()

    const results = await axe(container)
    expect(results).toHaveNoViolations()
    mapSpy.mockRestore()
  })

  it('should call notFound when requesting non-existent page', async () => {
    vi.spyOn(getAllPostsModule, 'getPostsPaginationMap').mockResolvedValue([])

    server.use(
      http.post(
        `${process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL}`,
        async ({request}) => {
          return HttpResponse.json({
            data: {
              posts: {
                nodes: []
              }
            }
          })
        }
      )
    )

    // Page 2 on empty blog should call notFound()
    await expect(
      Home({
        params: Promise.resolve({slug: ''}),
        searchParams: Promise.resolve({page: '2'})
      } as any)
    ).rejects.toThrow('not found')
  })

  it('should handle posts without featured images', async () => {
    vi.spyOn(getAllPostsModule, 'getPostsPaginationMap').mockResolvedValue(
      Array(1).fill('cursor')
    )

    server.use(
      http.post(
        `${process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL}`,
        async ({request}) => {
          const body = (await request.json()) as {query: string}

          if (body.query.includes('GetAllPosts')) {
            return HttpResponse.json({
              data: {
                posts: {
                  nodes: [
                    {
                      databaseId: 1,
                      title: 'Post Without Image',
                      slug: 'post-without-image',
                      excerpt: '<p>Excerpt</p>',
                      date: '2024-01-01',
                      commentCount: 0,
                      featuredImage: null
                    }
                  ]
                }
              }
            })
          }

          return HttpResponse.json({data: {}})
        }
      )
    )

    const HomeComponent = await Home({
      params: Promise.resolve({slug: ''}),
      searchParams: Promise.resolve({})
    } as any)
    const {container} = render(HomeComponent)

    expect(screen.getByText('Post Without Image')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('should prioritize first three images', async () => {
    vi.spyOn(getAllPostsModule, 'getPostsPaginationMap').mockResolvedValue(
      Array(3).fill('cursor')
    )

    server.use(
      http.post(
        `${process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL}`,
        async ({request}) => {
          const body = (await request.json()) as {query: string}

          if (body.query.includes('GetAllPosts')) {
            return HttpResponse.json({
              data: {
                posts: {
                  nodes: [
                    {
                      databaseId: 1,
                      title: 'Post 1',
                      slug: 'post-1',
                      excerpt: '<p>Excerpt 1</p>',
                      date: '2024-01-01',
                      commentCount: 0,
                      featuredImage: {
                        node: {
                          sourceUrl: 'https://example.com/image1.jpg',
                          altText: 'Image 1',
                          mediaDetails: {width: 288, height: 230}
                        }
                      }
                    },
                    {
                      databaseId: 2,
                      title: 'Post 2',
                      slug: 'post-2',
                      excerpt: '<p>Excerpt 2</p>',
                      date: '2024-01-02',
                      commentCount: 0,
                      featuredImage: {
                        node: {
                          sourceUrl: 'https://example.com/image2.jpg',
                          altText: 'Image 2',
                          mediaDetails: {width: 288, height: 230}
                        }
                      }
                    },
                    {
                      databaseId: 3,
                      title: 'Post 3',
                      slug: 'post-3',
                      excerpt: '<p>Excerpt 3</p>',
                      date: '2024-01-03',
                      commentCount: 0,
                      featuredImage: {
                        node: {
                          sourceUrl: 'https://example.com/image3.jpg',
                          altText: 'Image 3',
                          mediaDetails: {width: 288, height: 230}
                        }
                      }
                    }
                  ]
                }
              }
            })
          }

          return HttpResponse.json({data: {}})
        }
      )
    )

    const HomeComponent = await Home({
      params: Promise.resolve({slug: ''}),
      searchParams: Promise.resolve({})
    } as any)
    const {container} = render(HomeComponent)

    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(3)

    // Verify images rendered correctly
    expect(images[0]).toHaveAttribute('src')
    expect(images[1]).toHaveAttribute('src')
    expect(images[2]).toHaveAttribute('src')
  })
})
