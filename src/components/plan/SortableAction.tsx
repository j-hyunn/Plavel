'use client';

import React from 'react';
import { X, GripVertical, Trash2, Clock, MapPin } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import PlaceAutocomplete from '@/components/upload/PlaceAutocomplete';
import type { DayAction } from '@/types';

interface SortableActionProps {
    action: DayAction;
    actionIndex: number;
    idx: number;
    isLoaded: boolean;
    updateAction: (dayIdx: number, actionIdx: number, updates: Partial<DayAction>) => void;
    removeAction: (dayIdx: number, actionIdx: number) => void;
}

export default function SortableAction({ action, actionIndex, idx, isLoaded, updateAction, removeAction }: SortableActionProps) {
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
                "group flex items-start gap-2 bg-white rounded-xl transition-shadow p-2",
                isDragging ? "shadow-lg ring-1 ring-primary/20" : "border border-gray-100"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="p-2 pt-3 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors"
            >
                <GripVertical className="w-4 h-4" />
            </div>

            <div className="flex-1 space-y-2 py-1">
                {/* Time Input */}
                <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg w-fit">
                    <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {(() => {
                        const [h, m] = (action.time || '').split(':');
                        const parsedHour = h ? parseInt(h, 10) : null;
                        const isPM = parsedHour !== null && parsedHour >= 12;
                        const ampm = parsedHour !== null ? (isPM ? 'PM' : 'AM') : '';
                        const hour12 = parsedHour !== null ? String(parsedHour % 12 || 12).padStart(2, '0') : '';
                        const minute = m || '';

                        const handleTimeChange = (newAmpm: string, newHour12: string, newMinute: string) => {
                            if (!newAmpm || !newHour12 || !newMinute) return;
                            let hr24 = parseInt(newHour12, 10);
                            if (newAmpm === 'PM' && hr24 < 12) hr24 += 12;
                            if (newAmpm === 'AM' && hr24 === 12) hr24 = 0;
                            updateAction(idx, actionIndex, { time: `${String(hr24).padStart(2, '0')}:${newMinute}` });
                        };

                        const hasTime = !!action.time;

                        return (
                            <div className="flex items-center gap-1">
                                <div className={cn("flex items-center text-sm font-semibold gap-0.5", hasTime ? "text-gray-700" : "text-gray-400")}>
                                    <select
                                        value={ampm}
                                        onChange={(e) => handleTimeChange(e.target.value, hour12 || '12', minute || '00')}
                                        className="bg-transparent outline-none cursor-pointer appearance-none text-center hover:text-primary transition-colors pr-1"
                                    >
                                        <option value="" disabled hidden>오전/오후</option>
                                        <option value="AM" className="text-gray-800">오전</option>
                                        <option value="PM" className="text-gray-800">오후</option>
                                    </select>
                                    <select
                                        value={hour12}
                                        onChange={(e) => handleTimeChange(ampm || 'AM', e.target.value, minute || '00')}
                                        className="bg-transparent outline-none cursor-pointer appearance-none text-right w-5 hover:text-primary transition-colors"
                                    >
                                        <option value="" disabled hidden>시</option>
                                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(hVal => (
                                            <option key={hVal} value={hVal} className="text-gray-800">{hVal}</option>
                                        ))}
                                    </select>
                                    <span className={cn("font-bold mx-0.5", hasTime ? "text-gray-700" : "text-gray-300")}>:</span>
                                    <select
                                        value={minute}
                                        onChange={(e) => handleTimeChange(ampm || 'AM', hour12 || '12', e.target.value)}
                                        className="bg-transparent outline-none cursor-pointer appearance-none text-left w-5 hover:text-primary transition-colors"
                                    >
                                        <option value="" disabled hidden>분</option>
                                        {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(mVal => (
                                            <option key={mVal} value={mVal} className="text-gray-800">{mVal}</option>
                                        ))}
                                    </select>
                                </div>
                                {hasTime && (
                                    <button
                                        onClick={() => updateAction(idx, actionIndex, { time: '' })}
                                        className="p-0.5 hover:bg-gray-200 rounded-full text-gray-400 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* Location Input */}
                {isLoaded ? (
                    <PlaceAutocomplete
                        value={action.address}
                        onChange={(address, lat, lng, types) => updateAction(idx, actionIndex, { address, lat, lng, google_types: types })}
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
                className="p-2 pt-3 text-gray-400 hover:text-red-500 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
