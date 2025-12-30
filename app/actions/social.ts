'use server'

import { toggleLike, createComment, deleteComment } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'

export async function likeTrade(tradeId: string) {
  const { data, error } = await toggleLike(tradeId)

  if (error) {
    return { error: error.message || 'Failed to like trade' }
  }

  revalidatePath(`/trades/${tradeId}`)
  revalidatePath('/feed')
  return { success: true, data }
}

export async function addComment(tradeId: string, content: string) {
  if (!content || content.trim().length === 0) {
    return { error: 'Comment cannot be empty' }
  }

  if (content.length > 1000) {
    return { error: 'Comment must be less than 1000 characters' }
  }

  const { data, error } = await createComment(tradeId, content)

  if (error) {
    return { error: error.message || 'Failed to add comment' }
  }

  revalidatePath(`/trades/${tradeId}`)
  return { success: true, data }
}

export async function removeComment(commentId: string, tradeId: string) {
  const { error } = await deleteComment(commentId)

  if (error) {
    return { error: error.message || 'Failed to delete comment' }
  }

  revalidatePath(`/trades/${tradeId}`)
  return { success: true }
}

