import Header from '@/components/Header'
import TradeForm from '@/components/TradeForm'
import { getUser } from '@/lib/supabase/auth'
import { redirect } from 'next/navigation'

export default async function NewTradePage() {
  const user = await getUser()

  // Redirect to home if not authenticated
  if (!user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Share a Trade
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Share your trading experience with the community
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
          <TradeForm />
        </div>
      </main>
    </div>
  )
}

