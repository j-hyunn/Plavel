'use client';

import React from 'react';
import { ExternalLink, MapPin, Plane, Utensils, BedDouble, Train } from 'lucide-react';
import { getDistance } from '@/lib/geo';

interface PlaceItemProps {
    place: any;
    prevPlace?: any;
    isLast?: boolean;
}

export default function PlaceItem({ place, prevPlace }: PlaceItemProps) {
    const googleTypes = place.google_types || [];
    const name = place.name?.toLowerCase() || '';

    const isAirport = name.includes('공항') || name.includes('airport') || googleTypes.includes('airport');
    const isFood = name.includes('식당') || name.includes('음식점') || name.includes('맛집') ||
        name.includes('카페') || name.includes('커피') || name.includes('레스토랑') ||
        name.includes('restaurant') || name.includes('cafe') || name.includes('bistro') ||
        name.includes('dining') || name.includes('chez') || name.includes('bar') ||
        googleTypes.some((t: string) => ['restaurant', 'food', 'cafe', 'bar', 'bakery', 'meal_takeaway', 'meal_delivery'].includes(t));
    const isLodging = name.includes('호텔') || name.includes('숙소') || name.includes('호스텔') ||
        name.includes('모텔') || name.includes('airbnb') || name.includes('hotel') ||
        name.includes('hostel') || name.includes('resort') || name.includes('inn') ||
        googleTypes.some((t: string) => ['lodging', 'hotel', 'motel', 'hostel', 'spa', 'campground'].includes(t));
    const isTrain = name.includes('역') || name.includes('기차') || name.includes('열차') ||
        name.includes('station') || name.includes('train') || name.includes('rail') ||
        googleTypes.some((t: string) => ['train_station', 'transit_station', 'subway_station', 'light_rail_station', 'bus_station'].includes(t));

    const Icon = isAirport ? Plane : isLodging ? BedDouble : isTrain ? Train : (isFood ? Utensils : MapPin);

    const distance = prevPlace && prevPlace.lat && prevPlace.lng && place.lat && place.lng
        ? getDistance(prevPlace.lat, prevPlace.lng, place.lat, place.lng)
        : null;

    const handlePlaceClick = () => {
        const url = place.lat && place.lng
            ? `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex flex-col w-full">
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
}
