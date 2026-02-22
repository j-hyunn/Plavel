-- posts 테이블에 caption(소감/디스크립션) 컬럼을 추가합니다.
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS caption text;
