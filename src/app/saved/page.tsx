'use client';
import BottomNav from '@/components/layout/BottomNav';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';
import PostCard from '@/components/feed/PostCard';

export default function SavedPage() {
    const router = useRouter();
    const [savedPosts, setSavedPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSavedPosts = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            try {
                setUserId(session.user.id);
                const posts = await api.getSavedPosts(session.user.id);
                setSavedPosts(posts);
            } catch (error) {
                console.error('Error fetching saved posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedPosts();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans mb-16">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex justify-center items-center">
                <h1 className="text-lg font-bold text-gray-900">저장된 피드</h1>
            </header>

            <main className="flex-1 pb-28 min-h-screen flex justify-center pt-8">
                <div className="w-full max-w-[630px] px-0 sm:px-4">
                    <div className="max-w-[470px] mx-auto">
                        {savedPosts.length > 0 ? (
                            savedPosts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    id={post.id}
                                    username={post.author?.nickname || 'Unknown'}
                                    userImage={post.author?.avatar_url || 'https://i.pravatar.cc/150'}
                                    travelTitle={post.title}
                                    postImage={(() => {
                                        let coverImgs = [];
                                        try {
                                            const imgVal = post.images || post.cover_image_url;
                                            coverImgs = typeof imgVal === 'string' && imgVal.startsWith('[') ? JSON.parse(imgVal) : (Array.isArray(imgVal) ? imgVal : [imgVal]);
                                        } catch {
                                            coverImgs = [post.cover_image_url];
                                        }
                                        const all = [...coverImgs];
                                        post.day_plans?.forEach((dp: any) => { if (dp.images && Array.isArray(dp.images)) all.push(...dp.images); });
                                        return all;
                                    })()}
                                    caption={post.caption || ''}
                                    likes={post.likes_count || 0}
                                    timeAgo={new Date(post.created_at).toLocaleDateString()}
                                    travelStartDate={post.travel_start_date}
                                    travelEndDate={post.travel_end_date}
                                    isLiked={post.isLiked}
                                    isBookmarked={post.isBookmarked}
                                    currentUserId={userId || undefined}
                                />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white md:rounded-lg border border-[var(--border)]">
                                <p className="text-gray-500">저장된 피드가 없습니다.</p>
                                <p className="text-sm text-gray-400 mt-2">마음에 드는 여행기를 저장해보세요!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    );
}
