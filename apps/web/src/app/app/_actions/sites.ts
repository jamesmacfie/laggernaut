'use server';

import { createClient } from '../../../../lib/supabase/server';
import { getCurrentUser } from './user';
import { cookies } from 'next/headers';

export async function getSites() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from('site').select('*');

  if (error) {
    console.error('Error fetching sites:', error);
    return [];
  }

  console.log('site data', data);
  return data;
}

interface CreateSiteParams {
  url: string;
  name?: string;
}

export async function createSite({ url, name }: CreateSiteParams) {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('site')
    .insert([
      {
        url,
        name,
        state: 'pending',
        created_by_user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}