-- Update job_type enum to include page_links
ALTER TYPE public.job_type ADD VALUE IF NOT EXISTS 'page_links';

-- Create the queue for getting page links
SELECT pgmq.create('fetch_page_links');

-- Enable RLS on queue tables
ALTER TABLE pgmq.q_fetch_page_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE pgmq.a_fetch_page_links ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to access queue tables
CREATE POLICY "Service role can access queue tables" ON pgmq.q_fetch_page_links
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can access archive tables" ON pgmq.a_fetch_page_links
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Copy from queue to jobs table
CREATE OR REPLACE FUNCTION public.copy_page_links_queue_to_jobs()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO job (
    msg_id,
    type,
    enqueued_at,
    vt,
    message,
    created_by_user_id,
    site_id
  ) VALUES (
    NEW.msg_id,
    COALESCE((NEW.message->>'type')::job_type, 'page_links'),
    NEW.enqueued_at,
    NEW.vt,
    NEW.message,
    (NEW.message->>'user_id')::UUID,
    (NEW.message->>'site_id')::UUID
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_copy_page_links_to_jobs
  AFTER INSERT ON pgmq.q_fetch_page_links
  FOR EACH ROW
  EXECUTE FUNCTION public.copy_page_links_queue_to_jobs();

CREATE OR REPLACE FUNCTION public.queue_fetch_page_links()
RETURNS TRIGGER AS $$
BEGIN
  -- Only queue if state is changing from pending to active
  IF OLD.state = 'pending' AND NEW.state = 'active' THEN
    PERFORM pgmq.send(
      'fetch_page_links',
      jsonb_build_object(
        'type', 'page_links',
        'user_id', NEW.created_by_user_id,
        'site_id', NEW.id,
        'url', NEW.url
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.queue_fetch_page_links() SECURITY DEFINER;

CREATE TRIGGER trigger_queue_fetch_page_links
  AFTER UPDATE ON public.site
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_fetch_page_links();


