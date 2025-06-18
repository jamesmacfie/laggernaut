-- Add scanDepth column to site table
ALTER TABLE public.site ADD COLUMN scan_depth INTEGER NOT NULL DEFAULT 1;

-- Create page state enum and table
CREATE TYPE public.page_state AS ENUM ('pending', 'active', 'inactive');

CREATE TABLE public.page (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.site(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT,
  state public.page_state NOT NULL DEFAULT 'pending',
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on page table
ALTER TABLE public.page ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_page_site_id ON public.page(site_id);
CREATE INDEX idx_page_url ON public.page(url);

-- Add trigger for updated_at
CREATE TRIGGER update_page_updated_at 
  BEFORE UPDATE ON public.page 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create RLS policies for page table
CREATE POLICY "Users can view their own site pages"
ON public.page
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.site
    WHERE site.id = page.site_id
    AND site.created_by_user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own site pages"
ON public.page
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.site
    WHERE site.id = page.site_id
    AND site.created_by_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.site
    WHERE site.id = page.site_id
    AND site.created_by_user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own site pages"
ON public.page
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.site
    WHERE site.id = page.site_id
    AND site.created_by_user_id = auth.uid()
  )
);

CREATE POLICY "Enable insert for authenticated users only on their sites"
ON public.page
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.site
    WHERE site.id = page.site_id
    AND site.created_by_user_id = auth.uid()
  )
);

-- Enable real-time for page table
ALTER PUBLICATION supabase_realtime ADD TABLE public.page;
