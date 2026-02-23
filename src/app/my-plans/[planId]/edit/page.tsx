'use client';

import { X } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useLoadScript } from '@react-google-maps/api';
import { cn } from '@/lib/utils';
import { usePlanEditor } from '@/hooks/usePlanEditor';
import { useMyPlans } from '@/hooks/useMyPlans';
import DateRangePicker from '@/components/upload/DateRangePicker';
import SharedDayEditor from '@/components/plan/SharedDayEditor';
import type { MyPlan } from '@/types/plan';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

function EditPlanForm({ initialPlan }: { initialPlan: MyPlan }) {
    const router = useRouter();
    const { savePlan } = useMyPlans();

    const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
    const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } });
    const keyboardSensor = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });
    const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const {
        title, setTitle,
        startDate, setStartDate,
        endDate, setEndDate,
        days,
        updateDay,
        addAction,
        updateAction,
        removeAction,
        handleDragEnd,
        isFormValid
    } = usePlanEditor(initialPlan);

    const handleSave = () => {
        if (!isFormValid) return;

        const updatedPlan: MyPlan = {
            ...initialPlan,
            title,
            startDate: startDate ? startDate.toISOString() : null,
            endDate: endDate ? endDate.toISOString() : null,
            days,
        };

        // savePlan updates local storage. `useMyPlans` saves based on matching ID, or appends it.
        // Wait, does `savePlan` append duplicate? Let's check `useMyPlans.ts`
        // Actually, let's just use savePlan and if it's broken, we fix useMyPlans.ts
        savePlan(updatedPlan);
        router.push(`/my-plans/${initialPlan.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                <div className="w-10">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-black transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    일정 수정
                </h1>
                <div className="w-10 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={!isFormValid}
                        className={cn(
                            "text-base font-bold transition-colors",
                            !isFormValid ? "text-gray-300 cursor-not-allowed" : "text-primary hover:text-primary/80"
                        )}
                    >
                        저장
                    </button>
                </div>
            </header>

            <main className="flex-1 pb-10 mx-auto w-full max-w-2xl bg-white md:my-8 md:rounded-2xl md:shadow-sm md:overflow-hidden md:h-fit">
                <div className="p-5 space-y-8">
                    <div className="space-y-4 pt-4">
                        <input
                            type="text"
                            placeholder="여행 제목 (예: 홋카이도 겨울 여행)"
                            className="w-full text-2xl font-black outline-none placeholder:text-gray-300 border-b border-transparent focus:border-primary pb-2 transition-colors text-gray-900"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                    />

                    <SharedDayEditor
                        days={days}
                        isLoaded={isLoaded}
                        sensors={sensors as any}
                        updateDay={updateDay}
                        addAction={addAction}
                        updateAction={updateAction}
                        removeAction={removeAction}
                        handleDragEnd={handleDragEnd}
                    />
                </div>
            </main>
        </div>
    );
}

export default function EditPlanPage() {
    const params = useParams();
    const router = useRouter();
    const planId = params.planId as string;

    const { getPlan, isLoaded } = useMyPlans();
    const [plan, setPlan] = useState<MyPlan | null>(null);

    useEffect(() => {
        if (isLoaded) {
            const data = getPlan(planId);
            if (data) {
                setPlan(data);
            } else {
                alert('일정을 찾을 수 없습니다.');
                router.replace('/my-plans');
            }
        }
    }, [isLoaded, planId, getPlan, router]);

    if (!isLoaded || !plan) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <EditPlanForm initialPlan={plan} />;
}
