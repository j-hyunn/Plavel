-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL CHECK (char_length(trim(content)) > 0),
    created_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments select for all" 
ON public.comments FOR SELECT 
TO public 
USING (true);

CREATE POLICY "comments insert for authenticated" 
ON public.comments FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "comments delete for author" 
ON public.comments FOR DELETE 
TO public 
USING (author_id = auth.uid());
