'use server';

import { createClient } from '../../../../../../lib/supabase/server';
import { cookies } from 'next/headers';

export async function getLatestPagePerformance(pageId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('page_performance')
    .select('*')
    .eq('page_id', pageId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching page performance:', error);
    throw error;
  }

  return data;
}
