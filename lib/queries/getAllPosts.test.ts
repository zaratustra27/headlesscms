import getAllPosts from '@/lib/queries/getAllPosts'
import {server} from '@/test-utils'
import {http, HttpResponse} from 'msw'

describe('getAllPosts', () => {
  it('should fetch all posts successfully', async () => {
    server.use(
      http.post(`${process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL}`, () => {
        return HttpResponse.json({
          data: {
            posts: {
              pageInfo: {
                hasNextPage: false,
                endCursor: ''
              },
              nodes: [
                {
                  id: 'cG9zdDox',
                  databaseId: 1,
                  title: 'Test Post 1',
                  slug: 'test-post-1',
                  excerpt: 'Test excerpt 1',
                  date: '2024-01-01T00:00:00',
                  featuredImage: null
                },
                {
                  id: 'cG9zdDoy',
                  databaseId: 2,
                  title: 'Test Post 2',
                  slug: 'test-post-2',
                  excerpt: 'Test excerpt 2',
                  date: '2024-01-02T00:00:00',
                  featuredImage: null
                }
              ]
            }
          }
        })
      })
    )

    const data = await getAllPosts()
    const posts = data?.nodes

    expect(posts).toHaveLength(2)
    expect(posts[0].title).toBe('Test Post 1')
    expect(posts[1].title).toBe('Test Post 2')
  })

  it('should return empty array in nodes when no posts are found', async () => {
    server.use(
      http.post(`${process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL}`, () => {
        return HttpResponse.json({
          data: {
            posts: {
              nodes: []
            }
          }
        })
      })
    )

    const data = await getAllPosts()

    expect(data.nodes).toEqual([])
  })

  it('should return undefined on API error', async () => {
    server.use(
      http.post(`${process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL}`, () => {
        return HttpResponse.json(
          {
            errors: [{message: 'Internal server error'}]
          },
          {status: 500}
        )
      })
    )

    const data = await getAllPosts()

    expect(data).toBeUndefined()
  })
})
