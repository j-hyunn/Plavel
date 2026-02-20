'use client';
import BottomNav from '@/components/layout/BottomNav';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Calendar, MapPin, ChevronRight, Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { api } from '@/services/api';

export default function PostDetailPage() {
    const params = useParams();
    const postId = params.postId as string;
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await api.getPostDetail(postId);
                setPost(data);
            } catch (error) {
                console.error('Error fetching post detail:', error);
            } finally {
                setLoading(false);
            }
        };
        if (postId) fetchPost();
    }, [postId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>게시물을 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <BottomNav />

            <main className=" pb-28 min-h-screen flex justify-center">
                <div className="w-full max-w-[935px] py-8 px-4">
                    <div className="flex flex-col lg:flex-row instagram-card overflow-hidden">
                        {/* Image Section */}
                        <div className="flex-1 bg-black flex items-center justify-center">
                            <img src={post.cover_image_url} alt={post.title} className="w-full h-auto object-contain max-h-[700px]" />
                        </div>

                        {/* Content Section */}
                        <div className="w-full lg:w-[450px] flex flex-col h-full lg:h-[700px] border-l border-[var(--border)]">
                            {/* Header */}
                            <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                                    <img src={post.author?.avatar_url || 'https://i.pravatar.cc/150'} alt={post.author?.nickname} className="w-full h-full object-cover" />
                                </div>
                                <span className="font-semibold text-sm">{post.author?.nickname || 'Unknown'}</span>
                            </div>

                            {/* Itinerary Info */}
                            <div className="p-4 flex-1 overflow-y-auto space-y-6">
                                <div>
                                    <h1 className="text-xl font-bold mb-2">{post.title}</h1>
                                    <div className="flex items-center gap-2 text-sm text-[var(--secondary-text)]">
                                        <Calendar className="w-4 h-4" />
                                        <span>{post.travel_start_date} {post.travel_end_date ? `~ ${post.travel_end_date}` : ''}</span>
                                    </div>
                                </div>

                                {post.day_plans && post.day_plans.length > 0 && (
                                    <div className="space-y-4">
                                        <h2 className="font-semibold text-sm border-b border-[var(--border)] pb-2 uppercase tracking-wide">Day-by-Day Route</h2>
                                        {post.day_plans.map((day: any) => (
                                            <div key={day.id} className="relative pl-6 border-l-2 border-gray-100 pb-4 last:pb-0">
                                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--primary-button)] flex items-center justify-center">
                                                    <span className="text-[8px] text-white font-bold">{day.day_number}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-sm">{day.title}</h3>
                                                    <p className="text-sm text-gray-600 leading-relaxed">{day.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-4 text-sm leading-relaxed">
                                    <span className="font-semibold mr-2">{post.author?.nickname}</span>
                                    {post.caption}
                                </div>
                            </div>

                            {/* Interaction */}
                            <div className="p-4 border-t border-[var(--border)]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-4">
                                        <Heart className="w-6 h-6 cursor-pointer" />
                                        <MessageCircle className="w-6 h-6 cursor-pointer" />
                                        <Send className="w-6 h-6 cursor-pointer" />
                                    </div>
                                    <Bookmark className="w-6 h-6 cursor-pointer" />
                                </div>
                                <p className="font-semibold text-sm">좋아요 {post.likes_count || 0}개</p>
                                <p className="text-[10px] text-[var(--secondary-text)] uppercase mt-1">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
