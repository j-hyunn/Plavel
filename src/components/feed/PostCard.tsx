import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Calendar } from 'lucide-react';
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
            router.push('/login');
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
            router.push('/login');
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
            router.push('/login');
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
            className="overflow-hidden mb-4 sm:mb-8 w-full sm:max-w-[470px] mx-auto bg-white border-none sm:border border-[var(--border)] sm:rounded-md sm:shadow-sm transition-all cursor-pointer"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!currentUserId) {
                            alert('로그인이 필요한 기능입니다.');
                            router.push('/login');
                            return;
                        }
                        if (authorId) {
                            router.push(`/u/${authorId}`);
                        }
                    }}
                >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 group-hover:opacity-80 transition-opacity">
                        <img src={userImage} alt={username} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">{username}</span>
                        {travelStartDate && (
                            <div className="flex items-center gap-1 text-[10px] text-[var(--secondary-text)]">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>{travelStartDate} {travelEndDate ? `~ ${travelEndDate}` : ''}</span>
                            </div>
                        )}
                    </div>
                </div>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                    <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer hover:text-black transition-colors" />
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-1" align="end" sideOffset={8}>
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
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center gap-3 px-3.5 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left text-gray-700"
                            >
                                <Link2 className="w-4.5 h-4.5" />
                                <span>링크 복사</span>
                            </button>
                            <button
                                onClick={handleViewProfile}
                                className="flex items-center gap-3 px-3.5 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left text-gray-700"
                            >
                                <UserIcon className="w-4.5 h-4.5" />
                                <span>프로필 보기</span>
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Travel Title Area */}
            <div className="px-3 pb-2">
                <h3 className="font-bold text-base leading-tight">{travelTitle}</h3>
            </div>

            {/* Image Carousel */}
            <div className="relative group">
                <div
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none aspect-square bg-gray-100"
                    onScroll={handleScroll}
                >
                    {images.map((img, idx) => (
                        <div key={idx} className="relative flex-shrink-0 w-full h-full snap-center snap-always overflow-hidden">
                            <img
                                src={img}
                                alt={travelTitle}
                                className="w-full h-full object-cover transition-transform duration-700"
                            />
                        </div>
                    ))}
                </div>

                {/* Dot Indicators */}
                {images.length > 1 && (
                    <div className="absolute outline-none bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.4)] ${idx === currentImageIdx ? 'bg-primary scale-110' : 'bg-white/70'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <Heart onClick={handleLike} className={cn("w-6 h-6 cursor-pointer hover:text-gray-500 transition-colors", liked ? "fill-red-500 text-red-500 hover:text-red-600" : "")} />
                        <MessageCircle onClick={(e) => { e.stopPropagation(); router.push(`/p/${id}`); }} className="w-6 h-6 cursor-pointer hover:text-gray-500 transition-colors" />
                    </div>
                    <Bookmark onClick={handleBookmark} className={cn("w-6 h-6 cursor-pointer hover:text-gray-500 transition-colors", bookmarked ? "fill-black text-black" : "")} />
                </div>

                {/* Info */}
                <div className="space-y-1">
                    <p className="font-semibold text-sm">좋아요 {likeCount.toLocaleString()}개</p>
                    <div className="text-sm">
                        <span className="font-semibold mr-2">{username}</span>
                        <span className="whitespace-pre-wrap">{caption}</span>
                    </div>
                    <div className="text-[var(--secondary-text)] text-sm block">
                        일정 상세보기...
                    </div>
                    <p className="text-[10px] text-[var(--secondary-text)] uppercase">{timeAgo}</p>
                </div>
            </div>
        </div>
    );
}
