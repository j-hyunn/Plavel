'use client';

import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import type { Post } from '@/types';

import BottomNav from '@/components/layout/BottomNav';
import ProfileCard from '@/components/profile/ProfileCard';
import ProfileTabs, { TabType } from '@/components/profile/ProfileTabs';
import ProfileGrid from '@/components/profile/ProfileGrid';
import ProfileEditModal from '@/components/profile/ProfileEditModal';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;

    const {
        profile,
        loading,
        isOwnProfile,
        isFollowing,
        followerCount,
        followingCount,
        activeTab,
        setActiveTab,
        savedPosts,
        isEditModalOpen,
        setIsEditModalOpen,
        editNickname,
        setEditNickname,
        editBio,
        setEditBio,
        isUpdating,
        handleUpdateProfile,
        handleFollow
    } = useProfile(userId);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!profile) return <div className="min-h-screen flex items-center justify-center">유저를 찾을 수 없습니다.</div>;

    const displayedPosts = activeTab === 'posts' ? profile.posts || [] : savedPosts;

    return (
        <div className="min-h-screen bg-white">
            <BottomNav />

            {/* Header for other users' profiles */}
            {!isOwnProfile && (
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center h-14 px-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <span className="ml-2 font-bold text-gray-900">{profile.nickname}</span>
                </header>
            )}

            <main className={cn("pb-28 min-h-screen", !isOwnProfile && "pt-0")}>
                <div className="w-full max-w-[935px] py-8 px-4 md:px-0 mx-auto">

                    <ProfileCard
                        profile={profile}
                        isOwnProfile={isOwnProfile}
                        isFollowing={isFollowing}
                        followerCount={followerCount}
                        followingCount={followingCount}
                        onEditClick={() => {
                            setEditNickname(profile.nickname || '');
                            setEditBio(profile.bio || '나만의 여행 일정을 공유합니다.');
                            setIsEditModalOpen(true);
                        }}
                        onFollowClick={handleFollow}
                    />

                    <ProfileTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        isOwnProfile={isOwnProfile}
                    />

                    <ProfileGrid posts={displayedPosts} />
                </div>
            </main>

            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                editNickname={editNickname}
                setEditNickname={setEditNickname}
                editBio={editBio}
                setEditBio={setEditBio}
                onUpdateProfile={handleUpdateProfile}
                isUpdating={isUpdating}
            />
        </div>
    );
}
