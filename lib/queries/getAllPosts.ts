import {fetchGraphQL} from '@/lib/functions'
import {Post} from '@/lib/types'

/**
 * Fetch only cursors for all blog posts to build a pagination map.
 * This fetches in batches of 100 to overcome the default WPGraphQL limit.
 */
export async function getPostsPaginationMap() {
  let allCursors: string[] = []
  let hasNextPage = true
  let afterCursor = ''

  while (hasNextPage) {
    const query = `
      query GetPostsPaginationMap($after: String) {
        posts(where: {status: PUBLISH}, first: 100, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
          }
        }
      }
    `

    const variables = {
      after: afterCursor
    }

    const response = await fetchGraphQL(query, variables)
    const posts = response?.data?.posts

    if (!posts) break

    const cursors = posts.edges.map((edge: {cursor: string}) => edge.cursor)
    allCursors = [...allCursors, ...cursors]
    hasNextPage = posts.pageInfo.hasNextPage
    afterCursor = posts.pageInfo.endCursor
  }

  return allCursors
}

/**
 * Fetch blog posts with pagination.
 */
export default async function getAllPosts(
  first: number = 10,
  after: string = ''
) {
  const query = `
    query GetAllPosts($first: Int, $after: String) {
      posts(where: {status: PUBLISH}, first: $first, after: $after) {
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
        nodes {
          commentCount
          databaseId
          date
          modified
          title
          slug
          excerpt(format: RENDERED)
          featuredImage {
            node {
              altText
              sourceUrl
              mediaDetails {
                  height
                  width
              }
            }
          }
          seo {
            metaDesc
            title
          }
        }
      }
    }
  `

  const variables = {
    first,
    after
  }

  const response = await fetchGraphQL(query, variables)

  return response?.data?.posts
}
