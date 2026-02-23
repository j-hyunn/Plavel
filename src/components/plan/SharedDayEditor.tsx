import React from 'react';
import { Plus, X } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    DragEndEvent,
    SensorDescriptor,
    SensorOptions
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import type { DayPlan, DayAction } from '@/types';
import SortableAction from './SortableAction';
interface SharedDayEditorProps {
    days: DayPlan[];
    isLoaded: boolean;
    sensors: SensorDescriptor<SensorOptions>[];
    updateDay: (index: number, field: keyof DayPlan, value: string) => void;
    handleDayImageChange?: (dayIndex: number, e: React.ChangeEvent<HTMLInputElement>) => void;
    removeDayImage?: (dayIndex: number, imgIndex: number) => void;
    addAction: (dayIndex: number) => void;
    updateAction: (dayIdx: number, actionIdx: number, updates: Partial<DayAction>) => void;
    removeAction: (dayIdx: number, actionIdx: number) => void;
    handleDragEnd: (dayIndex: number, event: DragEndEvent) => void;
}

export default function SharedDayEditor({
    days,
    isLoaded,
    sensors,
    updateDay,
    handleDayImageChange,
    removeDayImage,
    addAction,
    updateAction,
    removeAction,
    handleDragEnd
}: SharedDayEditorProps) {
    if (!days || days.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-gray-800">일정 상세</h3>
            </div>

            <div className="space-y-4">
                {days.map((day, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] focus-within:border-primary/30 focus-within:shadow-md transition-all">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center border border-primary/20 shadow-sm">
                            <span className="text-base font-black text-primary">D{day.day_number}</span>
                        </div>
                        <div className="flex-1 min-w-0 space-y-3 pt-1">
                            <input
                                type="text"
                                placeholder="주요 장소나 테마"
                                className="w-full text-base font-bold outline-none text-gray-800 placeholder:text-gray-300 pb-2 border-b border-transparent focus:border-gray-100 transition-colors"
                                value={day.title}
                                onChange={(e) => updateDay(idx, 'title', e.target.value)}
                            />

                            <textarea
                                placeholder="이 날의 전반적인 일정이나 메모를 자유롭게 적어주세요 (선택)"
                                className="w-full text-sm outline-none text-gray-600 placeholder:text-gray-400 bg-gray-50/50 hover:bg-gray-50 focus:bg-gray-50 p-3 rounded-xl border border-transparent focus:border-primary/20 transition-all resize-none min-h-[80px]"
                                value={day.description || ''}
                                onChange={(e) => updateDay(idx, 'description', e.target.value)}
                            />

                            {handleDayImageChange && removeDayImage && (
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
                                                <span className="text-[9px] text-gray-300">{(day.images?.length || 0)}/10</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    className="hidden"
                                                    onChange={(e) => !isFull && handleDayImageChange(idx, e)}
                                                    disabled={isFull}
                                                />
                                            </label>
                                        );
                                    })()}
                                    {day.images && day.images.map((img, imgIdx) => (
                                        <div key={imgIdx} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-100 shadow-sm group">
                                            <img src={img} alt={`preview ${imgIdx}`} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => removeDayImage(idx, imgIdx)}
                                                className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 hover:text-white"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Plan Actions Area */}
                            <div className="space-y-2 pt-1">
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
