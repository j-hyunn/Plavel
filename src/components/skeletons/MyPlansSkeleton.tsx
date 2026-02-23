import { Skeleton } from '@/components/ui/skeleton';

function PlanCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <Skeleton className="w-1/2 h-5" />
            <div className="flex gap-4">
                <Skeleton className="w-28 h-3" />
                <Skeleton className="w-20 h-3" />
            </div>
        </div>
    );
}

export default function MyPlansSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-14 flex items-center px-4">
                <Skeleton className="w-20 h-5" />
            </header>
            <div className="w-full max-w-2xl mx-auto px-4 pt-4 space-y-4 mt-2">
                {[1, 2, 3].map(i => <PlanCardSkeleton key={i} />)}
            </div>
        </div>
    );
}
