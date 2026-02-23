-- 1. My Plans Table (독립적인 내 일정 저장소)
CREATE TABLE IF NOT EXISTS public.my_plans (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. My Plan Days Table (일정의 날짜별 정보)
CREATE TABLE IF NOT EXISTS public.my_plan_days (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id uuid NOT NULL REFERENCES public.my_plans(id) ON DELETE CASCADE,
    day_number integer NOT NULL,
    title text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. My Plan Places Table (날짜별 상세 액션/장소/시간 정보)
CREATE TABLE IF NOT EXISTS public.my_plan_places (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    day_id uuid NOT NULL REFERENCES public.my_plan_days(id) ON DELETE CASCADE,
    place_name text NOT NULL,
    lat double precision,
    lng double precision,
    google_types jsonb,
    time text,
    sequence integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- RLS 활성화 (보안)
ALTER TABLE public.my_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.my_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.my_plan_places ENABLE ROW LEVEL SECURITY;

-- 4. My Plans 정책 (모든 권한: 본인만)
CREATE POLICY "Users can fully manage their own plans" 
ON public.my_plans FOR ALL 
USING (auth.uid() = user_id);

-- 5. My Plan Days 정책 (모든 권한: 본인만)
CREATE POLICY "Users can fully manage their own plan days" 
ON public.my_plan_days FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.my_plans 
        WHERE my_plans.id = my_plan_days.plan_id AND my_plans.user_id = auth.uid()
    )
);

-- 6. My Plan Places 정책 (모든 권한: 본인만)
CREATE POLICY "Users can fully manage their own plan places" 
ON public.my_plan_places FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.my_plan_days 
        JOIN public.my_plans ON my_plans.id = my_plan_days.plan_id
        WHERE my_plan_days.id = my_plan_places.day_id AND my_plans.user_id = auth.uid()
    )
);
