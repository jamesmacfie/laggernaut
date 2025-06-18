-- Create the queue for getting page metrics
SELECT pgmq.create('fetch_page_metrics');

-- Enable RLS on queue tables
ALTER TABLE pgmq.q_fetch_page_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pgmq.a_fetch_page_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to access queue tables
CREATE POLICY "Service role can access queue tables" ON pgmq.q_fetch_page_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can access archive tables" ON pgmq.a_fetch_page_metrics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add page_performance to job_type enum
ALTER TYPE public.job_type ADD VALUE IF NOT EXISTS 'page_performance';

-- Add metrics columns to page table
ALTER TABLE public.page 
ADD COLUMN metrics JSONB,
ADD COLUMN metrics_updated_at TIMESTAMPTZ;

-- Create function to queue page metrics
CREATE OR REPLACE FUNCTION public.queue_fetch_page_metrics()
RETURNS TRIGGER AS $$
DECLARE
  site_user_id UUID;
BEGIN
  -- Get the created_by_user_id from the related site
  SELECT created_by_user_id INTO site_user_id
  FROM public.site
  WHERE id = NEW.site_id;

  -- Queue the fetch_page_metrics job
  PERFORM pgmq.send(
    'fetch_page_metrics',
    jsonb_build_object(
      'type', 'page_performance',
      'user_id', site_user_id,
      'site_id', NEW.site_id,
      'page_id', NEW.id,
      'url', NEW.url
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.queue_fetch_page_metrics() SECURITY DEFINER;

-- Create trigger to queue page metrics on page creation
CREATE TRIGGER trigger_queue_fetch_page_metrics
  AFTER INSERT ON public.page
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_fetch_page_metrics();

-- Add trigger to copy queue items to jobs table
CREATE TRIGGER trigger_copy_page_metrics_to_jobs
  AFTER INSERT ON pgmq.q_fetch_page_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.copy_queue_to_jobs();
