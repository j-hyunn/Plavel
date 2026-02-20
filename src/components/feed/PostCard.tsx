import Link from 'next/link';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Calendar } from 'lucide-react';

interface PostCardProps {
    id: string | number;
    username: string;
    userImage: string;
    travelTitle: string;
    postImage: string;
    caption: string;
    likes: number;
    timeAgo: string;
    travelStartDate?: string;
    travelEndDate?: string;
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
}: PostCardProps) {
    return (
        <div className="instagram-card overflow-hidden mb-8 max-w-[470px] mx-auto border-[var(--border)] shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
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
                <MoreHorizontal className="w-5 h-5 text-gray-500 cursor-pointer" />
            </div>

            {/* Travel Title Area */}
            <div className="px-3 pb-2">
                <h3 className="font-bold text-base leading-tight">{travelTitle}</h3>
            </div>

            {/* Image (Link to Detail) */}
            <Link href={`/p/${id}`}>
                <div className="aspect-square bg-gray-100 relative group cursor-pointer overflow-hidden">
                    <img
                        src={postImage}
                        alt={travelTitle}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
            </Link>

            {/* Actions */}
            <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <Heart className="w-6 h-6 cursor-pointer hover:text-gray-500" />
                        <MessageCircle className="w-6 h-6 cursor-pointer hover:text-gray-500" />
                        <Send className="w-6 h-6 cursor-pointer hover:text-gray-500" />
                    </div>
                    <Bookmark className="w-6 h-6 cursor-pointer hover:text-gray-500" />
                </div>

                {/* Info */}
                <div className="space-y-1">
                    <p className="font-semibold text-sm">좋아요 {likes.toLocaleString()}개</p>
                    <p className="text-sm">
                        <span className="font-semibold mr-2">{username}</span>
                        {caption}
                    </p>
                    <Link href={`/p/${id}`} className="text-[var(--secondary-text)] text-sm block">
                        일정 상세보기...
                    </Link>
                    <p className="text-[10px] text-[var(--secondary-text)] uppercase">{timeAgo}</p>
                </div>
            </div>
        </div>
    );
}
