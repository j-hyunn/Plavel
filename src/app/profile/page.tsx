'use client';
import BottomNav from '@/components/layout/BottomNav';

import { Settings, Grid, Bookmark, UserSquare2, Heart, MessageCircle } from 'lucide-react';

const MOCK_POSTS = Array.from({ length: 9 }).map((_, i) => ({
    id: i,
    image: `https://images.unsplash.com/photo-${1500000000000 + i}?w=400&h=400&fit=crop`,
}));

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-white">
            <BottomNav />

            <main className=" pb-28 min-h-screen flex justify-center">
                <div className="w-full max-w-[935px] py-8 px-4">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-20 mb-12 px-4">
                        <div className="w-20 h-20 md:w-40 md:h-40 rounded-full overflow-hidden border border-gray-200">
                            <img src="https://i.pravatar.cc/300" alt="profile" className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <h2 className="text-xl font-light">traveler_dev</h2>
                                <div className="flex gap-2">
                                    <button className="bg-gray-100 hover:bg-gray-200 font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors">프로필 편집</button>
                                    <button className="bg-gray-100 hover:bg-gray-200 font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors">보관된 스토리 보기</button>
                                    <Settings className="w-6 h-6 cursor-pointer" />
                                </div>
                            </div>

                            <div className="flex justify-center md:justify-start gap-10">
                                <span className="text-sm">게시물 <span className="font-semibold">42</span></span>
                                <span className="text-sm">팔로워 <span className="font-semibold">1,234</span></span>
                                <span className="text-sm">팔로잉 <span className="font-semibold">567</span></span>
                            </div>

                            <div className="space-y-1">
                                <h1 className="font-semibold text-sm">Traveler Developer</h1>
                                <p className="text-sm">Coding my way through the world ✈️💻</p>
                                <a href="#" className="text-primary text-sm font-semibold">github.com/traveler-dev</a>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-t border-[var(--border)] flex justify-center gap-12">
                        <div className="flex items-center gap-1.5 border-t border-black -mt-[1px] py-4 cursor-pointer">
                            <Grid className="w-3 h-3 uppercase" />
                            <span className="text-xs font-semibold">게시물</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 py-4 cursor-pointer">
                            <Bookmark className="w-3 h-3 uppercase" />
                            <span className="text-xs font-semibold">저장됨</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 py-4 cursor-pointer">
                            <UserSquare2 className="w-3 h-3 uppercase" />
                            <span className="text-xs font-semibold">태그됨</span>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-3 gap-1 md:gap-7">
                        {MOCK_POSTS.map((post) => (
                            <div key={post.id} className="aspect-square bg-gray-100 relative group cursor-pointer overflow-hidden">
                                <img src={post.image} alt="post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                                    <div className="flex items-center gap-1">
                                        <Heart className="w-6 h-6 fill-white" />
                                        <span>85</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="w-6 h-6 fill-white" />
                                        <span>12</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

