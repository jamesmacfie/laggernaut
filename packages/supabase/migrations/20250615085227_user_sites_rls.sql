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
