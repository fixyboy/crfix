'use server'

import { createTrade } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { CreateTradeInput } from '@/types/database'

export async function submitTrade(formData: FormData) {
  const asset_pair = formData.get('asset_pair') as string
  const trade_type = formData.get('trade_type') as string
  const entry_price = formData.get('entry_price') as string
  const exit_price = formData.get('exit_price') as string
  const position_size = formData.get('position_size') as string
  const strategy = formData.get('strategy') as string
  const notes = formData.get('notes') as string
  const trade_date = formData.get('trade_date') as string
  const status = formData.get('status') as string || 'Open'

  // Validation
  if (!asset_pair || !trade_type || !entry_price || !strategy || !trade_date) {
    return { error: 'Please fill in all required fields' }
  }

  if (!['Long', 'Short'].includes(trade_type)) {
    return { error: 'Invalid trade type' }
  }

  if (!['Scalp', 'Swing', 'Day trade'].includes(strategy)) {
    return { error: 'Invalid strategy' }
  }

  const entryPriceNum = parseFloat(entry_price)
  if (isNaN(entryPriceNum) || entryPriceNum <= 0) {
    return { error: 'Entry price must be a positive number' }
  }

  let exitPriceNum: number | null = null
  if (exit_price && exit_price.trim() !== '') {
    exitPriceNum = parseFloat(exit_price)
    if (isNaN(exitPriceNum) || exitPriceNum <= 0) {
      return { error: 'Exit price must be a positive number' }
    }
  }

  let positionSizeNum: number | null = null
  if (position_size && position_size.trim() !== '') {
    positionSizeNum = parseFloat(position_size)
    if (isNaN(positionSizeNum) || positionSizeNum <= 0) {
      return { error: 'Position size must be a positive number' }
    }
  }

  // Validate trade date (not in the future)
  const tradeDateObj = new Date(trade_date)
  const now = new Date()
  if (tradeDateObj > now) {
    return { error: 'Trade date cannot be in the future' }
  }

  const tradeData: CreateTradeInput = {
    asset_pair: asset_pair.trim(),
    trade_type: trade_type as 'Long' | 'Short',
    entry_price: entryPriceNum,
    exit_price: exitPriceNum,
    position_size: positionSizeNum,
    strategy: strategy as 'Scalp' | 'Swing' | 'Day trade',
    notes: notes && notes.trim() !== '' ? notes.trim() : null,
    trade_date: trade_date,
    status: status as 'Open' | 'Closed',
  }

  const { data, error } = await createTrade(tradeData)

  if (error) {
    return { error: error.message || 'Failed to create trade' }
  }

  revalidatePath('/feed')
  redirect(`/trades/${data.id}`)
}

