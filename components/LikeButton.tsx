'use client'

import { useState, useEffect } from 'react'
import { likeTrade } from '@/app/actions/social'
import { createClient } from '@/lib/supabase/client'

interface LikeButtonProps {
  tradeId: string
  initialLikeCount: number
  initialLiked: boolean
}

export default function LikeButton({ tradeId, initialLikeCount, initialLiked }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [liked, setLiked] = useState(initialLiked)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLike = async () => {
    if (loading) return

    setLoading(true)
    setError(null)

    // Optimistic update
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1)

    try {
      const result = await likeTrade(tradeId)
      if (result?.error) {
        // Revert on error
        setLiked(wasLiked)
        setLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
        setError(result.error)
      }
    } catch (err) {
      // Revert on error
      setLiked(wasLiked)
      setLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
      setError('Failed to like trade')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          liked
            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <svg
          className={`w-5 h-5 ${liked ? 'fill-current' : ''}`}
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>{likeCount}</span>
      </button>
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  )
}

