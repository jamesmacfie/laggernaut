import { SiteInfo } from '@laggernaut/types';
import { JSDOM } from 'jsdom';
import { supabase } from '../lib/supabase';

type JobStatus =
  | 'pending'
  | 'in_progress'
  | 'complete'
  | 'cancelling'
  | 'cancelled'
  | 'error';

async function updateJobStatus(messageId: number, status: JobStatus) {
  const { error } = await supabase
    .from('job')
    .update({ status })
    .eq('msg_id', messageId);

  if (error) {
    console.error('Error updating job status:', error);
  }
}

export async function processSiteInfoQueue() {
  try {
    const { data: messages, error } = await supabase
      .rpc('read_messages', {
        queue_name: 'fetch_site_info',
        vt: 30,
        qty: 1,
      });

    if (error) {
      console.error('Error reading from queue:', error);
      return;
    }

    if (!messages || messages.length === 0) {
      console.log('No messages in queue');
      return;
    }

    const message = messages[0] as unknown as SiteInfo;
    console.log('Processing message:', message);

    if (!message.msg_id) {
      console.error('Message missing msg_id:', message);
      return;
    }

    const msgId = parseInt(message.msg_id);

    // Check if site exists and belongs to user
    const { data: site, error: siteError } = await supabase
      .from('site')
      .select('*')
      .eq('id', message.message.site_id)
      .eq('created_by_user_id', message.message.user_id)
      .single();

    if (siteError || !site) {
      console.error('Site not found or unauthorized:', siteError);
      await updateJobStatus(msgId, 'error');
      return;
    }

    // Skip if site is archived
    if (site.state === 'inactive') {
      console.log('Site is archived, skipping:', site.id);
      await updateJobStatus(msgId, 'complete');
      return;
    }

    await updateJobStatus(msgId, 'in_progress');

    try {
      console.log('Fetching site info for:', site.url);
      const response = await fetch(message.message.url);
      const html = await response.text();
      const dom = new JSDOM(html);
      const title = dom.window.document.querySelector('title')?.textContent || '';

      // Update site with title and set to active
      const { error: updateError } = await supabase
        .from('site')
        .update({ 
          name: title,
          state: 'active'
        })
        .eq('id', message.message.site_id);

      if (updateError) {
        throw updateError;
      }

      console.log('Updated site with title and set to active:', title);
      await updateJobStatus(msgId, 'complete');
    } catch (err) {
      console.error('Error processing message:', err);
      await updateJobStatus(msgId, 'error');
    }

    // Delete the message from the queue for success or error
    await supabase.rpc('delete_message', {
      queue_name: 'fetch_site_info',
      msg_id: msgId,
    });
  } catch (err) {
    console.error('Error in processQueue:', err);
  }
}
