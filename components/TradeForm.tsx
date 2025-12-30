'use client'

import { useState } from 'react'
import { submitTrade } from '@/app/actions/trades'
import { useRouter } from 'next/navigation'

export default function TradeForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'Open' | 'Closed'>('Open')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('status', status)

    const result = await submitTrade(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // If successful, submitTrade will redirect
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Asset Pair */}
      <div>
        <label htmlFor="asset_pair" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Asset Pair <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="asset_pair"
          name="asset_pair"
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="BTC/USDT"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          e.g., BTC/USDT, ETH/USDC, SOL/USDT
        </p>
      </div>

      {/* Trade Type and Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="trade_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trade Type <span className="text-red-500">*</span>
          </label>
          <select
            id="trade_type"
            name="trade_type"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select type</option>
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>
        </div>

        <div>
          <label htmlFor="strategy" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Strategy <span className="text-red-500">*</span>
          </label>
          <select
            id="strategy"
            name="strategy"
            required
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select strategy</option>
            <option value="Scalp">Scalp</option>
            <option value="Swing">Swing</option>
            <option value="Day trade">Day trade</option>
          </select>
        </div>
      </div>

      {/* Entry Price and Exit Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="entry_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Entry Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="entry_price"
            name="entry_price"
            required
            step="any"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="exit_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Exit Price <span className="text-gray-500">(optional)</span>
          </label>
          <input
            type="number"
            id="exit_price"
            name="exit_price"
            step="any"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Leave empty if trade is still open
          </p>
        </div>
      </div>

      {/* Position Size and Trade Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="position_size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Position Size <span className="text-gray-500">(optional)</span>
          </label>
          <input
            type="number"
            id="position_size"
            name="position_size"
            step="any"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="trade_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Trade Date <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="trade_date"
            name="trade_date"
            required
            max={new Date().toISOString().slice(0, 16)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Trade Status
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="status_radio"
              value="Open"
              checked={status === 'Open'}
              onChange={(e) => setStatus(e.target.value as 'Open' | 'Closed')}
              className="mr-2"
            />
            <span className="text-gray-700 dark:text-gray-300">Open</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="status_radio"
              value="Closed"
              checked={status === 'Closed'}
              onChange={(e) => setStatus(e.target.value as 'Open' | 'Closed')}
              className="mr-2"
            />
            <span className="text-gray-700 dark:text-gray-300">Closed</span>
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Closed trades require an exit price to calculate PnL
        </p>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Share your trading strategy, setup, or any additional context..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Share Trade'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

