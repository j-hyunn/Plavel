'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
    pointerWithin,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { useLoadScript } from '@react-google-maps/api';
import { cn } from '@/lib/utils';
import { usePostUpload } from '@/hooks/usePostUpload';

import CoverImageUpload from '@/components/upload/CoverImageUpload';
import DateRangePicker from '@/components/upload/DateRangePicker';
import DayPlanEditor from '@/components/upload/DayPlanEditor';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

export default function CreatePostPage() {
    const router = useRouter();
    const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
    const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } });
    const keyboardSensor = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });
    const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const {
        coverImage,
        setCoverImage,
        title,
        setTitle,
        caption,
        setCaption,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        dayPlans,
        loading,
        isFormValid,
        handleCoverImageChange,
        handleDayImageChange,
        removeDayImage,
        updateDayPlan,
        addAction,
        updateAction,
        removeAction,
        handleDragEnd,
        handlePublish,
    } = usePostUpload();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                <div className="w-10">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-black transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                    새 일정 작성
                </h1>
                <div className="w-10 flex justify-end">
                    <button
                        onClick={handlePublish}
                        disabled={!isFormValid || loading}
                        className={cn(
                            "text-base font-bold transition-colors",
                            (!isFormValid || loading) ? "text-gray-300 cursor-not-allowed" : "text-primary hover:text-primary/80"
                        )}
                    >
                        {loading ? '...' : '공유'}
                    </button>
                </div>
            </header>

            <main className="flex-1 pb-10 mx-auto w-full max-w-2xl bg-white md:my-8 md:rounded-2xl md:shadow-sm md:overflow-hidden md:h-fit">
                <CoverImageUpload
                    coverImage={coverImage}
                    onImageChange={handleCoverImageChange}
                    onRemove={() => setCoverImage(null)}
                />

                <div className="p-5 space-y-8">
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="여행 제목 (예: 3박 4일 도쿄 여행)"
                            className="w-full text-xl font-bold outline-none placeholder:text-gray-300 border-b border-transparent focus:border-primary pb-2 transition-colors"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="어떤 여행이었나요? 간단한 소감을 남겨주세요."
                            className="w-full text-base outline-none resize-none h-20 text-gray-600 placeholder:text-gray-300"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                    </div>

                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                    />

                    <DayPlanEditor
                        dayPlans={dayPlans}
                        isLoaded={isLoaded}
                        sensors={sensors as any}
                        updateDayPlan={updateDayPlan}
                        handleDayImageChange={handleDayImageChange}
                        removeDayImage={removeDayImage}
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
