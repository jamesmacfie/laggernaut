-- Create timestamp function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Create page_performance table
CREATE TABLE public.page_performance (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    site_id uuid NOT NULL REFERENCES public.site(id) ON DELETE CASCADE,
    page_id uuid NOT NULL REFERENCES public.page(id) ON DELETE CASCADE,
    created_by_job_id uuid REFERENCES public.job(id),
    performance_score decimal NOT NULL,
    first_contentful_paint decimal NOT NULL,
    largest_contentful_paint decimal NOT NULL,
    total_blocking_time decimal NOT NULL,
    cumulative_layout_shift decimal NOT NULL,
    speed_index decimal NOT NULL,
    time_to_interactive decimal NOT NULL,
    accessibility_score decimal NOT NULL,
    best_practices_score decimal NOT NULL,
    seo_score decimal NOT NULL,
    total_byte_weight integer NOT NULL,
    dom_size integer NOT NULL,
    resource_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create updated_at trigger
CREATE TRIGGER set_page_performance_updated_at
    BEFORE UPDATE ON public.page_performance
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- Add RLS
ALTER TABLE public.page_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies based on site ownership
CREATE POLICY "Users can view page performance for their sites"
ON public.page_performance
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.site
        WHERE site.id = page_performance.site_id
        AND site.created_by_user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert page performance for their sites"
ON public.page_performance
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.site
        WHERE site.id = page_performance.site_id
        AND site.created_by_user_id = auth.uid()
    )
);

CREATE POLICY "Users can update page performance for their sites"
ON public.page_performance
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.site
        WHERE site.id = page_performance.site_id
        AND site.created_by_user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.site
        WHERE site.id = page_performance.site_id
        AND site.created_by_user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete page performance for their sites"
ON public.page_performance
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.site
        WHERE site.id = page_performance.site_id
        AND site.created_by_user_id = auth.uid()
    )
);

-- Create policy for service role to access page_performance table
CREATE POLICY "Service role can access page_performance table"
ON public.page_performance
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add indexes
CREATE INDEX idx_page_performance_site_id ON public.page_performance(site_id);
CREATE INDEX idx_page_performance_page_id ON public.page_performance(page_id);
CREATE INDEX idx_page_performance_created_by_job_id ON public.page_performance(created_by_job_id);
