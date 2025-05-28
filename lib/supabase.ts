import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create a mock client for when Supabase is not configured
const createMockClient = () => ({
  auth: {
    signUp: async () => ({ data: null, error: new Error("Supabase not configured") }),
    signInWithPassword: async () => ({ data: null, error: new Error("Supabase not configured") }),
    signOut: async () => ({ error: new Error("Supabase not configured") }),
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: new Error("Supabase not configured") }),
        order: () => ({
          limit: async () => ({ data: [], error: null }),
        }),
      }),
      order: () => ({
        limit: async () => ({ data: [], error: null }),
      }),
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: new Error("Supabase not configured") }),
      }),
    }),
    update: () => ({
      eq: async () => ({ error: new Error("Supabase not configured") }),
    }),
    delete: () => ({
      eq: async () => ({ error: new Error("Supabase not configured") }),
    }),
  }),
  rpc: async () => ({ error: new Error("Supabase not configured") }),
})

// Create the Supabase client or mock client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (createMockClient() as any)

// Auth helpers with error handling
export const signUp = async (email: string, password: string, fullName: string) => {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error("Supabase is not configured. Please add environment variables.") }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error("Supabase is not configured. Please add environment variables.") }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  if (!isSupabaseConfigured) {
    return { error: new Error("Supabase is not configured. Please add environment variables.") }
  }

  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured) {
    return null
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Export configuration status
export { isSupabaseConfigured }
