'use client';

import { useEffect, useState } from 'react';

export default function PwaSplash() {
    const [visible, setVisible] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // PWA standalone 모드일 때만 표시
        const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

        if (!isStandalone) return;

        setVisible(true);

        // 1.5초 후 fade-out 시작
        const timer1 = setTimeout(() => setFadeOut(true), 1500);
        // fade-out 후 완전히 제거
        const timer2 = setTimeout(() => setVisible(false), 2000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
            style={{
                transition: 'opacity 0.5s ease',
                opacity: fadeOut ? 0 : 1,
                pointerEvents: 'none',
            }}
        >
            {/* applogo.svg inline */}
            <img
                src="/applogo.svg"
                alt="Plavel"
                className="w-48 h-auto mb-4"
                draggable={false}
            />
            <p className="text-sm font-medium" style={{ color: '#933FFB', letterSpacing: '-0.01em' }}>
                P들을 위한 J들의 여행 커뮤니티
            </p>
        </div>
    );
}
