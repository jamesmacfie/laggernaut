-- Grant permissions on pgmq schema sequences to authenticated users
GRANT USAGE, SELECT, UPDATE
ON ALL SEQUENCES IN SCHEMA pgmq
TO authenticated;

-- Grant permissions on pgmq schema functions to authenticated users
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA pgmq TO authenticated;

-- Grant permissions on all pgmq tables to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA pgmq TO authenticated;

-- Mark copy functions as SECURITY DEFINER
ALTER FUNCTION public.copy_page_links_queue_to_jobs() SECURITY DEFINER; 