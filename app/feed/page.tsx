import Header from '@/components/Header'
import { getTrades } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TradeCard from '@/components/TradeCard'

export default async function FeedPage() {
  const user = await getUser()
  
  // Redirect to home if not authenticated
  if (!user) {
    redirect('/')
  }

  const { data: trades, error } = await getTrades(50, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trade Feed
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Discover trades shared by the community
            </p>
          </div>
          <Link
            href="/trades/new"
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm"
          >
            Share Trade
          </Link>
        </div>

        {/* Trades List */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-700 dark:text-red-400">
              Error loading trades. Please try again later.
            </p>
          </div>
        ) : !trades || trades.length === 0 ? (
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
              Be the first to share a trade!
            </p>
            <Link
              href="/trades/new"
              className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Share Your First Trade
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {trades.map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

