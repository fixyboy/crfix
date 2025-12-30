import Link from 'next/link'
import { getUser, getUserProfile } from '@/lib/supabase/auth'
import UserMenu from './UserMenu'

export default async function Header() {
  const user = await getUser()
  const profile = user ? await getUserProfile() : null

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              TradeShare
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/feed" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Feed
            </Link>
            <Link href="/rankings" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Rankings
            </Link>
            {user && (
              <Link href={`/profile/${profile?.username || user.id}`} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                Profile
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <UserMenu user={user} profile={profile} />
            ) : (
              <>
                <Link
                  href="/?tab=signin"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/?tab=signup"
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

