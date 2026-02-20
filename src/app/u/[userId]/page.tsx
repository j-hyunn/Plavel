'use client';
import BottomNav from '@/components/layout/BottomNav';

import { useEffect, useState } from 'react';
import { Settings, Grid, Bookmark, UserSquare2, Heart, MessageCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                let targetId = userId;
                if (userId === 'me') {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        router.push('/login');
                        return;
                    }
                    targetId = session.user.id;
                }

                const data = await api.getUserProfile(targetId);
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!profile) {
        return <div className="min-h-screen flex items-center justify-center">유저를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <BottomNav />

            <main className=" pb-28 min-h-screen flex justify-center">
                <div className="w-full max-w-[935px] py-8 px-4">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-20 mb-12 px-4">
                        <div className="w-20 h-20 md:w-36 md:h-36 rounded-full overflow-hidden border border-gray-200">
                            <img src={profile.avatar_url || 'https://i.pravatar.cc/300'} alt="profile" className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <h2 className="text-xl font-light">{profile.nickname}</h2>
                                {userId === 'me' && (
                                    <div className="flex gap-2">
                                        <button className="bg-gray-100 hover:bg-gray-200 font-semibold py-1.5 px-4 rounded-lg text-sm transition-colors">프로필 편집</button>
                                        <Settings className="w-6 h-6 cursor-pointer" />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center md:justify-start gap-10">
                                <span className="text-sm">여행기 <span className="font-semibold">{profile.posts?.length || 0}</span></span>
                                <span className="text-sm">팔로워 <span className="font-semibold">0</span></span>
                                <span className="text-sm">팔로잉 <span className="font-semibold">0</span></span>
                            </div>

                            <div className="space-y-1">
                                <h1 className="font-semibold text-sm">{profile.nickname}</h1>
                                <p className="text-sm">{profile.bio || '나만의 여행 일정을 공유합니다.'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-t border-[var(--border)] flex justify-center gap-12">
                        <div className="flex items-center gap-1.5 border-t border-black -mt-[1px] py-4 cursor-pointer">
                            <Grid className="w-3 h-3 uppercase" />
                            <span className="text-xs font-semibold">여행기</span>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-3 gap-1 md:gap-7">
                        {profile.posts?.map((post: any) => (
                            <div key={post.id} onClick={() => router.push(`/p/${post.id}`)} className="aspect-square bg-gray-100 relative group cursor-pointer overflow-hidden">
                                <img src={post.cover_image_url} alt="post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                                    <div className="flex items-center gap-1">
                                        <Heart className="w-6 h-6 fill-white" />
                                        <span>0</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="w-6 h-6 fill-white" />
                                        <span>0</span>
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
