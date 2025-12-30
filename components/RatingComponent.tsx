'use client'

import { useState } from 'react'
import { rateTrade, updateTradeRating, removeRating } from '@/app/actions/ratings'

interface RatingComponentProps {
  tradeId: string
  currentRating: number | null
  ratingId: string | null
  averageRating: number
  totalRatings: number
}

export default function RatingComponent({
  tradeId,
  currentRating,
  ratingId,
  averageRating,
  totalRatings,
}: RatingComponentProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const [selectedRating, setSelectedRating] = useState<number | null>(currentRating)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userRating, setUserRating] = useState<number | null>(currentRating)
  const [userRatingId, setUserRatingId] = useState<string | null>(ratingId)

  const handleStarClick = async (rating: number) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      if (userRatingId) {
        // Update existing rating
        const result = await updateTradeRating(userRatingId, rating)
        if (result?.error) {
          setError(result.error)
        } else {
          setUserRating(rating)
        }
      } else {
        // Create new rating
        const result = await rateTrade(tradeId, rating)
        if (result?.error) {
          setError(result.error)
        } else if (result?.success && result.data) {
          setUserRating(rating)
          setUserRatingId(result.data.id)
        }
      }
    } catch (err) {
      setError('Failed to submit rating')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveRating = async () => {
    if (!userRatingId || loading) return

    setLoading(true)
    setError(null)

    try {
      const result = await removeRating(userRatingId, tradeId)
      if (result?.error) {
        setError(result.error)
      } else {
        setUserRating(null)
        setUserRatingId(null)
      }
    } catch (err) {
      setError('Failed to remove rating')
    } finally {
      setLoading(false)
    }
  }

  const displayRating = hoveredStar || userRating || 0

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              disabled={loading}
              className={`transition-colors ${
                loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
              }`}
            >
              <svg
                className={`w-8 h-8 ${
                  star <= displayRating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {averageRating > 0 ? averageRating.toFixed(1) : 'No ratings'}
          </span>
          {totalRatings > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </div>
      </div>

      {userRating && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Your rating: {userRating} star{userRating !== 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={handleRemoveRating}
            disabled={loading}
            className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      )}

      {error && (
        <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

