-- Create RLS policies for site table
CREATE POLICY "Users can view their own sites"
ON public.site
FOR SELECT
TO authenticated
USING (auth.uid() = created_by_user_id);

CREATE POLICY "Users can update their own sites"
ON public.site
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by_user_id)
WITH CHECK (auth.uid() = created_by_user_id);

CREATE POLICY "Users can delete their own sites"
ON public.site
FOR DELETE
TO authenticated
USING (auth.uid() = created_by_user_id);

CREATE POLICY "Enable insert for authenticated users only"
ON public.site
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by_user_id);

-- Enable real-time for site table
ALTER PUBLICATION supabase_realtime ADD TABLE public.site;