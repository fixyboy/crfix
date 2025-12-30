'use client'

import { useState, useEffect } from 'react'
import { addComment, removeComment } from '@/app/actions/social'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { CommentWithUser } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'

interface CommentsSectionProps {
  tradeId: string
  initialComments: CommentWithUser[]
  currentUserId: string | null | undefined
}

export default function CommentsSection({
  tradeId,
  initialComments,
  currentUserId,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentWithUser[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || loading) return

    setLoading(true)
    setError(null)

    const commentText = newComment
    setNewComment('') // Clear input immediately

    try {
      const result = await addComment(tradeId, commentText)
      if (result?.error) {
        setError(result.error)
        setNewComment(commentText) // Restore on error
      } else if (result?.success && result.data) {
        // Optimistically add comment - will be refreshed by revalidation
        // For now, just clear and let the page refresh
        window.location.reload()
      }
    } catch (err) {
      setError('Failed to add comment')
      setNewComment(commentText) // Restore on error
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    setLoading(true)
    setError(null)

    try {
      const result = await removeComment(commentId, tradeId)
      if (result?.error) {
        setError(result.error)
      } else {
        // Remove from local state
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    } catch (err) {
      setError('Failed to delete comment')
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            maxLength={1000}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {newComment.length}/1000 characters
            </span>
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              {comment.avatar_url ? (
                <img
                  src={comment.avatar_url}
                  alt={comment.username}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {getInitials(comment.username)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/profile/${comment.username}`}
                    className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {comment.username}
                  </Link>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
                {currentUserId === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={loading}
                    className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

