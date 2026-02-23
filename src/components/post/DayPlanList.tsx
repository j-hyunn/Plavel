'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, CalendarPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DayPlan } from '@/types';
import ScrapPlanModal from './ScrapPlanModal';
import MapRouteRenderer, { MapPlace } from './MapRouteRenderer';
import PlaceItem from './PlaceItem';
import type { User } from '@supabase/supabase-js';

interface DayPlanListProps {
    dayPlans: DayPlan[];
    isMapLoaded: boolean;
    onImageClick: (url: string, allImages: string[]) => void;
    currentUser: User | null;
}

export default function DayPlanList({ dayPlans, isMapLoaded, onImageClick, currentUser }: DayPlanListProps) {
    const router = useRouter();
    const [selectedMapDay, setSelectedMapDay] = useState<number | 'all'>('all');
    const [scrapDayData, setScrapDayData] = useState<DayPlan | null>(null);

    if (!dayPlans || dayPlans.length === 0) return null;

    const mapPlaces: MapPlace[] = [];
    const sortedDayPlans = [...dayPlans].sort((a, b) => a.day_number - b.day_number);

    const daysParsed = sortedDayPlans.map((day: any) => {
        let parsedPlaces: any[] = [];
        let textDesc = day.description || '';
        const dayImages = day.images || [];

        if (day.day_places && day.day_places.length > 0) {
            parsedPlaces = day.day_places.sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0)).map((p: any) => {
                if (p.lat && p.lng) {
                    mapPlaces.push({ name: p.place_name, lat: p.lat, lng: p.lng, dayNumber: day.day_number });
                }
                return { name: p.place_name, lat: p.lat, lng: p.lng, google_types: p.google_types, time: p.time };
            });
        } else {
            const descParts = (day.description || '').split('[방문 장소]');
            textDesc = descParts[0].trim();
            const placesStrs = descParts.length > 1 ? descParts[1].trim().split('\n').filter(Boolean) : [];

            parsedPlaces = placesStrs.map((pStr: string) => {
                const [name, coords] = pStr.split('|');
                if (coords) {
                    const [lat, lng] = coords.split(',').map(Number);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        mapPlaces.push({ name, lat, lng, dayNumber: day.day_number });
                    }
                    return { name, lat, lng };
                }
                return { name: pStr };
            });
        }

        const actions = parsedPlaces.map(p => ({
            id: crypto.randomUUID(),
            address: p.name || p.address || '',
            lat: p.lat,
            lng: p.lng,
            google_types: p.google_types,
            time: p.time
        }));

        return { ...day, textDesc, parsedPlaces, actions, images: dayImages };
    });

    return (
        <div className="px-5 pb-5">
            <h2 className="text-base font-extrabold text-gray-800 border-b border-gray-100 pb-2 mb-4">일정 상세 & 경로</h2>

            {/* Day Filter Slider */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-4">
                <button
                    onClick={() => setSelectedMapDay('all')}
                    className={cn("whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors", selectedMapDay === 'all' ? "bg-primary text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100")}
                >
                    전체
                </button>
                {daysParsed.map((day) => (
                    <button
                        key={day.day_number}
                        onClick={() => setSelectedMapDay(day.day_number)}
                        className={cn("whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors", selectedMapDay === day.day_number ? "bg-primary text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100")}
                    >
                        Day {day.day_number}
                    </button>
                ))}
            </div>

            {/* Google Map Route */}
            {isMapLoaded && mapPlaces.length > 0 && (() => {
                const filteredPlaces = selectedMapDay === 'all'
                    ? mapPlaces
                    : mapPlaces.filter(p => p.dayNumber === selectedMapDay);

                return (
                    <div className="w-full h-64 mb-6 bg-white rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
                        {filteredPlaces.length > 0 ? (
                            <MapRouteRenderer selectedMapDay={selectedMapDay} allPlaces={mapPlaces} filteredPlaces={filteredPlaces} />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                                <MapPin className="w-8 h-8 text-gray-300 mb-2" />
                                <p className="text-sm text-gray-400 font-medium">선택한 날짜에 표시할 장소가 없습니다.</p>
                            </div>
                        )}
                    </div>
                );
            })()}

            <div className="space-y-3">
                {daysParsed
                    .filter((day) => selectedMapDay === 'all' || day.day_number === selectedMapDay)
                    .map((day) => (
                        <div key={day.id || day.day_number} className="flex gap-4 items-start bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all">
                            <div className="flex-shrink-0 flex flex-col items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center border border-primary/20 shadow-sm">
                                    <span className="text-base font-black text-primary">D{day.day_number}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!currentUser) {
                                            alert('로그인이 필요한 기능입니다.');
                                            router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
                                            return;
                                        }
                                        setScrapDayData(day);
                                    }}
                                    className="flex flex-col items-center gap-1 text-primary hover:text-primary/70 transition-colors"
                                    title="일정 담기"
                                >
                                    <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                        <CalendarPlus className="w-4 h-4" />
                                    </div>
                                    <span className="text-[9px] font-bold">담기</span>
                                </button>
                            </div>
                            <div className="flex-1 min-w-0 space-y-4 pt-1">
                                <div className="space-y-1">
                                    {day.title && <h3 className="text-base font-bold text-gray-800 truncate">{day.title}</h3>}
                                    {day.textDesc && <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{day.textDesc}</p>}
                                </div>

                                {day.images && day.images.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none snap-x snap-mandatory">
                                        {day.images.map((img: string, i: number) => (
                                            <div key={i} className="relative flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden shadow-sm border border-gray-100/50 snap-start snap-always cursor-pointer" onClick={() => onImageClick(img, day.images)}>
                                                <img src={img} alt={`day ${day.day_number} photo ${i}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {day.parsedPlaces && day.parsedPlaces.length > 0 && (
                                    <div className="pt-2 border-t border-gray-100 mt-2">
                                        {day.parsedPlaces.map((place: any, pIdx: number) => (
                                            <PlaceItem
                                                key={pIdx}
                                                place={place}
                                                prevPlace={pIdx > 0 ? day.parsedPlaces[pIdx - 1] : null}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
            {scrapDayData && (
                <ScrapPlanModal
                    isOpen={!!scrapDayData}
                    onClose={() => setScrapDayData(null)}
                    dayData={scrapDayData}
                />
            )}
        </div>
    );
}
