-- Create table for storing all generated stories for admin notifications
CREATE TABLE IF NOT EXISTS public.generated_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  user_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  story_content TEXT NOT NULL,
  genre TEXT,
  theme TEXT,
  character_type TEXT,
  title TEXT
);

-- Enable Row Level Security
ALTER TABLE public.generated_stories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for logged in and anonymous users)
CREATE POLICY "Anyone can insert stories"
ON public.generated_stories
FOR INSERT
WITH CHECK (true);

-- Create policy to allow service role to read all stories (for email function)
CREATE POLICY "Service role can read all stories"
ON public.generated_stories
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_generated_stories_created_at ON public.generated_stories(created_at DESC);