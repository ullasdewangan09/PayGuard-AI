import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration is incomplete. Some authentication features may not work.');
  console.warn('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

/**
 * Get the current authenticated user's session
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  return await supabase.auth.signOut();
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'openid profile email'
    }
  });
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmailPassword(email: string, password: string) {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmailPassword(email: string, password: string) {
  return await supabase.auth.signUp({
    email,
    password
  });
}

/**
 * Verify email OTP
 */
export async function verifyEmailOTP(email: string, token: string) {
  return await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
}

/**
 * Sign in with phone OTP
 */
export async function signInWithPhoneOTP(phone: string) {
  return await supabase.auth.signInWithOtp({
    phone,
    options: {
      shouldCreateUser: true
    }
  });
}

/**
 * Verify phone OTP
 */
export async function verifyPhoneOTP(phone: string, token: string) {
  return await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  });
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session);
  });
}
