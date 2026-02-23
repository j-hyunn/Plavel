'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLoadScript } from '@react-google-maps/api';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { usePostDetail } from '@/hooks/usePostDetail';
import { DEFAULT_AVATAR } from '@/lib/constants';
import { trackEvent } from '@/lib/gtag';

import PostDetailHeader from '@/components/post/PostDetailHeader';
import DayPlanList from '@/components/post/DayPlanList';
import CommentSection from '@/components/post/CommentSection';
import FullscreenImageViewer from '@/components/post/FullscreenImageViewer';

const libraries: ("places" | "drawing" | "geometry" | "visualization")[] = ["places"];

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.postId as string;

    const { post, commentsCount, initialComments, loading, currentUser, handleDelete, handleLike, handleBookmark } = usePostDetail(postId);

    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [allImages, setAllImages] = useState<string[]>([]);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    const openFullscreen = (url: string, list: string[]) => {
        setAllImages(list);
        const idx = list.indexOf(url);
        setCurrentImgIndex(idx >= 0 ? idx : 0);
        setFullscreenImage(url);
    };

    useEffect(() => {
        if (post) {
            trackEvent('view_post_detail', { post_id: postId, author_id: post.author_id });
        }
    }, [post, postId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                <p>게시물을 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                <button onClick={() => window.history.length > 2 ? router.back() : router.push('/')} className="text-gray-900 hover:text-primary transition-colors w-10">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                        if (!currentUser) {
                            alert('로그인이 필요한 기능입니다.');
                            router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
                            return;
                        }
                        router.push(`/u/${post.author_id}`);
                    }}
                >
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-200">
                        <img src={post.author?.avatar_url || DEFAULT_AVATAR} alt={post.author?.nickname} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-semibold text-sm text-gray-800">{post.author?.nickname || 'Unknown'}</span>
                </div>
                <div className="w-10 flex justify-end">
                    {currentUser?.id === post.author_id && (
                        <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 pb-10 mx-auto w-full max-w-2xl bg-white md:my-8 md:rounded-2xl md:shadow-sm md:h-fit md:overflow-hidden">
                <PostDetailHeader
                    post={post}
                    currentUser={currentUser}
                    commentsCount={commentsCount}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onImageClick={openFullscreen}
                />

                <DayPlanList
                    dayPlans={post.day_plans || []}
                    isMapLoaded={isLoaded}
                    onImageClick={openFullscreen}
                    currentUser={currentUser}
                />

                <div className="px-5">
                    <CommentSection
                        postId={postId}
                        currentUser={currentUser}
                        initialComments={initialComments}
                    />
                </div>
            </main>

            {fullscreenImage && (
                <FullscreenImageViewer
                    images={allImages}
                    initialIndex={currentImgIndex}
                    onClose={() => setFullscreenImage(null)}
                />
            )}
        </div>
    );
}
