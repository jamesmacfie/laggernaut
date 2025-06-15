CREATE SCHEMA IF NOT EXISTS pgmq_public;
 
CREATE OR REPLACE FUNCTION send_message(
  queue_name TEXT,
  message JSONB,
  delay_seconds INTEGER DEFAULT 0
)
RETURNS BIGINT
LANGUAGE SQL
SECURITY DEFINER 
AS $$
  SELECT pgmq.send(queue_name, message, delay_seconds);
$$;

CREATE OR REPLACE FUNCTION read_messages(
  queue_name TEXT,
  vt INTEGER DEFAULT 30,
  qty INTEGER DEFAULT 1
)
RETURNS TABLE(msg_id BIGINT, read_ct INTEGER, enqueued_at TIMESTAMP WITH TIME ZONE, vt TIMESTAMP WITH TIME ZONE, message JSONB)
LANGUAGE SQL
SECURITY DEFINER 
AS $$
  SELECT * FROM pgmq.read(queue_name, vt, qty);
$$;

CREATE OR REPLACE FUNCTION delete_message(
  queue_name TEXT,
  msg_id BIGINT
)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER 
AS $$
  SELECT pgmq.delete(queue_name, msg_id);
$$;

GRANT USAGE ON SCHEMA pgmq_public TO  service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA pgmq_public TO  service_role;
