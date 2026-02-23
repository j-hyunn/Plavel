import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import type { UserProfile, Post } from '@/types';

export const usersApi = {
    async getUserProfile(userId: string): Promise<UserProfile & { posts: Post[] }> {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError) handleSupabaseError(userError, 'getUserProfile');

        const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select(`
                *,
                likes(user_id),
                comments(id)
            `)
            .eq('author_id', userId)
            .order('created_at', { ascending: false });

        if (postsError) handleSupabaseError(postsError, 'getUserProfile (posts)');

        const postsWithCounts = posts.map(post => ({
            ...post,
            likes_count: post.likes?.length || 0,
            comments_count: post.comments?.length || 0
        })) as unknown as Post[];

        return { ...(user as UserProfile), posts: postsWithCounts };
    },

    async followUser(followerId: string, followingId: string) {
        const { error } = await supabase
            .from('follows')
            .insert([{ follower_id: followerId, following_id: followingId }]);
        if (error) handleSupabaseError(error, 'followUser');
    },

    async unfollowUser(followerId: string, followingId: string) {
        const { error } = await supabase
            .from('follows')
            .delete()
            .match({ follower_id: followerId, following_id: followingId });
        if (error) handleSupabaseError(error, 'unfollowUser');
    },

    async checkFollowStatus(followerId: string, followingId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('follows')
            .select('*')
            .match({ follower_id: followerId, following_id: followingId })
            .single();

        if (error && error.code !== 'PGRST116') handleSupabaseError(error, 'checkFollowStatus');
        return !!data;
    },

    async updateUserProfile(userId: string, updates: { nickname?: string, bio?: string }) {
        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);
        if (error) handleSupabaseError(error, 'updateUserProfile');
    }
};
