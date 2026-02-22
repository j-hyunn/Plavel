import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div className="fixed inset-0 min-h-screen bg-white md:bg-gray-50 flex items-center justify-center z-[9999]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );
}
