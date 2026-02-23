import { Settings, User, LogOut, UserX } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/types';
import { DEFAULT_AVATAR } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface ProfileCardProps {
    profile: UserProfile;
    isOwnProfile: boolean;
    isFollowing: boolean;
    followerCount: number;
    followingCount: number;
    onEditClick: () => void;
    onFollowClick: () => void;
}

export default function ProfileCard({
    profile,
    isOwnProfile,
    isFollowing,
    followerCount,
    followingCount,
    onEditClick,
    onFollowClick
}: ProfileCardProps) {
    const router = useRouter();

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            '정말로 탈퇴하시겠습니까?\n\n탈퇴 시 모든 데이터(게시글, 댓글, 좋아요 등)가 삭제되며 복구할 수 없습니다.'
        );
        if (!confirmed) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch('/api/delete-account', {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session.access_token}` },
            });

            if (!res.ok) throw new Error('Delete failed');

            await supabase.auth.signOut();
            router.replace('/login');
        } catch (err) {
            console.error(err);
            alert('회원 탈퇴 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    return (
        <div className="bg-[#F2F2F2] rounded-[32px] p-6 mb-8 w-full mx-auto shadow-sm">
            {/* Top Section: Avatar & Info */}
            <div className="flex items-start gap-6 mb-4">
                {/* Profile Image */}
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    <img
                        src={profile.avatar_url || DEFAULT_AVATAR}
                        alt="profile"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Nickname & Bio */}
                <div className="flex-1 min-w-0 pt-2">
                    <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold text-gray-900 truncate">{profile.nickname}</h2>
                        {isOwnProfile ? (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="p-1 hover:bg-gray-200 rounded-full transition-all group">
                                        <Settings className="w-5 h-5 text-gray-500 group-hover:rotate-45 transition-transform duration-300" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-44 p-1.5 z-[100]" align="start" sideOffset={8}>
                                    <div className="flex flex-col gap-0.5">
                                        <button
                                            onClick={onEditClick}
                                            className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2.5 text-gray-700"
                                        >
                                            <User className="w-4 h-4 text-gray-400" />
                                            프로필 편집
                                        </button>
                                        <div className="h-px bg-gray-100 my-1 mx-1" />
                                        <button
                                            onClick={async () => {
                                                await supabase.auth.signOut();
                                                router.push('/');
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-red-50 text-red-500 rounded-md transition-colors flex items-center gap-2.5"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            로그아웃
                                        </button>
                                        <div className="h-px bg-gray-100 my-1 mx-1" />
                                        <button
                                            onClick={handleDeleteAccount}
                                            className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-red-50 text-red-400 rounded-md transition-colors flex items-center gap-2.5"
                                        >
                                            <UserX className="w-4 h-4" />
                                            회원 탈퇴
                                        </button>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        ) : (
                            <button
                                onClick={onFollowClick}
                                className={cn(
                                    "font-bold py-1 px-4 rounded-lg text-xs transition-all",
                                    isFollowing ? "bg-gray-200 text-gray-900" : "bg-primary text-white"
                                )}
                            >
                                {isFollowing ? '팔로잉' : '팔로우'}
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                        {profile.bio || '나만의 여행 일정을 공유합니다.'}
                    </p>
                </div>
            </div>

            {/* Bottom Section: Stats */}
            <div className="flex justify-between items-center px-4 md:px-6 border-t border-gray-200/50 pt-5">
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">{profile.posts?.length || 0}</span>
                    <span className="text-sm text-gray-500 font-medium">Feed</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">{followerCount}</span>
                    <span className="text-sm text-gray-500 font-medium">Follower</span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">{followingCount}</span>
                    <span className="text-sm text-gray-500 font-medium">Following</span>
                </div>
            </div>
        </div>
    );
}
