import React, { useState } from 'react';
import { X, Check, Plus, Calendar, MapPin, Type } from 'lucide-react';
import { useMyPlans } from '@/hooks/useMyPlans';
import { cn } from '@/lib/utils';
import type { DayPlan } from '@/types';
import type { MyPlan } from '@/types/plan';

interface ScrapPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    dayData: DayPlan;
}

export default function ScrapPlanModal({ isOpen, onClose, dayData }: ScrapPlanModalProps) {
    const { plans, isLoaded, savePlan } = useMyPlans();
    const [selectedPlanId, setSelectedPlanId] = useState<string>('');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newPlanTitle, setNewPlanTitle] = useState('');
    const [targetDayIndex, setTargetDayIndex] = useState<number>(-1);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (!isCreatingNew && !selectedPlanId) return;
        if (isCreatingNew && !newPlanTitle.trim()) {
            alert('여행 제목을 입력해주세요.');
            return;
        }

        setIsSaving(true);
        try {
            let targetPlan: MyPlan | undefined;

            if (isCreatingNew) {
                // Create a completely new plan
                targetPlan = {
                    id: crypto.randomUUID(),
                    title: newPlanTitle.trim(),
                    startDate: new Date().toISOString(),
                    endDate: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    days: []
                };
            } else {
                targetPlan = plans.find(p => p.id === selectedPlanId);
            }

            if (!targetPlan) return;

            const newDay: DayPlan = {
                day_number: targetDayIndex === -1 ? targetPlan.days.length + 1 : targetDayIndex + 1,
                title: `${targetDayIndex === -1 ? targetPlan.days.length + 1 : targetDayIndex + 1}일차 일정`,
                description: '',
                actions: (dayData.actions || []).map(a => ({
                    id: crypto.randomUUID(),
                    address: a.address,
                    lat: a.lat,
                    lng: a.lng,
                    time: a.time,
                    google_types: a.google_types
                }))
            };

            const updatedDays = [...targetPlan.days];

            if (targetDayIndex === -1) {
                updatedDays.push(newDay);
            } else {
                const existingDay = updatedDays[targetDayIndex];
                updatedDays[targetDayIndex] = {
                    ...existingDay,
                    actions: [...existingDay.actions, ...newDay.actions]
                };
            }

            const finalPlan = { ...targetPlan, days: updatedDays };
            await savePlan(finalPlan);

            alert(isCreatingNew ? '새 일정이 생성되고 추가되었습니다.' : '일정이 추가되었습니다.');
            onClose();
        } catch (error) {
            console.error('Failed to scrap plan', error);
            alert('일정 추가에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white rounded-2xl w-full max-w-md relative animate-in fade-in zoom-in duration-200 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">내 일정에 추가</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {!isLoaded ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Mode Toggle / New Plan Input */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                                    {isCreatingNew ? '새 여행 만들기' : '여행 선택'}
                                </label>

                                {isCreatingNew ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="relative group">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                                                <Type className="w-4 h-4" />
                                            </div>
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="예: 제주도 3박 4일 여행"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-primary/30 focus:bg-white transition-all text-sm font-semibold"
                                                value={newPlanTitle}
                                                onChange={(e) => setNewPlanTitle(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={() => setIsCreatingNew(false)}
                                            className="text-[11px] font-bold text-primary hover:underline ml-1"
                                        >
                                            기존 일정에서 선택하기
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-2 overflow-y-auto max-h-64 pr-1 scrollbar-thin">
                                        <button
                                            onClick={() => setIsCreatingNew(true)}
                                            className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-left mb-1"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-primary">새로운 여행 일정 만들기</p>
                                                <p className="text-[10px] text-primary/60 mt-0.5">새로운 일정 공간을 즉시 생성합니다</p>
                                            </div>
                                        </button>

                                        {plans.length === 0 ? (
                                            <div className="text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-100">
                                                <p className="text-[11px] text-gray-400 font-bold">기존 일정이 없습니다.</p>
                                            </div>
                                        ) : (
                                            plans.map((plan) => (
                                                <button
                                                    key={plan.id}
                                                    onClick={() => {
                                                        setSelectedPlanId(plan.id);
                                                        setTargetDayIndex(-1);
                                                        setIsCreatingNew(false);
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                                        selectedPlanId === plan.id && !isCreatingNew
                                                            ? "bg-primary/5 border-primary shadow-sm"
                                                            : "bg-gray-50 border-gray-100 hover:border-gray-200"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                                        selectedPlanId === plan.id && !isCreatingNew ? "bg-primary text-white" : "bg-white text-gray-400"
                                                    )}>
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn("text-sm font-bold truncate", selectedPlanId === plan.id && !isCreatingNew ? "text-primary" : "text-gray-800")}>
                                                            {plan.title}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 mt-0.5">
                                                            {plan.days.length}개의 일자 구성
                                                        </p>
                                                    </div>
                                                    {selectedPlanId === plan.id && !isCreatingNew && <Check className="w-4 h-4 text-primary" />}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Date Selection */}
                            {(isCreatingNew || selectedPlanId) && (
                                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">날짜 선택</label>
                                    <div className="flex flex-wrap gap-2">
                                        {!isCreatingNew && plans.find(p => p.id === selectedPlanId)?.days.map((day, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setTargetDayIndex(idx)}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                                                    targetDayIndex === idx
                                                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                                        : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                                                )}
                                            >
                                                Day {day.day_number}에 합치기
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setTargetDayIndex(-1)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-xs font-bold transition-all border border-dashed flex items-center gap-1.5",
                                                targetDayIndex === -1
                                                    ? "bg-primary/10 border-primary/30 text-primary"
                                                    : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                                            )}
                                        >
                                            <Plus className="w-3 h-3" />
                                            새로운 일자로 추가 (Day {isCreatingNew ? 1 : (plans.find(p => p.id === selectedPlanId)?.days.length || 0) + 1})
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={(!isCreatingNew && !selectedPlanId) || isSaving || (isCreatingNew && !newPlanTitle.trim())}
                        className="flex-1 px-4 py-3 text-sm font-bold text-white bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        {isSaving ? '추가 중...' : '확인'}
                    </button>
                </div>
            </div>
        </div>
    );
}
