import config from '@/lib/config'
import type {MenuItem} from '@/lib/generated'
import getMenuBySlug from '@/lib/queries/getMenuBySlug'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Header component.
 */
export default async function Header() {
  // Get menu items from WordPress.
  const menu = await getMenuBySlug('primary')

  return (
    <header>
      <div>
        <h1 className="mb-0">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="http://localhost/nextjs/wp-content/uploads/2024/11/apagones-ecuador-flag-138x135.png"
              alt="Flag"
              width={40}
              height={40}
            />
            {config.siteName}
          </Link>
        </h1>
        <p>{config.siteDescription}</p>
      </div>
      <nav className="flex gap-4">
        {!!menu &&
          menu.menuItems?.edges?.map((item: {node: MenuItem}) => (
            <Link key={item.node.databaseId} href={item.node.uri ?? '#'}>
              {item.node.label ?? ''}
            </Link>
          ))}
      </nav>
    </header>
  )
}
