-- Drop the existing insecure policies
DROP POLICY IF EXISTS "Anyone can insert stories" ON public.generated_stories;
DROP POLICY IF EXISTS "Service role can read all stories" ON public.generated_stories;

-- Create secure policies that require authentication
CREATE POLICY "Authenticated users can insert their own stories"
ON public.generated_stories
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own stories"
ON public.generated_stories
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add policy for admin access (if needed later)
CREATE POLICY "Service role can manage all stories"
ON public.generated_stories
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);