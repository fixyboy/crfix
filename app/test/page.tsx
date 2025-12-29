import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  
  // Test 1: Check environment variables
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Test 2: Try to get auth user (should work even if not logged in)
  const { data: authData, error: authError } = await supabase.auth.getUser()
  
  // Test 3: Try to query profiles table
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
  
  // Test 4: Try to query trades table
  const { data: tradesData, error: tradesError } = await supabase
    .from('trades')
    .select('id')
    .limit(1)
  
  // Test 5: Try to query ratings table
  const { data: ratingsData, error: ratingsError } = await supabase
    .from('ratings')
    .select('id')
    .limit(1)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Supabase Connection Test
        </h1>

        <div className="space-y-6">
          {/* Environment Variables Test */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Environment Variables
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${hasUrl ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-700 dark:text-gray-300">
                  NEXT_PUBLIC_SUPABASE_URL: {hasUrl ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${hasKey ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-700 dark:text-gray-300">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY: {hasKey ? '✅ Set' : '❌ Missing'}
                </span>
              </div>
            </div>
          </div>

          {/* Auth Test */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Authentication Connection
            </h2>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${!authError ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  {!authError ? '✅ Connected successfully' : `❌ Error: ${authError.message}`}
                </p>
                {authData?.user && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    User: {authData.user.email || 'No email'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profiles Table Test */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Profiles Table
            </h2>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${!profilesError ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  {!profilesError ? '✅ Table accessible' : `❌ Error: ${profilesError.message}`}
                </p>
                {profilesError?.code && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Code: {profilesError.code}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Trades Table Test */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Trades Table
            </h2>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${!tradesError ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  {!tradesError ? '✅ Table accessible' : `❌ Error: ${tradesError.message}`}
                </p>
                {tradesError?.code && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Code: {tradesError.code}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ratings Table Test */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Ratings Table
            </h2>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${!ratingsError ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  {!ratingsError ? '✅ Table accessible' : `❌ Error: ${ratingsError.message}`}
                </p>
                {ratingsError?.code && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Code: {ratingsError.code}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <div className={`rounded-lg p-6 border-2 ${
            !authError && !profilesError && !tradesError && !ratingsError && hasUrl && hasKey
              ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
              : 'bg-red-50 dark:bg-red-900/20 border-red-500'
          }`}>
            <h2 className="text-xl font-semibold mb-2">
              {!authError && !profilesError && !tradesError && !ratingsError && hasUrl && hasKey
                ? '✅ All Tests Passed!'
                : '❌ Some Tests Failed'}
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {!authError && !profilesError && !tradesError && !ratingsError && hasUrl && hasKey
                ? 'Your Supabase connection is working correctly!'
                : 'Please check the errors above and verify your setup.'}
            </p>
          </div>

          {/* Connection Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Connection Info
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <p>
                <strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✅' : 'Not set ❌'}
              </p>
              <p>
                <strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `Set (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...) ✅` : 'Not set ❌'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

