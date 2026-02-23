'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft, Calendar, MapPin, Clock, ExternalLink, Plane, Utensils, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { useLoadScript, GoogleMap, MarkerF, PolylineF } from '@react-google-maps/api';

import { useMyPlans } from '@/hooks/useMyPlans';
import type { MyPlan } from '@/types/plan';
import { cn } from '@/lib/utils';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    if (d < 1000) return `${Math.round(d)}m`;
    return `${(d / 1000).toFixed(1)}km`;
}

interface MapPlace {
    name: string;
    lat: number;
    lng: number;
    dayNumber: number;
    google_types?: string[];
}

const DEFAULT_MAP_OPTIONS = { disableDefaultUI: true, gestureHandling: 'cooperative' as const };

const MapRouteRenderer = ({ allPlaces, filteredPlaces, selectedMapDay }: { allPlaces: MapPlace[], filteredPlaces: MapPlace[], selectedMapDay: string | number }) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);

    useEffect(() => {
        if (map && filteredPlaces.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            filteredPlaces.forEach(p => {
                if (Math.abs(Number(p.lat)) > 0) bounds.extend({ lat: Number(p.lat), lng: Number(p.lng) });
            });

            if (filteredPlaces.length === 1) {
                map.setCenter({ lat: Number(filteredPlaces[0].lat), lng: Number(filteredPlaces[0].lng) });
                map.setZoom(14);
            } else {
                map.fitBounds(bounds, 50);
            }
        }
    }, [map, filteredPlaces]);

    if (!filteredPlaces.length) return null;

    const days = Array.from(new Set(filteredPlaces.map(p => p.dayNumber)));

    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: Number(filteredPlaces[0].lat), lng: Number(filteredPlaces[0].lng) }}
            zoom={14}
            options={DEFAULT_MAP_OPTIONS}
            onLoad={map => setMap(map)}
        >
            {days.map(dayNum => {
                const dayPlaces = filteredPlaces.filter(p => p.dayNumber === dayNum);
                return (
                    <PolylineF
                        key={`poly-day-${dayNum}`}
                        path={dayPlaces.map(p => ({ lat: Number(p.lat), lng: Number(p.lng) }))}
                        options={{ strokeColor: '#933FFB', strokeOpacity: 0.8, strokeWeight: 3 }}
                    />
                );
            })}
            {filteredPlaces.map((p, pIdx) => (
                <MarkerF
                    key={`marker-${p.dayNumber}-${pIdx}`}
                    position={{ lat: Number(p.lat), lng: Number(p.lng) }}
                    label={{ text: String(pIdx + 1), color: 'white', fontSize: '11px', fontWeight: 'bold' }}
                    title={`Day ${p.dayNumber} - ${p.name}`}
                />
            ))}
        </GoogleMap>
    );
};

