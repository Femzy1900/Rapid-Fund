
-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments
CREATE POLICY "Anyone can view comments" 
  ON public.comments 
  FOR SELECT 
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Users can only delete their own comments
CREATE POLICY "Users can delete their own comments" 
  ON public.comments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create campaign images bucket in storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-images', 'Campaign Images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    bucket_id = 'campaign-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public access to view campaign images
CREATE POLICY "Public read access for campaign images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'campaign-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
  ON storage.objects
  FOR DELETE
  USING (
    auth.role() = 'authenticated' AND 
    bucket_id = 'campaign-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
