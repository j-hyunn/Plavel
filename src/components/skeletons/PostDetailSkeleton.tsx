import { Skeleton } from '@/components/ui/skeleton';

export default function PostDetailSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                <Skeleton className="w-6 h-6 rounded-full" />
                <div className="flex items-center gap-2">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <Skeleton className="w-20 h-3" />
                </div>
                <Skeleton className="w-6 h-6 rounded" />
            </header>

            <main className="flex-1 pb-10 mx-auto w-full max-w-2xl bg-white md:my-8 md:rounded-2xl md:overflow-hidden">
                {/* Cover Image */}
                <Skeleton className="w-full aspect-square md:aspect-video rounded-none" />

                {/* Content */}
                <div className="p-5 space-y-8">
                    {/* Title + dates */}
                    <div className="space-y-4">
                        <Skeleton className="w-2/3 h-7" />
                        <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                            <div className="flex-1 space-y-2 flex flex-col items-center">
                                <Skeleton className="w-12 h-3" />
                                <Skeleton className="w-20 h-4" />
                            </div>
                            <div className="w-px bg-gray-200" />
                            <div className="flex-1 space-y-2 flex flex-col items-center">
                                <Skeleton className="w-12 h-3" />
                                <Skeleton className="w-20 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex gap-6">
                            <Skeleton className="w-12 h-5" />
                            <Skeleton className="w-12 h-5" />
                        </div>
                        <Skeleton className="w-5 h-5" />
                    </div>

                    {/* Day plans */}
                    {[1, 2].map(i => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-gray-100">
                            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2 pt-1">
                                <Skeleton className="w-1/3 h-4" />
                                <Skeleton className="w-full h-3" />
                                <Skeleton className="w-2/3 h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
