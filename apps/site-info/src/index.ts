import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { SiteInfo } from '@laggernaut/types';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type JobStatus =
  | 'pending'
  | 'in_progress'
  | 'complete'
  | 'cancelling'
  | 'cancelled'
  | 'error';

async function updateJobStatus(messageId: string, status: JobStatus) {
  const { error } = await supabase
    .from('job')
    .update({ status })
    .eq('msg_id', messageId);

  if (error) {
    console.error('Error updating job status:', error);
  }
}

async function processQueue() {
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

    const message = messages[0] as SiteInfo;
    console.log('Processing message:', message);

    if (!message.msg_id) {
      console.error('Message missing msg_id:', message);
      return;
    }

    await updateJobStatus(message.msg_id, 'in_progress');

    try {
      // TODO: Add your site info fetching logic here
      console.log('Message body:', message.message);

      await updateJobStatus(message.msg_id, 'complete');
      
      // And delete the message from the queue
      await supabase.rpc('delete_message', {
        queue_name: 'fetch_site_info',
        msg_id: message.msg_id,
      });

    } catch (err) {
      console.error('Error processing message:', err);
      await updateJobStatus(message.msg_id, 'error');
    }
  } catch (err) {
    console.error('Error in processQueue:', err);
  }
}

// Start polling every 5 seconds
setInterval(processQueue, 5000);

// Initial poll
processQueue();
