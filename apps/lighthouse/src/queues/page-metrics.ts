import { supabase } from '../lib/supabase';
import { launch } from 'chrome-launcher';

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
  const { data: job, error } = await supabase
    .from('job')
    .update({ status })
    .eq('msg_id', messageId)
    .select('id')
    .single();

  if (error) {
    console.error(`Error updating job ${messageId} to ${status}:`, error);
    return null;
  }

  return job;
}

async function savePagePerformance(metrics: any, payload: PageMetricsMessage, jobId: string) {
  const { error } = await supabase.from('page_performance').insert({
    site_id: payload.site_id,
    page_id: payload.page_id,
    created_by_job_id: jobId,
    performance_score: metrics.performance_score,
    first_contentful_paint: metrics.first_contentful_paint,
    largest_contentful_paint: metrics.largest_contentful_paint,
    total_blocking_time: metrics.total_blocking_time,
    cumulative_layout_shift: metrics.cumulative_layout_shift,
    speed_index: metrics.speed_index,
    time_to_interactive: metrics.time_to_interactive,
    accessibility_score: metrics.accessibility_score,
    best_practices_score: metrics.best_practices_score,
    seo_score: metrics.seo_score,
    total_byte_weight: metrics.total_byte_weight,
    dom_size: metrics.dom_size,
    resource_summary: metrics.resource_summary
  });

  if (error) {
    console.error('Error saving page performance:', error);
    throw error;
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
      )
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
    const job = await updateJobStatus(msgId, 'in_progress');

    try {
      const metrics = await runLighthouse(payload.url);
      console.log('Metrics:', metrics);
      
      if (job?.id) {
        await savePagePerformance(metrics, payload, job.id);
      }
      
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
