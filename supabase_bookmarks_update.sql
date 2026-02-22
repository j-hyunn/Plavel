-- Bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (user_id, post_id)
);

-- RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookmarks select for all" 
ON public.bookmarks FOR SELECT 
TO public 
USING (true);

CREATE POLICY "bookmarks insert for authenticated" 
ON public.bookmarks FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "bookmarks delete for owner" 
ON public.bookmarks FOR DELETE 
TO public 
USING (true);
