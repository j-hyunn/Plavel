'use client';

import Link from 'next/link';
import { Home, Bookmark, Calendar, User, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { icon: <Home className="w-6 h-6" />, label: '피드', href: '/' },
        { icon: <Bookmark className="w-6 h-6" />, label: '저장', href: '/bookmarks' },
        { icon: <Calendar className="w-6 h-6" />, label: '내 일정', href: '/my-plans' },
        { icon: <User className="w-6 h-6" />, label: '프로필', href: '/u/me' },
    ];

    return (
        <div className="fixed bottom-6 w-full px-4 z-50 pointer-events-none flex justify-center">
            <div className="w-full max-w-[500px] flex items-end justify-between gap-4 pointer-events-auto">
                {/* Pill Container */}
                <div className="flex bg-white/80 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100/50 px-2 py-2 flex-1 justify-around items-center h-[72px]">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${isActive ? 'text-black font-bold' : 'text-gray-400 hover:text-gray-900'
                                    }`}
                            >
                                {item.icon}

                            </Link>
                        )
                    })}
                </div>

                {/* Glassmorphism Create Button */}
                <Link
                    href="/upload"
                    className="flex items-center justify-center w-[72px] h-[72px] rounded-full shrink-0 
                               transition-all duration-300 relative group overflow-hidden"
                    style={{
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.4)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 100%)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)'
                    }}
                >
                    {/* inner light reflection for liquid look */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent rounded-t-full" />
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Plus className="w-10 h-10 text-black relative z-10 transition-transform duration-300 group-hover:scale-110" />
                </Link>
            </div>
        </div>
    );
}
