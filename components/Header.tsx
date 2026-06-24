'use client'

import config from '@/lib/config'
import type {MenuItem} from '@/lib/generated'
import getMenuBySlug from '@/lib/queries/getMenuBySlug'
import Image from 'next/image'
import Link from 'next/link'
import {useEffect, useState} from 'react'
import HeaderSearch from './HeaderSearch'

/**
 * Header component.
 */
export default function Header() {
  const [menu, setMenu] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Fetch menu data.
  useEffect(() => {
    async function fetchMenu() {
      const data = await getMenuBySlug('primary')
      setMenu(data)
    }
    fetchMenu()
  }, [])

  return (
    <header className="border-b bg-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <h1 className="m-0 text-2xl font-bold">
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

          <div className="hidden md:block">
            <HeaderSearch />
          </div>

          <nav className="hidden items-center gap-6 text-base font-semibold lg:flex">
            {!!menu &&
              menu.menuItems?.edges?.map((item: {node: MenuItem}) => (
                <Link key={item.node.databaseId} href={item.node.uri ?? '#'}>
                  {item.node.label ?? ''}
                </Link>
              ))}
          </nav>

          <div className="flex items-center gap-4 lg:hidden">
            <div className="md:hidden">
              <HeaderSearch />
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="mt-4 flex flex-col gap-4 border-t pt-4 lg:hidden">
            {!!menu &&
              menu.menuItems?.edges?.map((item: {node: MenuItem}) => (
                <Link
                  key={item.node.databaseId}
                  href={item.node.uri ?? '#'}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-semibold"
                >
                  {item.node.label ?? ''}
                </Link>
              ))}
          </nav>
        )}
      </div>
    </header>
  )
}
