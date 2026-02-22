'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, MapPin, Plane, Utensils } from 'lucide-react';
import { GoogleMap, MarkerF, PolylineF } from '@react-google-maps/api';
import { cn } from '@/lib/utils';
import type { DayPlan } from '@/types';

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
            options={{ disableDefaultUI: true, gestureHandling: 'greedy' }}
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

interface DayPlanListProps {
    dayPlans: DayPlan[];
    isMapLoaded: boolean;
    onImageClick: (url: string, allImages: string[]) => void;
}

export default function DayPlanList({ dayPlans, isMapLoaded, onImageClick }: DayPlanListProps) {
    const [selectedMapDay, setSelectedMapDay] = useState<number | 'all'>('all');

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
                return { name: p.place_name, lat: p.lat, lng: p.lng, google_types: p.google_types };
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

        return { ...day, textDesc, parsedPlaces, images: dayImages };
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
                        <div key={day.id || day.day_number} className="flex gap-3 items-start bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center border border-primary/20 shadow-sm">
                                <span className="text-base font-black text-primary">D{day.day_number}</span>
                            </div>
                            <div className="flex-1 min-w-0 space-y-4 pt-1">
                                <div className="space-y-1">
                                    {day.title && <h3 className="text-base font-bold text-gray-800">{day.title}</h3>}
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
                                    <div className="pt-2 border-t border-gray-100 mt-3 pt-4">
                                        {day.parsedPlaces.map((place: any, pIdx: number) => {
                                            const googleTypes = place.google_types || [];
                                            const name = place.name?.toLowerCase() || '';
                                            const isAirport = name.includes('공항') || name.includes('airport') || googleTypes.includes('airport');
                                            const isFood = name.includes('식당') || name.includes('음식점') || name.includes('맛집') ||
                                                name.includes('카페') || name.includes('커피') || name.includes('레스토랑') ||
                                                name.includes('restaurant') || name.includes('cafe') || name.includes('bistro') ||
                                                name.includes('dining') || name.includes('chez') || name.includes('bar') ||
                                                googleTypes.some((t: string) => ['restaurant', 'food', 'cafe', 'bar', 'bakery', 'meal_takeaway', 'meal_delivery'].includes(t));
                                            const Icon = isAirport ? Plane : (isFood ? Utensils : MapPin);

                                            const prevPlace = pIdx > 0 ? day.parsedPlaces[pIdx - 1] : null;
                                            const distance = prevPlace && prevPlace.lat && prevPlace.lng && place.lat && place.lng
                                                ? getDistance(prevPlace.lat, prevPlace.lng, place.lat, place.lng)
                                                : null;

                                            const handlePlaceClick = (e: React.MouseEvent) => {
                                                e.stopPropagation();
                                                const url = place.lat && place.lng
                                                    ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
                                                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
                                                window.open(url, '_blank');
                                            };

                                            return (
                                                <div key={pIdx} className="flex flex-col w-full">
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
                                                            <span className="text-xs font-semibold text-gray-800 leading-tight truncate">{place.name}</span>
                                                            <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
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
    );
}
