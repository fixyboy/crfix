'use server'

import { createRating, updateRating, deleteRating } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'

export async function rateTrade(tradeId: string, rating: number) {
  if (rating < 1 || rating > 5) {
    return { error: 'Rating must be between 1 and 5' }
  }

  const { data, error } = await createRating({
    trade_id: tradeId,
    rating: Math.round(rating),
  })

  if (error) {
    return { error: error.message || 'Failed to rate trade' }
  }

  revalidatePath(`/trades/${tradeId}`)
  revalidatePath('/feed')
  return { success: true, data: data }
}

export async function updateTradeRating(ratingId: string, newRating: number) {
  if (newRating < 1 || newRating > 5) {
    return { error: 'Rating must be between 1 and 5' }
  }

  const { data, error } = await updateRating(ratingId, Math.round(newRating))

  if (error) {
    return { error: error.message || 'Failed to update rating' }
  }

  revalidatePath(`/trades/${data.trade_id}`)
  revalidatePath('/feed')
  return { success: true, data }
}

export async function removeRating(ratingId: string, tradeId: string) {
  const { error } = await deleteRating(ratingId)

  if (error) {
    return { error: error.message || 'Failed to remove rating' }
  }

  revalidatePath(`/trades/${tradeId}`)
  revalidatePath('/feed')
  return { success: true }
}

