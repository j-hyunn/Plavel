'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, Map, Plus, ArrowRight, Trash2, MapPin, MoreHorizontal, Link2 } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { useMyPlans } from '@/hooks/useMyPlans';
import { trackEvent } from '@/lib/gtag';
import { useEffect } from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';

export default function MyPlansPage() {
    const router = useRouter();
    const { plans, isLoaded, deletePlan } = useMyPlans();

    useEffect(() => {
        trackEvent('view_my_plans');
    }, []);

    const handleShare = (planId: string) => {
        const url = `${window.location.origin}/my-plans/${planId}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success('여행 링크가 복사되었습니다.');
        }).catch(err => {
            console.error('Failed to copy link: ', err);
            toast.error('링크 복사에 실패했습니다.');
        });
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-24">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">내 여행</h1>
                <button
                    onClick={() => router.push('/my-plans/create')}
                    className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                >
                    + 여행 추가
                </button>
            </header>

            <main className="flex-1 w-full max-w-2xl mx-auto p-4 space-y-4">

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
                                        <Popover>
                                            <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-36 p-1 rounded-xl shadow-xl border-gray-100" align="end" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex flex-col">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShare(plan.id);
                                                        }}
                                                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                                    >
                                                        <Link2 className="w-4 h-4" />
                                                        <span>여행 공유</span>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('이 여행을 삭제하시겠습니까?')) {
                                                                deletePlan(plan.id);
                                                            }
                                                        }}
                                                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left font-medium"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>여행 삭제</span>
                                                    </button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
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
