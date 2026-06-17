import {fetchGraphQL} from '@/lib/functions'
import {Menu} from '@/lib/types'

/**
 * Fetch a menu by location.
 */
export default async function getMenuBySlug(slug: string) {
  // Try to fetch by location (most common for header/footer)
  const query = `
    query GetMenuByLocation($location: MenuLocationEnum!) {
      menuItems(where: {location: $location}) {
        edges {
          node {
            uri
            label
            databaseId
          }
        }
      }
    }
  `

  const variables = {
    location: slug.toUpperCase().replace('-', '_') as any
  }

  const response = await fetchGraphQL(query, variables)

  // If we have menu items, return them in a structure that Header.tsx expects
  if (response?.data?.menuItems?.edges?.length) {
    return {
      menuItems: response.data.menuItems
    }
  }

  // Fallback: Try fetching by slug if location failed
  const slugQuery = `
    query GetMenuBySlug($id: ID!) {
      menu(id: $id, idType: SLUG) {
        menuItems {
          edges {
            node {
              uri
              label
              databaseId
            }
          }
        }
      }
    }
  `

  const slugVariables = {
    id: slug
  }

  const slugResponse = await fetchGraphQL(slugQuery, slugVariables)

  return slugResponse?.data?.menu || null
}