export default function PlanDetailPage() {
    const params = useParams();
    const router = useRouter();
    const planId = params.planId as string;

    const { getPlan, isLoaded } = useMyPlans();
    const [plan, setPlan] = useState<MyPlan | null>(null);
    const [selectedMapDay, setSelectedMapDay] = useState<number | 'all'>('all');

    const { isLoaded: isMapLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 py-3">
                <button onClick={() => router.back()} className="text-gray-900 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 ml-2">
                    내 일정 상세
                </h1>
                <button onClick={() => router.push(`/my-plans/${planId}/edit`)} className="p-1 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors bg-white border border-gray-200 shadow-sm rounded-full px-3 py-1.5">
                    <Pencil className="w-3.5 h-3.5" />
                    수정
                </button>
            </header>

            <main className="flex-1 pb-10 mx-auto w-full max-w-2xl bg-white md:my-8 md:rounded-2xl md:shadow-sm md:h-fit">
                <div className="p-5 space-y-8">
                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{plan.title}</h1>
                        <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl w-full">
                            <div className="flex-1 space-y-1.5 flex flex-col items-center">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block text-center">시작일</label>
                                <div className="flex items-center gap-1.5 justify-center">
                                    <Calendar className="w-4 h-4 text-primary/60" />
                                    <span className="text-base font-semibold text-gray-700">
                                        {plan.startDate ? format(new Date(plan.startDate), 'yyyy.MM.dd') : '-'}
                                    </span>
                                </div>
                            </div>
                            <div className="w-px bg-gray-200 my-1"></div>
                            <div className="flex-1 space-y-1.5 flex flex-col items-center">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block text-center">종료일</label>
                                <div className="flex items-center gap-1.5 justify-center">
                                    <Calendar className="w-4 h-4 text-primary/60" />
                                    <span className="text-base font-semibold text-gray-700">
                                        {plan.endDate ? format(new Date(plan.endDate), 'yyyy.MM.dd') : '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 relative">
                        {/* Day Filter Slider */}
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-4">
                            <button
                                onClick={() => setSelectedMapDay('all')}
                                className={cn("whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-colors", selectedMapDay === 'all' ? "bg-primary text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-100")}
                            >
                                전체
                            </button>
                            {plan.days.map((day) => (
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
                        {isMapLoaded && (() => {
                            const mapPlaces: MapPlace[] = [];
                            plan.days.forEach(day => {
                                if (day.actions) {
                                    day.actions.forEach((a) => {
                                        if (a.lat && a.lng) {
                                            mapPlaces.push({ name: a.address, lat: a.lat, lng: a.lng, dayNumber: day.day_number, google_types: a.google_types });
                                        }
                                    });
                                }
                            });

                            const filteredPlaces = selectedMapDay === 'all'
                                ? mapPlaces
                                : mapPlaces.filter(p => p.dayNumber === selectedMapDay);

                            if (mapPlaces.length === 0) return null;

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

                        <div className="space-y-3 pt-2">
                            {plan.days
                                .filter((day) => selectedMapDay === 'all' || day.day_number === selectedMapDay)
                                .map((day) => (
                                    <div key={day.day_number} className="flex gap-3 items-start bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all">
                                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center border border-primary/20 shadow-sm">
                                            <span className="text-base font-black text-primary">D{day.day_number}</span>
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-4 pt-1">
                                            <div className="space-y-1">
                                                {day.title && <h3 className="text-base font-bold text-gray-800">{day.title}</h3>}
                                                {day.description && <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">{day.description}</p>}
                                            </div>

                                            {day.actions && day.actions.length > 0 && (
                                                <div className="pt-2 border-t border-gray-100 mt-3 pt-4">
                                                    {day.actions.map((action, pIdx) => {
                                                        const googleTypes = action.google_types || [];
                                                        const name = action.address?.toLowerCase() || '';
                                                        const isAirport = name.includes('공항') || name.includes('airport') || googleTypes.includes('airport');
                                                        const isFood = name.includes('식당') || name.includes('음식점') || name.includes('맛집') ||
                                                            name.includes('카페') || name.includes('커피') || name.includes('레스토랑') ||
                                                            name.includes('restaurant') || name.includes('cafe') || name.includes('bistro') ||
                                                            name.includes('dining') || name.includes('chez') || name.includes('bar') ||
                                                            googleTypes.some((t: string) => ['restaurant', 'food', 'cafe', 'bar', 'bakery', 'meal_takeaway', 'meal_delivery'].includes(t));
                                                        const Icon = isAirport ? Plane : (isFood ? Utensils : MapPin);

                                                        const prevAction = pIdx > 0 ? day.actions[pIdx - 1] : null;
                                                        const distance = prevAction && prevAction.lat && prevAction.lng && action.lat && action.lng
                                                            ? getDistance(prevAction.lat, prevAction.lng, action.lat, action.lng)
                                                            : null;

                                                        const handlePlaceClick = (e: React.MouseEvent) => {
                                                            e.stopPropagation();
                                                            const url = action.lat && action.lng
                                                                ? `https://www.google.com/maps/search/?api=1&query=${action.lat},${action.lng}`
                                                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(action.address)}`;
                                                            window.open(url, '_blank');
                                                        };

                                                        return (
                                                            <div key={action.id || pIdx} className="flex flex-col w-full">
                                                                {distance && (
                                                                    <div className="flex items-center pl-[27px] py-0.5">
                                                                        <div className="h-5 w-px border-l-2 border-dashed border-primary/30"></div>
                                                                        <span className="text-[10px] font-bold text-primary px-2 opacity-80">{distance}</span>
                                                                    </div>
                                                                )}
                                                                <div
                                                                    onClick={handlePlaceClick}
                                                                    className="group flex items-center gap-3 bg-gray-50/80 rounded-xl p-3 border border-gray-100/50 hover:bg-white hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer"
                                                                >
                                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                                                        <Icon className="w-4 h-4 text-primary" />
                                                                    </div>

                                                                    <div className="flex-1 flex items-center justify-between gap-2 overflow-hidden">
                                                                        <span className="text-sm font-semibold text-gray-800 leading-tight truncate">{action.address}</span>

                                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                                            {action.time && (
                                                                                <div className="flex items-center gap-1 text-[11px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-md">
                                                                                    {action.time}
                                                                                </div>
                                                                            )}
                                                                            <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary transition-colors" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
