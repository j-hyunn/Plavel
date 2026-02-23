'use client';

import { useState } from 'react';
import { Calendar, Heart, MessageCircle, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Post, DayPlan } from '@/types';
import type { User } from '@supabase/supabase-js';

type ExtendedPost = Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number; day_plans: DayPlan[] };

interface PostDetailHeaderProps {
    post: ExtendedPost;
    currentUser: User | null;
    commentsCount: number;
    onLike: () => void;
    onBookmark: () => void;
    onImageClick: (url: string, allImages: string[]) => void;
}

export default function PostDetailHeader({
    post,
    currentUser,
    commentsCount,
    onLike,
    onBookmark,
    onImageClick,
}: PostDetailHeaderProps) {
    const [topActiveIndex, setTopActiveIndex] = useState(0);

    const allPostImages = [...(post.images || [])];
    post.day_plans?.forEach((dp) => {
        if (dp.images) allPostImages.push(...dp.images);
    });

    return (
        <>
            {/* Image Section */}
            {allPostImages.length > 0 && (
                <div className="w-full bg-gray-50 border-b border-gray-100 p-0 relative group md:rounded-t-2xl overflow-hidden">
                    <div
                        className="w-full bg-gray-100 overflow-x-auto flex snap-x snap-mandatory scrollbar-none"
                        onScroll={(e) => {
                            const scrollLeft = e.currentTarget.scrollLeft;
                            const width = e.currentTarget.offsetWidth;
                            if (width > 0) {
                                setTopActiveIndex(Math.round(scrollLeft / width));
                            }
                        }}
                    >
                        {allPostImages.map((img: string, idx: number) => (
                            <div key={idx} className="relative flex-shrink-0 w-full aspect-square md:aspect-video snap-center snap-always cursor-pointer" onClick={() => onImageClick(img, allPostImages)}>
                                <img src={img} alt={`post image ${idx}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>

                    {allPostImages.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md z-10 transition-opacity">
                            {topActiveIndex + 1} / {allPostImages.length}
                        </div>
                    )}
                </div>
            )}

            {/* Content Section (Title, Dates, Caption) */}
            <div className="p-5 space-y-8">
                <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{post.title}</h1>
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl w-full">
                        <div className="flex-1 space-y-1.5 flex flex-col items-center">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block text-center">시작일</label>
                            <div className="flex items-center gap-1.5 justify-center">
                                <Calendar className="w-4 h-4 text-primary/60" />
                                <span className="text-base font-semibold text-gray-700">{post.travel_start_date ? format(new Date(post.travel_start_date), 'yyyy.MM.dd') : '-'}</span>
                            </div>
                        </div>
                        <div className="w-px bg-gray-200 my-1"></div>
                        <div className="flex-1 space-y-1.5 flex flex-col items-center">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block text-center">종료일</label>
                            <div className="flex items-center gap-1.5 justify-center">
                                <Calendar className="w-4 h-4 text-primary/60" />
                                <span className="text-base font-semibold text-gray-700">{post.travel_end_date ? format(new Date(post.travel_end_date), 'yyyy.MM.dd') : '-'}</span>
                            </div>
                        </div>
                    </div>
                    {post.caption && (
                        <div className="pt-2">
                            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {post.caption}
                            </p>
                        </div>
                    )}
                </div>

                {/* Interaction */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div onClick={onLike} className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors cursor-pointer group">
                            <Heart className={cn("w-6 h-6 transition-transform group-active:scale-95", post.isLiked ? "fill-red-500 text-red-500" : "")} />
                            <span className={cn("font-semibold text-sm", post.isLiked ? "text-red-500" : "")}>{post.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors cursor-pointer group">
                            <MessageCircle className="w-6 h-6 transition-transform group-active:scale-95" />
                            <span className="font-semibold text-sm">{commentsCount}</span>
                        </div>
                    </div>
                    <Bookmark onClick={onBookmark} className={cn("w-6 h-6 text-gray-600 hover:text-primary transition-colors cursor-pointer", post.isBookmarked ? "fill-black text-black" : "")} />
                </div>
            </div>
        </>
    );
}
