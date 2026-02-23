import { Skeleton } from '@/components/ui/skeleton';

function GridItemSkeleton() {
    return <Skeleton className="w-full aspect-square rounded-none" />;
}

export default function ProfileSkeleton() {
    return (
        <div className="min-h-screen bg-white pb-28">
            {/* Profile Card */}
            <div className="w-full max-w-[935px] py-8 px-4 md:px-0 mx-auto">
                <div className="flex items-center gap-6 mb-6">
                    <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                        <Skeleton className="w-32 h-5" />
                        <Skeleton className="w-48 h-3" />
                        <div className="flex gap-6">
                            <Skeleton className="w-16 h-3" />
                            <Skeleton className="w-16 h-3" />
                            <Skeleton className="w-16 h-3" />
                        </div>
                        <Skeleton className="w-28 h-8 rounded-lg" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 flex gap-8 mb-4">
                    <Skeleton className="w-16 h-4 mb-2" />
                    <Skeleton className="w-16 h-4 mb-2" />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-3 gap-0.5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <GridItemSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
