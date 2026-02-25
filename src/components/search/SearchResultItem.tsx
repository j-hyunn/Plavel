import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Calendar } from 'lucide-react';
import { DEFAULT_AVATAR } from '@/lib/constants';

interface SearchResultItemProps {
    id: string | number;
    title: string;
    caption: string;
    image: string;
    authorName: string;
    authorImage?: string;
    likesCount: number;
    commentsCount: number;
    travelStartDate?: string;
    travelEndDate?: string;
    timeAgo: string;
}

export default function SearchResultItem({
    id,
    title,
    caption,
    image,
    authorName,
    authorImage,
    likesCount,
    commentsCount,
    travelStartDate,
    travelEndDate,
    timeAgo
}: SearchResultItemProps) {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push(`/p/${id}`)}
            className="flex gap-4 p-4 border-b border-gray-100 bg-white hover:bg-gray-50 transition-colors cursor-pointer w-full group"
        >
            {/* Left: Thumbnail (16:9 or square-ish) */}
            <div className="w-[100px] h-[100px] sm:w-[130px] sm:h-[100px] rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-50 relative">
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs text-center p-2">
                        No Image
                    </div>
                )}
            </div>

            {/* Right: Content */}
            <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                <div className="space-y-1.5">
                    {/* Title & Author */}
                    <div className="flex flex-col gap-0.5">
                        <h3 className="font-bold text-gray-900 text-[15px] leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <img
                                src={authorImage || DEFAULT_AVATAR}
                                alt={authorName}
                                className="w-3.5 h-3.5 rounded-full object-cover border border-gray-100"
                            />
                            <span className="text-xs text-gray-600 truncate max-w-[100px]">{authorName}</span>
                            <span className="text-[10px] text-gray-400">• {timeAgo}</span>
                        </div>
                    </div>

                    {/* Description/Caption */}
                    <p className="text-[13px] text-gray-500 line-clamp-2 leading-snug">
                        {caption}
                    </p>
                </div>

                {/* Bottom Stats & Dates */}
                <div className="flex items-center justify-between mt-2">
                    {travelStartDate ? (
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Calendar className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">
                                {travelStartDate} {travelEndDate ? `~ ${travelEndDate}` : ''}
                            </span>
                        </div>
                    ) : (
                        <div /> // Spacer
                    )}

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 text-gray-400 group-hover:text-red-500 transition-colors">
                            <Heart className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 group-hover:text-primary transition-colors">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{commentsCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
