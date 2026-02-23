import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import type { MyPlan } from '@/types/plan';
import { DayPlan } from '@/types';

export const plansApi = {
    async fetchUserPlans(userId: string): Promise<MyPlan[]> {
        const { data, error } = await supabase
            .from('my_plans')
            .select(`
                *,
                my_plan_days (
                    *,
                    my_plan_places (*)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) handleSupabaseError(error, 'fetchUserPlans');

        if (!data) return [];

        return data.map(dbPlan => ({
            id: dbPlan.id,
            title: dbPlan.title,
            startDate: dbPlan.start_date,
            endDate: dbPlan.end_date,
            createdAt: dbPlan.created_at,
            days: (dbPlan.my_plan_days || [])
                .sort((a: any, b: any) => a.day_number - b.day_number)
                .map((day: any) => ({
                    id: day.id,
                    day_number: day.day_number,
                    title: day.title || '',
                    description: day.description || '',
                    actions: (day.my_plan_places || [])
                        .sort((a: any, b: any) => a.sequence - b.sequence)
                        .map((place: any) => ({
                            id: place.id,
                            address: place.place_name,
                            lat: place.lat,
                            lng: place.lng,
                            time: place.time,
                            google_types: place.google_types,
                        }))
                })) as DayPlan[]
        }));
    },

    async savePlan(plan: MyPlan, userId: string): Promise<void> {
        const { error: planError } = await supabase
            .from('my_plans')
            .upsert({
                id: plan.id,
                user_id: userId,
                title: plan.title,
                start_date: plan.startDate,
                end_date: plan.endDate,
                updated_at: new Date().toISOString(),
                created_at: plan.createdAt
            });

        if (planError) handleSupabaseError(planError, 'savePlan');

        await supabase.from('my_plan_days').delete().eq('plan_id', plan.id);

        if (plan.days && plan.days.length > 0) {
            const daysToInsert = plan.days.map(d => ({
                id: crypto.randomUUID(),
                plan_id: plan.id,
                day_number: d.day_number,
                title: d.title || null,
                description: d.description || null
            }));

            const { data: insertedDays, error: daysError } = await supabase
                .from('my_plan_days')
                .insert(daysToInsert)
                .select();

            if (daysError) handleSupabaseError(daysError, 'savePlan (days)');

            if (insertedDays) {
                const placesToInsert: any[] = [];
                for (let i = 0; i < plan.days.length; i++) {
                    const originalDay = plan.days[i];
                    const insertedDay = insertedDays.find(d => d.day_number === originalDay.day_number);
                    if (insertedDay && originalDay.actions) {
                        originalDay.actions.forEach((a, seq) => {
                            if (a.address) {
                                placesToInsert.push({
                                    day_id: insertedDay.id,
                                    place_name: a.address,
                                    lat: a.lat || null,
                                    lng: a.lng || null,
                                    google_types: a.google_types || null,
                                    time: a.time || null,
                                    sequence: seq
                                });
                            }
                        });
                    }
                }

                if (placesToInsert.length > 0) {
                    const { error: placesError } = await supabase.from('my_plan_places').insert(placesToInsert);
                    if (placesError) handleSupabaseError(placesError, 'savePlan (places)');
                }
            }
        }
    },

    async deletePlan(planId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('my_plans')
            .delete()
            .eq('id', planId)
            .eq('user_id', userId);

        if (error) handleSupabaseError(error, 'deletePlan');
    }
};
