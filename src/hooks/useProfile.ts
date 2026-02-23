import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import type { UserProfile, Post } from '@/types';
import type { TabType } from '@/components/profile/ProfileTabs';
import { trackEvent } from '@/lib/gtag';

export function useProfile(userId: string) {
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [activeTab, setActiveTab] = useState<TabType>('posts');
    const [savedPosts, setSavedPosts] = useState<Post[]>([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editNickname, setEditNickname] = useState('');
    const [editBio, setEditBio] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchProfile = async () => {
        try {
            const session = await api.getSession();
            let targetId = userId;

            if (session) setCurrentUserId(session.user.id);

            if (userId === 'me') {
                if (!session) {
                    router.push('/login');
                    return;
                }
                targetId = session.user.id;
                setIsOwnProfile(true);
            } else if (session && session.user.id === userId) {
                setIsOwnProfile(true);
            }

            const data = await api.getUserProfile(targetId);
            setProfile(data);
            setEditNickname(data.nickname || '');
            setEditBio(data.bio || '나만의 여행 일정을 공유합니다.');

            if (session && targetId !== session.user.id) {
                const following = await api.checkFollowStatus(session.user.id, targetId);
                setIsFollowing(following);
            }

            if (isOwnProfile || (session && session.user.id === targetId)) {
                const saved = await api.getSavedPosts(targetId);
                setSavedPosts(saved);
            }

            setFollowerCount(data.follower_count || 1);
            setFollowingCount(data.following_count || 1);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [userId, router]);

    const handleUpdateProfile = async () => {
        if (!currentUserId) return;
        setIsUpdating(true);
        try {
            await api.updateUserProfile(currentUserId, { nickname: editNickname, bio: editBio });
            await fetchProfile();
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('프로필 업데이트에 실패했습니다.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleFollow = async () => {
        if (!profile) return;
        if (!currentUserId) {
            alert('로그인이 필요한 기능입니다.');
            router.push('/login');
            return;
        }
        try {
            if (isFollowing) {
                await api.unfollowUser(currentUserId, profile.id);
                setIsFollowing(false);
                setFollowerCount(prev => Math.max(0, prev - 1));
                trackEvent('follow_user', { target_user_id: profile.id, action: 'unfollow' });
            } else {
                await api.followUser(currentUserId, profile.id);
                setIsFollowing(true);
                setFollowerCount(prev => prev + 1);
                trackEvent('follow_user', { target_user_id: profile.id, action: 'follow' });
            }
        } catch (error) {
            console.error('Follow toggle failed:', error);
        }
    };

    return {
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
    };
}
