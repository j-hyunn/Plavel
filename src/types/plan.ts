import type { DayPlan } from '@/types';

export interface MyPlan {
    id: string;
    title: string;
    startDate: string | null;
    endDate: string | null;
    days: DayPlan[];
    createdAt: string;
}
