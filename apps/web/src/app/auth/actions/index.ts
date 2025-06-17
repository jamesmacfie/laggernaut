'use server';

import { createClient } from '../../../../lib/supabase/server';
import { cookies } from 'next/headers';

export async function signUpWithEmailAndPassword(values: {
  email: string;
  password: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_APP_URL!}/auth/callback`,
    },
  });

  return { data, error };
}

export async function signInWithEmailAndPassword(values: {
  email: string;
  password: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signInWithPassword(values);

  console.log('signed in', data, error);

  return {
    data,
    error: error ? { message: error.message, status: error.status } : null
  };
}

export const signInWithRecoveryToken = async (code: string) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  return supabase.auth.exchangeCodeForSession(code);
};

export async function signInWithEmail(email: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // signup users if not available
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_APP_URL!}/auth/welcome`,
    },
  });
}

// Todo: Add loginWithGithub

export async function resetPasswordForEmail(email: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_APP_URL!}/auth/reset-password`,
  });
}

export async function updatePassword(password: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  return supabase.auth.updateUser({
    password,
  });
}
