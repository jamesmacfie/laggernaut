import { supabase } from '../lib/supabase';
import { launch } from 'chrome-launcher';
import type { Result as LighthouseResult } from 'lighthouse';

type JobStatus =
  | 'pending'
  | 'in_progress'
  | 'complete'
  | 'cancelling'
  | 'cancelled'
  | 'error';

interface PageMetricsMessage {
  type: 'page_performance';
  user_id: string;
  site_id: string;
  page_id: string;
  url: string;
}

async function updateJobStatus(messageId: number, status: JobStatus) {
  const { error } = await supabase
    .from('job')
    .update({ status })
    .eq('msg_id', messageId);

  if (error) {
    console.error(`Error updating job ${messageId} to ${status}:`, error);
  }
}

async function runLighthouse(url: string) {
  const chrome = await launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info' as const,
    output: 'json' as const,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  try {
    // Dynamic import of lighthouse to avoid initialization issues
    const { default: lighthouse } = await import('lighthouse');
    const runnerResult = await lighthouse(url, options);
    
    if (!runnerResult?.lhr) {
      throw new Error('Lighthouse failed to return results');
    }

    const { lhr } = runnerResult;
    const metrics = {
      // Performance metrics
      performance_score: (lhr.categories.performance?.score ?? 0) * 100,
      first_contentful_paint: lhr.audits['first-contentful-paint']?.numericValue ?? 0,
      largest_contentful_paint: lhr.audits['largest-contentful-paint']?.numericValue ?? 0,
      total_blocking_time: lhr.audits['total-blocking-time']?.numericValue ?? 0,
      cumulative_layout_shift: lhr.audits['cumulative-layout-shift']?.numericValue ?? 0,
      speed_index: lhr.audits['speed-index']?.numericValue ?? 0,
      time_to_interactive: lhr.audits['interactive']?.numericValue ?? 0,

      // Accessibility metrics
      accessibility_score: (lhr.categories.accessibility?.score ?? 0) * 100,

      // Best Practices metrics
      best_practices_score: (lhr.categories['best-practices']?.score ?? 0) * 100,

      // SEO metrics
      seo_score: (lhr.categories.seo?.score ?? 0) * 100,

      // Resource metrics
      total_byte_weight: lhr.audits['total-byte-weight']?.numericValue ?? 0,
      dom_size: lhr.audits['dom-size']?.numericValue ?? 0,

      // Additional metrics
      resource_summary: Object.fromEntries(
        Object.entries(lhr.audits['resource-summary']?.details ?? {}).map(([key, value]) => [
          key,
          {
            requestCount: value?.requestCount ?? 0,
            transferSize: value?.transferSize ?? 0,
          },
        ])
      ),

      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return metrics;
  } catch (error) {
    console.error('Error running lighthouse:', error);
    throw error;
  } finally {
    await chrome.kill();
  }
}

export async function processPageMetricsQueue() {
  console.log('Checking for page metrics jobs...');
  
  try {
    const { data: messages, error } = await supabase.rpc('read_messages', {
      queue_name: 'fetch_page_metrics',
      vt: 300,
      qty: 1,
    });

    if (error) {
      console.error('Error reading from page_metrics queue:', error);
      return;
    }

    if (!messages || messages.length === 0) {
      console.log('No page metrics jobs found');
      return;
    }

    const message = messages[0];
    if (!message) {
      return;
    }

    const payload = message.message as unknown as PageMetricsMessage;
    console.log('Processing page_metrics message:', payload);

    if (!message.msg_id) {
      console.error('Message missing msg_id:', message);
      return;
    }

    const msgId = parseInt(message.msg_id.toString());
    await updateJobStatus(msgId, 'in_progress');

    try {
      const metrics = await runLighthouse(payload.url);
      console.log('Metrics:', metrics);
      await updateJobStatus(msgId, 'complete');
    } catch (err) {
      console.error('Error processing message:', err);
      await updateJobStatus(msgId, 'error');
    }

    console.log(`Deleting message ${message.msg_id} from page_metrics queue.`);
    await supabase.rpc('delete_message', {
      queue_name: 'fetch_page_metrics',
      msg_id: msgId,
    });
  } catch (err) {
    console.error('Error in processPageMetricsQueue:', err);
  }
}
