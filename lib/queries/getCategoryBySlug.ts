import {fetchGraphQL} from '@/lib/functions'
import {Post} from '@/lib/types'

/**
 * Fetch only cursors for a category archive to build a pagination map.
 * This fetches in batches of 100 to overcome the default WPGraphQL limit.
 */
export async function getCategoryPaginationMap(slug: string) {
  let allCursors: string[] = []
  let hasNextPage = true
  let afterCursor = ''

  while (hasNextPage) {
    const query = `
      query GetCategoryPaginationMap($slug: String!, $after: String) {
        posts(where: {categoryName: $slug, status: PUBLISH}, first: 100, after: $after) {
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
      slug,
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
 * Fetch a category archive by slug with pagination.
 */
export default async function getCategoryBySlug(
  slug: string,
  limit: number = 10,
  after: string = ''
) {
  const query = `
    query GetCategoryBySlug($slug: String!, $first: Int, $after: String) {
      posts(where: {categoryName: $slug, status: PUBLISH}, first: $first, after: $after) {
        pageInfo {
          endCursor
          hasNextPage
          hasPreviousPage
          startCursor
        }
        nodes {
          databaseId
          date
          excerpt(format: RENDERED)
          title(format: RENDERED)
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
          slug
        }
      }
    }
  `

  const variables = {
    slug,
    first: limit,
    after
  }

  const response = await fetchGraphQL(query, variables)

  return response?.data?.posts
}
