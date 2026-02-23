import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/gtag';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Link2, User as UserIcon, UserPlus, UserMinus } from 'lucide-react';

interface PostCardProps {
    id: string | number;
    username: string;
    userImage: string;
    travelTitle: string;
    postImage: string | string[];
    caption: string;
    likes: number;
    commentsCount: number;
    timeAgo: string;
    travelStartDate?: string;
    travelEndDate?: string;
    isLiked?: boolean;
    isBookmarked?: boolean;
    currentUserId?: string;
    authorId?: string | number;
}

export default function PostCard({
    id,
    username,
    userImage,
    travelTitle,
    postImage,
    caption,
    likes,
    commentsCount,
    timeAgo,
    travelStartDate,
    travelEndDate,
    isLiked = false,
    isBookmarked = false,
    currentUserId,
    authorId,
}: PostCardProps) {
    const router = useRouter();
    let images: string[] = [];
    if (Array.isArray(postImage)) {
        images = postImage;
    } else {
        images = [postImage];
        try {
            const parsed = JSON.parse(postImage);
            if (Array.isArray(parsed) && parsed.length > 0) {
                images = parsed;
            }
        } catch {
            // ignore and use fallback
        }
    }

    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [liked, setLiked] = useState(isLiked);
    const [bookmarked, setBookmarked] = useState(isBookmarked);
    const [likeCount, setLikeCount] = useState(likes);
    const [isFollowing, setIsFollowing] = useState(false);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToImage = (index: number) => {
        if (!scrollRef.current) return;
        const width = scrollRef.current.clientWidth;
        scrollRef.current.scrollTo({
            left: width * index,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        const checkFollow = async () => {
            if (currentUserId && authorId && currentUserId !== String(authorId)) {
                try {
                    const { api } = await import('@/services/api');
                    const following = await api.checkFollowStatus(currentUserId, String(authorId));
                    setIsFollowing(following);
                } catch (error) {
                    console.error('Check follow status failed', error);
                }
            }
        };
        checkFollow();
    }, [currentUserId, authorId]);

    const handleToggleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId) {
            alert('로그인이 필요한 기능입니다.');
            router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        const newFollowing = !isFollowing;
        setIsFollowing(newFollowing);
        setPopoverOpen(false);

        try {
            const { api } = await import('@/services/api');
            if (newFollowing) {
                await api.followUser(currentUserId, String(authorId));
                trackEvent('follow_user', { target_user_id: String(authorId), action: 'follow' });
            } else {
                await api.unfollowUser(currentUserId, String(authorId));
                trackEvent('follow_user', { target_user_id: String(authorId), action: 'unfollow' });
            }
        } catch (error) {
            console.error('Follow toggle failed', error);
            setIsFollowing(!newFollowing);
        }
    };

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/p/${id}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('링크가 클립보드에 복사되었습니다.');
            setPopoverOpen(false);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    const handleViewProfile = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (authorId) {
            router.push(`/u/${authorId}`);
        }
        setPopoverOpen(false);
    };

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId) {
            alert('로그인이 필요한 기능입니다.');
            router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
        try {
            const { api } = await import('@/services/api');
            if (newLiked) {
                await api.likePost(String(id), currentUserId);
            } else {
                await api.unlikePost(String(id), currentUserId);
            }
            trackEvent('click_like', { post_id: id, action: newLiked ? 'like' : 'unlike' });
        } catch (error) {
            console.error('Like toggle failed', error);
            setLiked(!newLiked);
            setLikeCount(prev => !newLiked ? prev + 1 : prev - 1);
        }
    };

    const handleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId) {
            alert('로그인이 필요한 기능입니다.');
            router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
            return;
        }
        const newBookmarked = !bookmarked;
        setBookmarked(newBookmarked);
        try {
            const { api } = await import('@/services/api');
            if (newBookmarked) {
                await api.bookmarkPost(String(id), currentUserId);
            } else {
                await api.unbookmarkPost(String(id), currentUserId);
            }
            trackEvent('bookmark_post', { post_id: id, action: newBookmarked ? 'save' : 'unsave' });
        } catch (error) {
            console.error('Bookmark toggle failed', error);
            setBookmarked(!newBookmarked);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const scrollPosition = target.scrollLeft;
        const width = target.clientWidth;
        const newIndex = Math.round(scrollPosition / width);
        if (newIndex !== currentImageIdx) {
            setCurrentImageIdx(newIndex);
        }
    };

    return (
        <div
            onClick={() => router.push(`/p/${id}`)}
            className="overflow-hidden mb-6 sm:mb-10 w-full sm:max-w-[480px] mx-auto bg-white border-none sm:border border-[var(--border)] sm:rounded-2xl sm:shadow-sm transition-all cursor-pointer group/card"
        >
            {/* 1. Profile Section */}
            <div className="flex items-center justify-between p-4">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (authorId) router.push(`/u/${authorId}`);
                    }}
                >
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0">
                        <img src={userImage} alt={username} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-sm text-gray-900">{username}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-medium">{timeAgo}</span>
                            {travelStartDate && (
                                <>
                                    <span className="text-[10px] text-gray-300">•</span>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <Calendar className="w-2.5 h-2.5" />
                                        <span>{travelStartDate} {travelEndDate ? `~ ${travelEndDate}` : ''}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer hover:text-black transition-colors" />
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1 rounded-xl shadow-xl border-gray-100" align="end" sideOffset={8}>
                        <div className="flex flex-col py-1">
                            {currentUserId !== String(authorId) && (
                                <>
                                    <button
                                        onClick={handleToggleFollow}
                                        className="flex items-center gap-3 px-3.5 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left"
                                    >
                                        {isFollowing ? (
                                            <>
                                                <UserMinus className="w-4.5 h-4.5 text-red-500" />
                                                <span className="text-red-500 font-medium">팔로우 취소</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4.5 h-4.5 text-primary" />
                                                <span className="text-primary font-bold">팔로우</span>
                                            </>
                                        )}
                                    </button>
                                    <div className="h-px bg-gray-100 my-1 mx-2" />
                                </>
                            )}
                            <button onClick={handleCopyLink} className="flex items-center gap-3 px-3.5 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left text-gray-700">
                                <Link2 className="w-4.5 h-4.5" />
                                <span>링크 복사</span>
                            </button>
                            <button onClick={handleViewProfile} className="flex items-center gap-3 px-3.5 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left text-gray-700">
                                <UserIcon className="w-4.5 h-4.5" />
                                <span>프로필 보기</span>
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* 2. Feed Image Area */}
            <div className="relative group/carousel">
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none aspect-square bg-gray-50"
                    onScroll={handleScroll}
                >
                    {images.map((img, idx) => (
                        <div key={idx} className="relative flex-shrink-0 w-full h-full snap-center snap-always overflow-hidden">
                            <img
                                src={img}
                                alt={travelTitle}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>

                {/* Desktop Navigation Buttons */}
                {images.length > 1 && (
                    <>
                        {currentImageIdx > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    scrollToImage(currentImageIdx - 1);
                                }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-all opacity-0 group-hover/carousel:opacity-100 hidden sm:flex z-20"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        {currentImageIdx < images.length - 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    scrollToImage(currentImageIdx + 1);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md backdrop-blur-sm transition-all opacity-0 group-hover/carousel:opacity-100 hidden sm:flex z-20"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </>
                )}

                {/* Dot Indicators */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.3)] ${idx === currentImageIdx ? 'bg-primary scale-125' : 'bg-white/60'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 2-2. Actions (Like, Comment, Save) */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-5">
                    <button onClick={handleLike} className="flex items-center gap-1.5 group/btn">
                        <Heart className={cn("w-6 h-6 transition-all", liked ? "fill-red-500 text-red-500 scale-110" : "text-gray-700 group-hover/btn:text-red-400 group-hover/btn:scale-110")} />
                        <span className={cn("text-xs font-bold", liked ? "text-red-500" : "text-gray-500")}>{likeCount.toLocaleString()}</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/p/${id}`); }} className="flex items-center gap-1.5 group/btn">
                        <MessageCircle className="w-6 h-6 text-gray-700 group-hover/btn:text-primary group-hover/btn:scale-110 transition-all" />
                        <span className="text-xs font-bold text-gray-500">{commentsCount.toLocaleString()}</span>
                    </button>
                </div>
                <button onClick={handleBookmark} className="group/btn">
                    <Bookmark className={cn("w-6 h-6 transition-all", bookmarked ? "fill-black text-black scale-110" : "text-gray-700 group-hover/btn:text-black group-hover/btn:scale-110")} />
                </button>
            </div>

            {/* 3. Text Area */}
            <div className="p-4 space-y-3">
                <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-gray-900 leading-tight">{travelTitle}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{caption}</p>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/p/${id}`);
                    }}
                    className="w-full py-3 bg-gray-50 hover:bg-primary/5 text-gray-800 hover:text-primary rounded-xl font-bold text-sm transition-all border border-gray-100 flex items-center justify-center gap-2 group/go"
                >
                    <span>여행 일정 확인하기</span>
                    <Link2 className="w-3.5 h-3.5 group-hover/go:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
}
