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
    console.error(`Error updating job ${messageId} to ${status}:`, error);
  }
}

export async function processPageLinksQueue() {
  try {
    const { data: messages, error } = await supabase.rpc('read_messages', {
      queue_name: 'fetch_page_links',
      vt: 300, // 5 minutes visibility timeout for potentially long crawls
      qty: 1,
    });

    if (error) {
      console.error('Error reading from page_links queue:', error);
      return;
    }

    if (!messages || messages.length === 0) {
      // console.log('No messages in page_links queue');
      return;
    }

    const message = messages[0] as unknown as SiteInfo;
    console.log('Processing page_links message:', message);

    if (!message.msg_id) {
      console.error('Message missing msg_id:', message);
      return;
    }

    const msgId = parseInt(message.msg_id);

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

    if (site.state === 'inactive') {
      console.log('Site is inactive, skipping:', site.id);
      await updateJobStatus(msgId, 'complete');
      return;
    }

    await updateJobStatus(msgId, 'in_progress');

    try {
      console.log(`Fetching page links for: ${site.url} with scan_depth: ${site.scan_depth}`);
      
      const siteUrl = new URL(site.url);
      const maxDepth = Math.min(site.scan_depth || 1, 2);

      const crawlQueue: { url: string; depth: number }[] = [{ url: site.url, depth: 0 }];
      const visitedUrls = new Set<string>([site.url]);
      const allFoundLinks = new Set<string>();

      while (crawlQueue.length > 0) {
        const { url, depth } = crawlQueue.shift()!;

        if (depth >= maxDepth) {
          console.log(`[Depth ${depth}] Reached max depth for ${url}. Halting this path.`);
          continue;
        }

        console.log(`[Depth ${depth}] Crawling: ${url}`);
        
        try {
          const response = await fetch(url);
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('text/html')) {
            console.warn(`[Depth ${depth}] Skipping non-HTML content at ${url}`);
            continue;
          }
          
          const html = await response.text();
          const dom = new JSDOM(html);
          const links = dom.window.document.querySelectorAll('a');
          
          console.log(`[Depth ${depth}] Found ${links.length} links on ${url}`);
          
          for (const link of links) {
            const href = link.getAttribute('href');
            if (!href) continue;
            
            try {
              const absoluteUrl = new URL(href, url);
              
              if (absoluteUrl.origin !== siteUrl.origin) {
                continue; // Not on the same domain
              }

              absoluteUrl.search = ''; // Remove search params
              absoluteUrl.hash = ''; // Remove fragment
              const normalizedUrl = absoluteUrl.toString();

              if (!visitedUrls.has(normalizedUrl)) {
                console.log(`[Depth ${depth}] Discovered new URL: ${normalizedUrl}`);
                visitedUrls.add(normalizedUrl);
                allFoundLinks.add(normalizedUrl);
                if (depth + 1 < maxDepth) {
                  crawlQueue.push({ url: normalizedUrl, depth: depth + 1 });
                }
              }
            } catch (e) {
              console.warn(`[Depth ${depth}] Invalid URL found on ${url}: ${href}`);
            }
          }
        } catch (err) {
            console.error(`[Depth ${depth}] Error fetching or parsing ${url}:`, err);
        }
      }

      const output = Array.from(allFoundLinks).map(link => ({
        'Site': site.url,
        'Found URL': link
      }));

      console.log(`Finished crawling. Found ${output.length} unique links for site: ${site.url}`);
      console.table(output);
      
      // TODO: Save the found links to the 'page' table

      await updateJobStatus(msgId, 'complete');
    } catch (err) {
      console.error('Error processing message:', err);
      await updateJobStatus(msgId, 'error');
    }

    console.log(`Deleting message ${message.msg_id} from page_links queue.`);
    await supabase.rpc('delete_message', {
      queue_name: 'fetch_page_links',
      msg_id: msgId,
    });
  } catch (err) {
    console.error('Error in processPageLinksQueue:', err);
  }
}
