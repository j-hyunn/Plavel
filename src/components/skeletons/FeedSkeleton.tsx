import { Skeleton } from '@/components/ui/skeleton';

// 피드 카드 하나의 스켈레톤
function PostCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {/* Image */}
            <Skeleton className="w-full aspect-[4/3] rounded-none" />
            <div className="p-4 space-y-3">
                {/* User row */}
                <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <Skeleton className="w-24 h-3" />
                </div>
                {/* Title */}
                <Skeleton className="w-3/4 h-4" />
                {/* Caption */}
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-2/3 h-3" />
                {/* Action bar */}
                <div className="flex items-center gap-4 pt-2">
                    <Skeleton className="w-10 h-3" />
                    <Skeleton className="w-10 h-3" />
                </div>
            </div>
        </div>
    );
}

export default function FeedSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-14 flex items-center px-4">
                <Skeleton className="w-20 h-5" />
            </header>
            <div className="w-full max-w-2xl mx-auto px-4 pt-4 space-y-4">
                {[1, 2, 3].map(i => <PostCardSkeleton key={i} />)}
            </div>
        </div>
    );
}
