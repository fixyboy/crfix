import { createClient } from './server'
import type { Trade, TradeWithStats, UserRanking, UserStats, CreateTradeInput, CreateRatingInput } from '@/types/database'

/**
 * Get all trades with user info and ratings
 */
export async function getTrades(limit = 50, offset = 0) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('trades')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching trades:', error)
    return { data: null, error }
  }

  // Get ratings for each trade
  const tradesWithRatings = await Promise.all(
    (data || []).map(async (trade) => {
      const { data: ratings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('trade_id', trade.id)

      const averageRating = ratings && ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0

      return {
        ...trade,
        username: (trade.profiles as any)?.username || 'Unknown',
        avatar_url: (trade.profiles as any)?.avatar_url || null,
        average_rating: averageRating,
        total_ratings: ratings?.length || 0,
      } as TradeWithStats
    })
  )

  return { data: tradesWithRatings, error: null }
}

/**
 * Get a single trade by ID with stats
 */
export async function getTradeById(tradeId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('get_trade_with_stats', { trade_uuid: tradeId })
    .single()

  if (error) {
    console.error('Error fetching trade:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Create a new trade
 */
export async function createTrade(trade: CreateTradeInput) {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()
  
  if (!user.data.user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  const { data, error } = await supabase
    .from('trades')
    .insert({
      ...trade,
      user_id: user.data.user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating trade:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Update a trade
 */
export async function updateTrade(tradeId: string, updates: Partial<CreateTradeInput>) {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()
  
  if (!user.data.user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  const { data, error } = await supabase
    .from('trades')
    .update(updates)
    .eq('id', tradeId)
    .eq('user_id', user.data.user.id) // Ensure user owns the trade
    .select()
    .single()

  if (error) {
    console.error('Error updating trade:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Delete a trade
 */
export async function deleteTrade(tradeId: string) {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()
  
  if (!user.data.user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', tradeId)
    .eq('user_id', user.data.user.id) // Ensure user owns the trade

  if (error) {
    console.error('Error deleting trade:', error)
    return { data: null, error }
  }

  return { data: { success: true }, error: null }
}

/**
 * Get user rankings
 */
export async function getUserRankings(limit = 100) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_rankings')
    .select('*')
    .limit(limit)

  if (error) {
    console.error('Error fetching rankings:', error)
    return { data: null, error }
  }

  return { data: data as UserRanking[], error: null }
}

/**
 * Get user stats
 */
export async function getUserStats(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('get_user_stats', { user_profile_id: userId })

  if (error) {
    console.error('Error fetching user stats:', error)
    return { data: null, error }
  }

  return { data: data?.[0] as UserStats | undefined, error: null }
}

/**
 * Create a rating for a trade
 */
export async function createRating(rating: CreateRatingInput) {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()
  
  if (!user.data.user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  const { data, error } = await supabase
    .from('ratings')
    .insert({
      ...rating,
      rater_id: user.data.user.id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating rating:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Update a rating
 */
export async function updateRating(ratingId: string, newRating: number) {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()
  
  if (!user.data.user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  const { data, error } = await supabase
    .from('ratings')
    .update({ rating: newRating })
    .eq('id', ratingId)
    .eq('rater_id', user.data.user.id) // Ensure user owns the rating
    .select()
    .single()

  if (error) {
    console.error('Error updating rating:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Delete a rating
 */
export async function deleteRating(ratingId: string) {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()
  
  if (!user.data.user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  const { error } = await supabase
    .from('ratings')
    .delete()
    .eq('id', ratingId)
    .eq('rater_id', user.data.user.id) // Ensure user owns the rating

  if (error) {
    console.error('Error deleting rating:', error)
    return { data: null, error }
  }

  return { data: { success: true }, error: null }
}

