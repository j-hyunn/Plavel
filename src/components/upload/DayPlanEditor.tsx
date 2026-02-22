import React from 'react';
import { Plus, X, MapPin, GripVertical, Trash2 } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    DragEndEvent,
    SensorDescriptor,
    SensorOptions
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import PlaceAutocomplete from '@/components/upload/PlaceAutocomplete';
import type { DayPlan, DayAction } from '@/types';

interface SortableActionProps {
    action: DayAction;
    actionIndex: number;
    idx: number;
    isLoaded: boolean;
    updateAction: (dayIdx: number, actionIdx: number, address: string, lat?: number, lng?: number, types?: string[]) => void;
    removeAction: (dayIdx: number, actionIdx: number) => void;
}

function SortableAction({ action, actionIndex, idx, isLoaded, updateAction, removeAction }: SortableActionProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: action.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        touchAction: 'none'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group flex items-center gap-2 bg-white rounded-xl transition-shadow",
                isDragging ? "shadow-lg ring-1 ring-primary/20" : ""
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
            >
                <GripVertical className="w-4 h-4" />
            </div>

            <div className="flex-1">
                {isLoaded ? (
                    <PlaceAutocomplete
                        value={action.address}
                        onChange={(address, lat, lng, types) => updateAction(idx, actionIndex, address, lat, lng, types)}
                    />
                ) : (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="구글지도 로딩중..."
                            className="w-full text-xs bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
                            disabled
                            value={action.address}
                        />
                    </div>
                )}
            </div>

            <button
                onClick={() => removeAction(idx, actionIndex)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}

interface DayPlanEditorProps {
    dayPlans: DayPlan[];
    isLoaded: boolean;
    sensors: SensorDescriptor<SensorOptions>[];
    updateDayPlan: (index: number, field: keyof DayPlan, value: string) => void;
    handleDayImageChange: (dayIndex: number, e: React.ChangeEvent<HTMLInputElement>) => void;
    removeDayImage: (dayIndex: number, imgIndex: number) => void;
    addAction: (dayIndex: number) => void;
    updateAction: (dayIdx: number, actionIdx: number, address: string, lat?: number, lng?: number, types?: string[]) => void;
    removeAction: (dayIdx: number, actionIdx: number) => void;
    handleDragEnd: (dayIndex: number, event: DragEndEvent) => void;
}

export default function DayPlanEditor({
    dayPlans,
    isLoaded,
    sensors,
    updateDayPlan,
    handleDayImageChange,
    removeDayImage,
    addAction,
    updateAction,
    removeAction,
    handleDragEnd
}: DayPlanEditorProps) {
    if (!dayPlans || dayPlans.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-gray-800">일정 상세</h3>
            </div>

            <div className="space-y-3">
                {dayPlans.map((day, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] focus-within:border-primary/30 focus-within:shadow-md transition-all">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center border border-primary/20 shadow-sm">
                            <span className="text-base font-black text-primary">D{day.day_number}</span>
                        </div>
                        <div className="flex-1 min-w-0 space-y-4 pt-1">
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="주요 장소나 테마"
                                    className="w-full text-base font-bold outline-none text-gray-800 placeholder:text-gray-300"
                                    value={day.title}
                                    onChange={(e) => updateDayPlan(idx, 'title', e.target.value)}
                                />
                                <textarea
                                    placeholder="무엇을 했는지 기록해보세요"
                                    className="w-full text-sm outline-none resize-none h-14 text-gray-500 placeholder:text-gray-300"
                                    value={day.description}
                                    onChange={(e) => updateDayPlan(idx, 'description', e.target.value)}
                                />
                            </div>

                            {/* Day Images Area */}
                            <div className="w-full flex gap-2 overflow-x-auto pb-2 scrollbar-none min-h-[80px]">
                                {(() => {
                                    const isFull = (day.images?.length || 0) >= 10;
                                    return (
                                        <label className={cn(
                                            "flex-shrink-0 w-20 h-20 flex flex-col items-center justify-center transition-all rounded-lg border-2 border-dashed",
                                            isFull
                                                ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60"
                                                : "bg-gray-50 hover:bg-gray-100 border-gray-200 cursor-pointer hover:border-primary/30"
                                        )}>
                                            <Plus className={cn("w-5 h-5", isFull ? "text-gray-300" : "text-gray-400")} />
                                            <span className="text-[10px] text-gray-400 font-bold mb-0.5">사진 추가</span>
                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tight">
                                                {day.images?.length || 0} / 10
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleDayImageChange(idx, e)}
                                                disabled={isFull}
                                            />
                                        </label>
                                    );
                                })()}
                                {day.images && day.images.map((img, imgIdx) => (
                                    <div key={imgIdx} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                        <img src={img} alt="day preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeDayImage(idx, imgIdx)}
                                            className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white backdrop-blur-sm"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Day Actions Area */}
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={(event) => handleDragEnd(idx, event)}
                                >
                                    <SortableContext
                                        items={day.actions.map(a => a.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-2">
                                            {day.actions.map((action, actionIndex) => (
                                                <SortableAction
                                                    key={action.id}
                                                    action={action}
                                                    actionIndex={actionIndex}
                                                    idx={idx}
                                                    isLoaded={isLoaded}
                                                    updateAction={updateAction}
                                                    removeAction={removeAction}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>

                                <button
                                    onClick={() => addAction(idx)}
                                    className="w-full flex items-center justify-center gap-1.5 py-2.5 mt-2 rounded-xl text-primary/70 hover:text-primary hover:bg-primary/5 border border-dashed border-primary/20 transition-all font-semibold text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>장소 추가</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
