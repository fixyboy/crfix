'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  if (!email || !password || !username) {
    return { error: 'All fields are required' }
  }

  // Validate username format
  if (username.length < 3 || username.length > 20) {
    return { error: 'Username must be between 3 and 20 characters' }
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { error: 'Username can only contain letters, numbers, and underscores' }
  }

  // Validate password
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // The profile will be created automatically by the trigger
  // But we should update the username if it was set in metadata
  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', data.user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
    }
  }

  revalidatePath('/', 'layout')
  return { success: true, message: 'Account created! Please check your email to verify your account.' }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/feed')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

