import type {Book, Menu, Page, Post as GeneratedPost} from './generated'

// Re-export WordPress types
export type {Book, Menu, Page}

export interface Post extends GeneratedPost {
  apagones?: HorarioACF
}

// Non-WordPress types
export interface DynamicPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{[key: string]: string | string[] | undefined}>
}

export interface HorarioACF {
  barrio?: string
  ciudad?: string
  fecha?: string
  hora?: string
}

export interface SearchResults {
  id: number
  title: string
  url: string
  type: string
  subtype: string
}

export interface Children {
  children: React.ReactNode
}

export interface GraphQLResponse<T = any> {
  data?: T
  errors?: Array<{message: string}>
}
