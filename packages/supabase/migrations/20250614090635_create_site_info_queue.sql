-- Enable the pgmq extension
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Create the queue for getting site info
SELECT pgmq.create('fetch_site_info');

-- Create function to handle updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- I need sites table
CREATE TYPE public.site_state AS ENUM ('pending', 'active', 'inactive');

CREATE TABLE public.site (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  name TEXT,
  state public.site_state NOT NULL DEFAULT 'pending',
  thumbnail_url TEXT,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_site_url ON public.site(url);
CREATE INDEX idx_site_created_by_user_id ON public.site(created_by_user_id);

CREATE TRIGGER update_site_updated_at 
  BEFORE UPDATE ON public.site 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- We're going to use this stuff to see job status
CREATE TYPE public.job_type AS ENUM ('site_info');
CREATE TYPE public.job_status AS ENUM ('pending', 'in_progress', 'complete', 'cancelling', 'cancelled', 'error');

CREATE TABLE public.job (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.site(id) ON DELETE SET NULL,
  created_by_user_id UUID NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
  msg_id BIGINT NOT NULL,
  type public.job_type NOT NULL,
  status public.job_status NOT NULL DEFAULT 'pending',
  enqueued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vt TIMESTAMPTZ NOT NULL,
  message JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_msg_id ON public.job(msg_id);
CREATE INDEX idx_job_created_by_user_id ON public.job(created_by_user_id);
CREATE INDEX idx_job_site_id ON public.job(site_id);

CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON public.job 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Forgot user table last migration
CREATE TRIGGER update_user_updated_at 
  BEFORE UPDATE ON public.user 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();


-- Now, immediately copy from the Supabase queue table to our job table
CREATE OR REPLACE FUNCTION public.copy_queue_to_jobs()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into job table, extracting metadata from the message JSONB
  -- Expects always a type, user_id and site_id in the message JSONB
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
    (NEW.message->>'type')::job_type,
    NEW.enqueued_at,
    NEW.vt,
    NEW.message,
    (NEW.message->>'user_id')::UUID, -- Extract from message JSON
    (NEW.message->>'site_id')::UUID -- Extract from message JSON (can be null)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_copy_to_jobs
  -- This is the queue we created earlier
  AFTER INSERT ON pgmq.q_fetch_site_info
  FOR EACH ROW
  EXECUTE FUNCTION public.copy_queue_to_jobs();