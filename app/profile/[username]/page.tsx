import Header from '@/components/Header'
import TradeCard from '@/components/TradeCard'
import { getProfileByUsername, getUserStats, getUserTrades } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const currentUser = await getUser()

  // Get profile
  const { data: profile, error: profileError } = await getProfileByUsername(username)
  
  if (profileError || !profile) {
    notFound()
  }

  // Get user stats and trades
  const { data: stats } = await getUserStats(profile.id)
  const { data: trades } = await getUserTrades(profile.id, 50, 0)

  const isOwnProfile = currentUser?.id === profile.id

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase()
  }

  const formatJoinDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Recently'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                {getInitials(profile.username)}
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile.username}
                </h1>
                {isOwnProfile && (
                  <Link
                    href="/settings"
                    className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {profile.bio}
                </p>
              )}

              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span>Joined {formatJoinDate(profile.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total_trades}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Total Trades
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total_closed_trades}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Closed Trades
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <svg
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '—'}
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Avg Rating
                </p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${
                  stats.average_pnl >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {stats.average_pnl >= 0 ? '+' : ''}
                  {stats.average_pnl > 0 ? stats.average_pnl.toFixed(2) : '0.00'}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Avg PnL
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Trade History */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Trade History
            </h2>
            {isOwnProfile && (
              <Link
                href="/trades/new"
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm"
              >
                Share New Trade
              </Link>
            )}
          </div>

          {!trades || trades.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No trades yet
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {isOwnProfile
                  ? "Start sharing your trades to build your reputation!"
                  : `${profile.username} hasn't shared any trades yet.`}
              </p>
              {isOwnProfile && (
                <Link
                  href="/trades/new"
                  className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Share Your First Trade
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {trades.map((trade) => (
                <TradeCard key={trade.id} trade={trade} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

