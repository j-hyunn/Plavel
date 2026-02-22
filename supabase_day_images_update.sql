-- day_plans 테이블에 일별 이미지를 저장할 컬럼을 추가합니다.
ALTER TABLE public.day_plans ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
