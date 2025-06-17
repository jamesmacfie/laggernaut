'use server';

import { createClient } from '../../../lib/supabase/server';
import { cookies } from 'next/headers';

export async function updateUser(values: { phone: string }) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  return supabase.auth.updateUser(values);
}
