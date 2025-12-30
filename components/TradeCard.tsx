import Link from 'next/link'
import type { TradeWithStats } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'

interface TradeCardProps {
  trade: TradeWithStats
}

export default function TradeCard({ trade }: TradeCardProps) {
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

  return (
    <Link href={`/trades/${trade.id}`}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {trade.avatar_url ? (
              <img
                src={trade.avatar_url}
                alt={trade.username}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(trade.username)}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {trade.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(trade.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {trade.like_count !== undefined && trade.like_count > 0 && (
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {trade.like_count}
                </span>
              </div>
            )}
            {trade.average_rating > 0 && (
              <div className="flex items-center gap-1">
                <svg
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {trade.average_rating.toFixed(1)}
                </span>
                {trade.total_ratings > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({trade.total_ratings})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Trade Details */}
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
              {trade.asset_pair}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getTradeTypeColor(
                trade.trade_type
              )}`}
            >
              {trade.trade_type}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStrategyColor(
                trade.strategy
              )}`}
            >
              {trade.strategy}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                trade.status === 'Closed'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
              }`}
            >
              {trade.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Entry Price</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                ${trade.entry_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 8,
                })}
              </p>
            </div>
            {trade.exit_price && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Exit Price</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  ${trade.exit_price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8,
                  })}
                </p>
              </div>
            )}
            {trade.pnl_percentage !== null && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">PnL</p>
                <p className={`font-bold text-lg ${getPnLColor(trade.pnl_percentage)}`}>
                  {trade.pnl_percentage >= 0 ? '+' : ''}
                  {trade.pnl_percentage.toFixed(2)}%
                </p>
              </div>
            )}
            {trade.position_size && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Position Size</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {trade.position_size.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 8,
                  })}
                </p>
              </div>
            )}
          </div>

          {trade.notes && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-4 line-clamp-2">
              {trade.notes}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

