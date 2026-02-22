'use client';

import { useEffect, useState, useRef } from 'react';
import { X, ChevronRightIcon, ChevronLeftIcon } from 'lucide-react';

interface FullscreenImageViewerProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
}

export default function FullscreenImageViewer({
    images,
    initialIndex,
    onClose,
}: FullscreenImageViewerProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentIndex, onClose]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = currentIndex * scrollRef.current.offsetWidth;
        }
    }, [currentIndex]);

    const handleNext = () => {
        if (images.length === 0 || !scrollRef.current) return;
        const nextIdx = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIdx);
        scrollRef.current.scrollTo({ left: nextIdx * scrollRef.current.offsetWidth, behavior: 'smooth' });
    };

    const handlePrev = () => {
        if (images.length === 0 || !scrollRef.current) return;
        const prevIdx = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(prevIdx);
        scrollRef.current.scrollTo({ left: prevIdx * scrollRef.current.offsetWidth, behavior: 'smooth' });
    };

    if (!images || images.length === 0) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm transition-all animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[110] bg-gradient-to-b from-black/60 to-transparent">
                <div className="text-white font-bold text-sm bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                    {currentIndex + 1} / {images.length}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="p-2 bg-black/40 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all z-50 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all z-[110] cursor-pointer"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all z-[110] cursor-pointer"
            >
                <ChevronRightIcon className="w-6 h-6" />
            </button>

            <div
                ref={scrollRef}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
                onScroll={(e) => {
                    const scrollLeft = e.currentTarget.scrollLeft;
                    const width = e.currentTarget.offsetWidth;
                    if (width > 0) {
                        setCurrentIndex(Math.round(scrollLeft / width));
                    }
                }}
            >
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className="flex-shrink-0 w-full h-full flex flex-col items-center justify-center snap-center snap-always p-4 pt-20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={img}
                            alt={`fullsize ${idx}`}
                            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
