'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [pullY, setPullY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const startY = useRef(0);
    const currentY = useRef(0);
    const isAtTop = useRef(true);

    useEffect(() => {
        const handleScroll = () => {
            isAtTop.current = window.scrollY <= 0;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!isAtTop.current) return;
        startY.current = e.touches[0].clientY;
        currentY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isAtTop.current || isRefreshing) return;
        currentY.current = e.touches[0].clientY;
        const diff = currentY.current - startY.current;

        // Only pull down
        if (diff > 0) {
            // Damping effect to resist pulling further down seamlessly
            const dampedDiff = Math.min(diff * 0.4, 150);
            setPullY(dampedDiff);
        }
    };

    const handleTouchEnd = async () => {
        if (pullY > 60 && !isRefreshing) {
            setIsRefreshing(true);
            setPullY(60); // Hold Spinner height
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                setPullY(0);
            }
        } else {
            setPullY(0);
        }
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full relative min-h-screen"
        >
            {/* Spinner Container */}
            <div
                className="absolute top-0 w-full flex justify-center items-center overflow-hidden transition-all duration-300 z-40 bg-transparent"
                style={{ height: `${pullY}px`, opacity: pullY > 20 ? 1 : 0 }}
            >
                <div
                    className={`p-2 bg-white rounded-full shadow-md text-primary flex items-center justify-center ${isRefreshing ? 'animate-spin' : ''}`}
                    style={{ transform: `rotate(${pullY * 3}deg)` }}
                >
                    <Loader2 className="w-5 h-5" />
                </div>
            </div>

            {/* Content Container */}
            <div
                className="w-full transition-transform duration-300"
                style={{ transform: `translateY(${pullY}px)` }}
            >
                {children}
            </div>
        </div>
    );
}
