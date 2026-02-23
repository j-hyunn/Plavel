'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, Map, Plus, ArrowRight, Trash2, MapPin } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { useMyPlans } from '@/hooks/useMyPlans';
import { trackEvent } from '@/lib/gtag';
import { useEffect } from 'react';

export default function MyPlansPage() {
    const router = useRouter();
    const { plans, isLoaded, deletePlan } = useMyPlans();

    useEffect(() => {
        trackEvent('view_my_plans');
    }, []);

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-24">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4">
                <h1 className="text-xl font-bold text-gray-900">내 일정</h1>
            </header>

            <main className="flex-1 w-full max-w-2xl mx-auto p-4 space-y-4">
                <button
                    onClick={() => router.push('/my-plans/create')}
                    className="w-full bg-white border border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 transition-all outline-none rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-primary"
                >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <span className="font-bold">새로운 여행 일정 만들기</span>
                </button>

                {plans.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                        <Map className="w-12 h-12 text-gray-300" />
                        <div className="space-y-1">
                            <p className="font-semibold text-gray-600 text-lg">아직 등록된 일정이 없어요</p>
                            <p className="text-sm text-gray-400">나만의 여행 계획을 세워보세요</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 mt-6">
                        {plans.map((plan) => {
                            const totalPlaces = plan.days.reduce((sum, day) => sum + (day.actions?.length || 0), 0);

                            return (
                                <div
                                    key={plan.id}
                                    onClick={() => router.push(`/my-plans/${plan.id}`)}
                                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all relative group cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{plan.title}</h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('이 일정을 삭제하시겠습니까?')) {
                                                    deletePlan(plan.id);
                                                }
                                            }}
                                            className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            <span>
                                                {plan.startDate ? format(new Date(plan.startDate), 'yyyy.MM.dd') : '날짜 미정'}
                                                {' ~ '}
                                                {plan.endDate ? format(new Date(plan.endDate), 'yyyy.MM.dd') : '날짜 미정'}
                                            </span>
                                        </div>
                                        <span className="text-gray-200">|</span>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                            <span>방문 장소 {totalPlaces}개</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
