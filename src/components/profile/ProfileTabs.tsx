import { cn } from '@/lib/utils';

export type TabType = 'posts' | 'saved';

interface ProfileTabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    isOwnProfile: boolean;
}

export default function ProfileTabs({ activeTab, onTabChange, isOwnProfile }: ProfileTabsProps) {
    if (!isOwnProfile) return null;

    return (
        <div className="flex items-center justify-center gap-2 mb-10">
            <button
                onClick={() => onTabChange('posts')}
                className={cn(
                    "px-5 py-1.5 rounded-full text-xs font-bold transition-all",
                    activeTab === 'posts'
                        ? "bg-primary text-white shadow-md scale-105"
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                )}
            >
                여행기
            </button>
            <button
                onClick={() => onTabChange('saved')}
                className={cn(
                    "px-5 py-1.5 rounded-full text-xs font-bold transition-all",
                    activeTab === 'saved'
                        ? "bg-primary text-white shadow-md scale-105"
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                )}
            >
                저장됨
            </button>
        </div>
    );
}
