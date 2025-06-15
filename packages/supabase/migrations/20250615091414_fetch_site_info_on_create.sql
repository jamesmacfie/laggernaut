CREATE OR REPLACE FUNCTION public.queue_fetch_site_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue the fetch_site_info job using our public function
  PERFORM pgmq.send(
    'fetch_site_info',
    jsonb_build_object(
      'type', 'site_info',
      'user_id', NEW.created_by_user_id,
      'site_id', NEW.id,
      'url', NEW.url
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER FUNCTION public.queue_fetch_site_info() SECURITY DEFINER;

CREATE TRIGGER trigger_queue_fetch_site_info
  AFTER INSERT ON public.site
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_fetch_site_info();


