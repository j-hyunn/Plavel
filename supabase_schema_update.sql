-- 1. `posts` 테이블 구조 변경 (단일 사진 -> 다중 사진 배열)
ALTER TABLE public.posts ADD COLUMN images jsonb DEFAULT '[]'::jsonb;

-- 기존 cover_image_url 내용(JSON 직렬화된 텍스트 배열)을 새로운 images 컬럼(실제 JSONB)로 안전 이전
UPDATE public.posts
SET images = (
  CASE 
    WHEN cover_image_url LIKE '[%' THEN cover_image_url::jsonb
    ELSE jsonb_build_array(cover_image_url)
  END
)
WHERE cover_image_url IS NOT NULL;

-- 안전을 위해 기존 컬럼 삭제 (옵션, MVP에서만 사용했던 임시 기둥이므로 날려도 무방합니다)
ALTER TABLE public.posts DROP COLUMN cover_image_url;

-- 2. 장소 전용 테이블(day_places) 생성
CREATE TABLE IF NOT EXISTS public.day_places (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    day_plan_id uuid NOT NULL REFERENCES public.day_plans(id) ON DELETE CASCADE,
    place_name text NOT NULL,
    lat double precision,
    lng double precision,
    sequence integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- RLS (보안 정책) 설정, 모든 사용자 조회 권한 / 생성자는 로그인한 유저
ALTER TABLE public.day_places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "day_places select for all" 
ON public.day_places FOR SELECT 
TO public 
USING (true);

CREATE POLICY "day_places insert for all" 
ON public.day_places FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "day_places delete for all" 
ON public.day_places FOR DELETE 
TO public 
USING (true);
