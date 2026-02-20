import { supabase } from '@/lib/supabase';

export interface Post {
    id: string;
    author_id: string;
    title: string;
    cover_image_url: string;
    travel_start_date?: string;
    travel_end_date?: string;
    created_at: string;
    author?: {
        nickname: string;
        avatar_url: string;
    };
    likes_count?: number;
}

export interface DayPlan {
    id: string;
    post_id: string;
    day_number: number;
    title?: string;
    description: string;
}

export const api = {
    // Posts
    async getFeed() {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:users!posts_author_id_fkey(nickname, avatar_url),
                likes:likes(count)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase getFeed error:', error.message, error.details, error.hint, error.code);
            throw error;
        }
        return data.map(post => ({
            ...post,
            likes_count: post.likes?.[0]?.count || 0
        }));
    },

    async getPostDetail(postId: string) {
        const { data: post, error: postError } = await supabase
            .from('posts')
            .select(`
                *,
                author:users!posts_author_id_fkey(nickname, avatar_url)
            `)
            .eq('id', postId)
            .single();

        if (postError) {
            console.error('Supabase getPostDetail error:', postError.message, postError.details, postError.hint, postError.code);
            throw postError;
        }

        const { data: dayPlans, error: dayError } = await supabase
            .from('day_plans')
            .select('*')
            .eq('post_id', postId)
            .order('day_number', { ascending: true });

        if (dayError) throw dayError;

        return { ...post, day_plans: dayPlans };
    },

    async createPost(postData: any, dayPlans: any[]) {
        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert([postData])
            .select()
            .single();

        if (postError) throw postError;

        if (dayPlans.length > 0) {
            const plansWithId = dayPlans.map(plan => ({ ...plan, post_id: post.id }));
            const { error: dayError } = await supabase
                .from('day_plans')
                .insert(plansWithId);

            if (dayError) throw dayError;
        }

        return post;
    },

    // Engagement
    async likePost(postId: string, userId: string) {
        const { error } = await supabase
            .from('likes')
            .insert([{ user_id: userId, post_id: postId }]);

        if (error) throw error;
    },

    async unlikePost(postId: string, userId: string) {
        const { error } = await supabase
            .from('likes')
            .delete()
            .match({ user_id: userId, post_id: postId });

        if (error) throw error;
    },

    // User
    async getUserProfile(userId: string) {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (userError) {
            console.error('Supabase getUserProfile error:', userError.message, userError.details, userError.hint, userError.code);
            throw userError;
        }

        const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .eq('author_id', userId)
            .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        return { ...user, posts };
    }
};
