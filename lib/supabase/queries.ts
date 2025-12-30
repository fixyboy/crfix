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

  // Get ratings and likes for each trade
  const tradesWithRatings = await Promise.all(
    (data || []).map(async (trade) => {
      const { data: ratings } = await supabase
        .from('ratings')
        .select('rating')
        .eq('trade_id', trade.id)

      const { data: likes } = await supabase
        .from('likes')
        .select('id')
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
        like_count: likes?.length || 0,
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
  
  // Try RPC function first, fallback to manual query
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_trade_with_stats', { trade_uuid: tradeId })
    .single()

  if (!rpcError && rpcData) {
    return { data: rpcData, error: null }
  }

  // Fallback: manual query
  const { data, error } = await supabase
    .from('trades')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq('id', tradeId)
    .single()

  if (error) {
    console.error('Error fetching trade:', error)
    return { data: null, error }
  }

  // Get ratings
  const { data: ratings } = await supabase
    .from('ratings')
    .select('rating')
    .eq('trade_id', tradeId)

  const averageRating = ratings && ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0

  return {
    data: {
      ...data,
      username: (data.profiles as any)?.username || 'Unknown',
      avatar_url: (data.profiles as any)?.avatar_url || null,
      average_rating: averageRating,
      total_ratings: ratings?.length || 0,
    },
    error: null,
  }
}

/**
 * Get user's rating for a specific trade
 */
export async function getUserRatingForTrade(tradeId: string) {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('ratings')
    .select('id, rating')
    .eq('trade_id', tradeId)
    .eq('rater_id', user.data.user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" which is fine
    return { data: null, error }
  }

  return { data: data || null, error: null }
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
 * Get user's trades
 */
export async function getUserTrades(userId: string, limit = 50, offset = 0) {
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching user trades:', error)
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
 * Get profile by username
 */
export async function getProfileByUsername(username: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return { data: null, error }
  }

  return { data, error: null }
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

/**
 * Get likes for a trade
 */
export async function getTradeLikes(tradeId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('likes')
    .select('id, user_id')
    .eq('trade_id', tradeId)

  if (error) {
    console.error('Error fetching likes:', error)
    return { data: null, error }
  }

  return { data: data || [], error: null }
}

/**
 * Check if user has liked a trade
 */
export async function getUserLikeForTrade(tradeId: string) {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('trade_id', tradeId)
    .eq('user_id', user.data.user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { data: null, error }
  }

  return { data: data || null, error: null }
}

/**
 * Toggle like on a trade
 */
export async function toggleLike(tradeId: string) {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  // Check if already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('trade_id', tradeId)
    .eq('user_id', user.data.user.id)
    .single()

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id)

    if (error) {
      return { data: null, error }
    }
    return { data: { liked: false }, error: null }
  } else {
    // Like
    const { data, error } = await supabase
      .from('likes')
      .insert({
        trade_id: tradeId,
        user_id: user.data.user.id,
      })
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }
    return { data: { liked: true, like: data }, error: null }
  }
}

/**
 * Get comments for a trade
 */
export async function getTradeComments(tradeId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .eq('trade_id', tradeId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return { data: null, error }
  }

  const commentsWithUser = (data || []).map((comment) => ({
    ...comment,
    username: (comment.profiles as any)?.username || 'Unknown',
    avatar_url: (comment.profiles as any)?.avatar_url || null,
  }))

  return { data: commentsWithUser, error: null }
}

/**
 * Create a comment
 */
export async function createComment(tradeId: string, content: string) {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  if (!content || content.trim().length === 0) {
    return { data: null, error: { message: 'Comment cannot be empty' } }
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      trade_id: tradeId,
      user_id: user.data.user.id,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()

  if (!user.data.user) {
    return { data: null, error: { message: 'Not authenticated' } }
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.data.user.id) // Ensure user owns the comment

  if (error) {
    console.error('Error deleting comment:', error)
    return { data: null, error }
  }

  return { data: { success: true }, error: null }
}

