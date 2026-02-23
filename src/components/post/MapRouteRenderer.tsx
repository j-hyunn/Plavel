'use client';

import { useState, useEffect } from 'react';
import { GoogleMap, MarkerF, PolylineF } from '@react-google-maps/api';

export interface MapPlace {
    name: string;
    lat: number;
    lng: number;
    dayNumber: number;
    google_types?: string[];
}

interface MapRouteRendererProps {
    allPlaces: MapPlace[];
    filteredPlaces: MapPlace[];
    selectedMapDay: string | number;
}

const DEFAULT_MAP_OPTIONS = {
    disableDefaultUI: true,
    gestureHandling: 'cooperative' as const
};

export default function MapRouteRenderer({ filteredPlaces }: MapRouteRendererProps) {
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
}
