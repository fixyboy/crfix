import Header from '@/components/Header'
import RatingComponent from '@/components/RatingComponent'
import LikeButton from '@/components/LikeButton'
import CommentsSection from '@/components/CommentsSection'
import { getTradeById, getUserRatingForTrade, getTradeLikes, getUserLikeForTrade, getTradeComments } from '@/lib/supabase/queries'
import { getUser } from '@/lib/supabase/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface TradeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TradeDetailPage({ params }: TradeDetailPageProps) {
  const { id } = await params
  const user = await getUser()

  // Redirect to home if not authenticated
  if (!user) {
    redirect('/')
  }

  const { data: trade, error } = await getTradeById(id)
  const { data: userRating } = await getUserRatingForTrade(id)
  const { data: likes } = await getTradeLikes(id)
  const { data: userLike } = await getUserLikeForTrade(id)
  const { data: comments } = await getTradeComments(id)

  if (error || !trade) {
    notFound()
  }

  const likeCount = likes?.length || 0
  const isLiked = !!userLike

  const getInitials = (username: string) => {
    return username.substring(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const getPnLColor = (pnl: number | null) => {
    if (!pnl) return 'text-gray-600 dark:text-gray-400'
    return pnl >= 0
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400'
  }

  const getTradeTypeColor = (type: string) => {
    return type === 'Long'
      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }

  const getStrategyColor = (strategy: string) => {
    const colors: Record<string, string> = {
      Scalp: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      Swing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'Day trade': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    }
    return colors[strategy] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  }

  const isOwner = user.id === trade.user_id

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Feed
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {trade.avatar_url ? (
                  <img
                    src={trade.avatar_url}
                    alt={trade.username}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                    {getInitials(trade.username)}
                  </div>
                )}
                <div>
                  <Link
                    href={`/profile/${trade.username}`}
                    className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {trade.username}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(trade.created_at)}
                  </p>
                </div>
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Link
                    href={`/trades/${id}/edit`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              )}
            </div>

            {/* Trade Tags */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                {trade.asset_pair}
              </span>
              <span
                className={`px-4 py-2 rounded-lg text-sm font-medium ${getTradeTypeColor(
                  trade.trade_type
                )}`}
              >
                {trade.trade_type}
              </span>
              <span
                className={`px-4 py-2 rounded-lg text-sm font-medium ${getStrategyColor(
                  trade.strategy
                )}`}
              >
                {trade.strategy}
              </span>
              <span
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  trade.status === 'Closed'
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                }`}
              >
                {trade.status}
              </span>
            </div>
          </div>

          {/* Trade Details */}
          <div className="p-6 space-y-6">
            {/* Price Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Entry Price</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${trade.entry_price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8,
                  })}
                </p>
              </div>
              {trade.exit_price && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Exit Price</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${trade.exit_price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8,
                    })}
                  </p>
                </div>
              )}
              {trade.pnl_percentage !== null && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">PnL</p>
                  <p className={`text-2xl font-bold ${getPnLColor(trade.pnl_percentage)}`}>
                    {trade.pnl_percentage >= 0 ? '+' : ''}
                    {trade.pnl_percentage.toFixed(2)}%
                  </p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            {(trade.position_size || trade.trade_date) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trade.position_size && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Position Size</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {trade.position_size.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trade Date</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(trade.trade_date).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {trade.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</p>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {trade.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Like and Rating Section */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-6">
              {/* Like Button */}
              {!isOwner && (
                <div>
                  <LikeButton
                    tradeId={id}
                    initialLikeCount={likeCount}
                    initialLiked={isLiked}
                  />
                </div>
              )}

              {/* Rating Section */}
              {!isOwner && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Rate this Trade
                  </h3>
                  <RatingComponent
                    tradeId={id}
                    currentRating={userRating?.rating || null}
                    ratingId={userRating?.id || null}
                    averageRating={trade.average_rating || 0}
                    totalRatings={trade.total_ratings || 0}
                  />
                </div>
              )}

              {isOwner && (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {trade.average_rating > 0 ? trade.average_rating.toFixed(1) : 'No ratings yet'}
                      </span>
                      {trade.total_ratings > 0 && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({trade.total_ratings} {trade.total_ratings === 1 ? 'rating' : 'ratings'})
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You cannot like or rate your own trades
                  </p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
              <CommentsSection
                tradeId={id}
                initialComments={comments || []}
                currentUserId={user.id}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

