import { Skeleton } from '@/components/ui/skeleton';

function SavedCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <Skeleton className="w-full aspect-[4/3] rounded-none" />
            <div className="p-4 space-y-2">
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-3" />
            </div>
        </div>
    );
}

export default function SavedSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-14 flex items-center px-4">
                <Skeleton className="w-24 h-5" />
            </header>
            <div className="w-full max-w-2xl mx-auto px-4 pt-4 space-y-4">
                {[1, 2, 3].map(i => <SavedCardSkeleton key={i} />)}
            </div>
        </div>
    );
}
