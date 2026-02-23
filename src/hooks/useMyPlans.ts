import { useState, useEffect, useCallback } from 'react';
import type { MyPlan } from '@/types/plan';
import { api } from '@/services/api';
import { plansApi } from '@/services/plans';
import { useRouter } from 'next/navigation';

export function useMyPlans() {
    const router = useRouter();
    const [plans, setPlans] = useState<MyPlan[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const loadPlans = useCallback(async (uid: string) => {
        try {
            const data = await plansApi.fetchUserPlans(uid);
            setPlans(data);
        } catch (error) {
            console.error("Failed to fetch my plans", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            const session = await api.getSession();
            if (!session?.user) {
                if (mounted) {
                    setIsLoaded(true);
                    router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
                }
                return;
            }
            if (mounted) {
                setUserId(session.user.id);
                await loadPlans(session.user.id);
            }
        };

        init();

        return () => { mounted = false; };
    }, [loadPlans]);

    const savePlan = async (plan: MyPlan) => {
        if (!userId) {
            router.push('/login');
            return;
        }

        try {
            await plansApi.savePlan(plan, userId);

            // Update local state by either appending or replacing
            setPlans(prev => {
                const exists = prev.find(p => p.id === plan.id);
                if (exists) {
                    return prev.map(p => p.id === plan.id ? plan : p);
                }
                return [plan, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            });
        } catch (error) {
            alert('일정 저장에 실패했습니다.');
        }
    };

    const deletePlan = async (id: string) => {
        if (!userId) return;

        try {
            await plansApi.deletePlan(id, userId);
            setPlans(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            alert('삭제에 실패했습니다.');
        }
    };

    const getPlan = (id: string) => {
        return plans.find(p => p.id === id);
    };

    return {
        plans,
        isLoaded,
        savePlan,
        deletePlan,
        getPlan
    };
}
