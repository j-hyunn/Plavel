import { supabase } from '@/lib/supabase';
import { handleSupabaseError } from '@/lib/error';
import type { Post, DayPlan, DayAction, Comment } from '@/types';

type PartialCreatePostData = Pick<Post, 'author_id' | 'title' | 'caption' | 'images' | 'travel_start_date' | 'travel_end_date'>;

interface DbPlace {
    day_plan_id: string;
    place_name: string;
    lat: number | null;
    lng: number | null;
    google_types: string[] | null;
    time: string | null;
    sequence: number;
}

export const postsApi = {
    async getFeed(userId?: string): Promise<(Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number; comments_count: number })[]> {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:users!posts_author_id_fkey(nickname, avatar_url),
                likes(user_id),
                bookmarks(user_id),
                comments(id),
                day_plans(images)
            `)
            .order('created_at', { ascending: false });

        if (error) handleSupabaseError(error, 'getFeed');

        return data.map(post => ({
            ...post,
            likes_count: post.likes?.length || 0,
            comments_count: post.comments?.length || 0,
            isLiked: userId ? post.likes?.some((l: { user_id: string }) => l.user_id === userId) : false,
            isBookmarked: userId ? post.bookmarks?.some((b: { user_id: string }) => b.user_id === userId) : false,
        })) as (Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number; comments_count: number })[];
    },

    async getPostDetail(postId: string, userId?: string): Promise<Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number; comments_count: number; day_plans: DayPlan[] }> {
        const { data: post, error: postError } = await supabase
            .from('posts')
            .select(`
                *,
                author:users!posts_author_id_fkey(nickname, avatar_url),
                likes(user_id),
                bookmarks(user_id),
                comments(id)
            `)
            .eq('id', postId)
            .single();

        if (postError) handleSupabaseError(postError, 'getPostDetail');

        const { data: dayPlans, error: dayError } = await supabase
            .from('day_plans')
            .select('*, day_places(*)')
            .eq('post_id', postId)
            .order('day_number', { ascending: true });

        if (dayError) handleSupabaseError(dayError, 'getPostDetail (day_plans)');

        if (dayPlans) {
            dayPlans.forEach(plan => {
                if (plan.day_places) {
                    plan.day_places.sort((a: { sequence: number }, b: { sequence: number }) => (a.sequence || 0) - (b.sequence || 0));
                }
            });
        }

        return {
            ...post,
            day_plans: dayPlans,
            likes_count: post.likes?.length || 0,
            comments_count: post.comments?.length || 0,
            isLiked: userId ? post.likes?.some((l: { user_id: string }) => l.user_id === userId) : false,
            isBookmarked: userId ? post.bookmarks?.some((b: { user_id: string }) => b.user_id === userId) : false,
        } as unknown as (Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number; comments_count: number; day_plans: DayPlan[] });
    },

    async createPost(postData: PartialCreatePostData, dayPlans: DayPlan[]) {
        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert([postData])
            .select()
            .single();

        if (postError) handleSupabaseError(postError, 'createPost');

        if (dayPlans.length > 0) {
            const plansWithId = dayPlans.map(plan => {
                const { actions, description, ...validPlan } = plan;
                return { ...validPlan, description: description || '', post_id: post.id, images: validPlan.images || [] };
            });

            const { data: insertedPlans, error: dayError } = await supabase
                .from('day_plans')
                .insert(plansWithId)
                .select();

            if (dayError) handleSupabaseError(dayError, 'createPost (day_plans)');

            if (insertedPlans && insertedPlans.length > 0) {
                const placesToInsert: DbPlace[] = [];
                dayPlans.forEach((originalPlan, idx) => {
                    const insertedPlan = insertedPlans.find(ip => ip.day_number === originalPlan.day_number);
                    if (insertedPlan && originalPlan.actions && originalPlan.actions.length > 0) {
                        originalPlan.actions.forEach((action: DayAction, aIdx: number) => {
                            if (action.address) {
                                placesToInsert.push({
                                    day_plan_id: insertedPlan.id,
                                    place_name: action.address,
                                    lat: action.lat || null,
                                    lng: action.lng || null,
                                    google_types: action.google_types || null,
                                    time: action.time || null,
                                    sequence: aIdx,
                                });
                            }
                        });
                    }
                });

                if (placesToInsert.length > 0) {
                    const { error: placesError } = await supabase
                        .from('day_places')
                        .insert(placesToInsert);

                    if (placesError) handleSupabaseError(placesError, 'createPost (day_places)');
                }
            }
        }
        return post;
    },

    async deletePost(postId: string) {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) handleSupabaseError(error, 'deletePost');
    },

    async likePost(postId: string, userId: string) {
        const { error } = await supabase
            .from('likes')
            .insert([{ user_id: userId, post_id: postId }]);

        if (error) handleSupabaseError(error, 'likePost');
    },

    async unlikePost(postId: string, userId: string) {
        const { error } = await supabase
            .from('likes')
            .delete()
            .match({ user_id: userId, post_id: postId });

        if (error) handleSupabaseError(error, 'unlikePost');
    },

    async bookmarkPost(postId: string, userId: string) {
        const { error } = await supabase
            .from('bookmarks')
            .insert([{ user_id: userId, post_id: postId }]);
        if (error) handleSupabaseError(error, 'bookmarkPost');
    },

    async unbookmarkPost(postId: string, userId: string) {
        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .match({ user_id: userId, post_id: postId });
        if (error) handleSupabaseError(error, 'unbookmarkPost');
    },

    async getSavedPosts(userId: string): Promise<(Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number; comments_count: number })[]> {
        const { data, error } = await supabase
            .from('bookmarks')
            .select(`
                post_id,
                posts (
                    *,
                    author:users!posts_author_id_fkey(nickname, avatar_url),
                    likes(user_id),
                    bookmarks(user_id),
                    comments(id)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) handleSupabaseError(error, 'getSavedPosts');

        return data.map((b: any) => ({
            ...b.posts,
            likes_count: b.posts.likes?.length || 0,
            comments_count: b.posts.comments?.length || 0,
            isLiked: b.posts.likes?.some((l: { user_id: string }) => l.user_id === userId),
            isBookmarked: true,
        })) as (Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number; comments_count: number })[];
    },

    async getComments(postId: string): Promise<Comment[]> {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                author:users!comments_author_id_fkey(nickname, avatar_url)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) handleSupabaseError(error, 'getComments');
        return data as unknown as Comment[];
    },

    async addComment(postId: string, userId: string, content: string): Promise<Comment> {
        const { data, error } = await supabase
            .from('comments')
            .insert([{ post_id: postId, author_id: userId, content }])
            .select(`
                *,
                author:users!comments_author_id_fkey(nickname, avatar_url)
            `)
            .single();

        if (error) handleSupabaseError(error, 'addComment');
        return data as unknown as Comment;
    },

    async searchPosts(query: string, userId?: string): Promise<(Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number; comments_count: number })[]> {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:users!posts_author_id_fkey(nickname, avatar_url),
                likes(user_id),
                bookmarks(user_id),
                comments(id),
                day_plans(images)
            `)
            .or(`title.ilike.%${query}%,caption.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        if (error) handleSupabaseError(error, 'searchPosts');

        return data.map(post => ({
            ...post,
            likes_count: post.likes?.length || 0,
            comments_count: post.comments?.length || 0,
            isLiked: userId ? post.likes?.some((l: { user_id: string }) => l.user_id === userId) : false,
            isBookmarked: userId ? post.bookmarks?.some((b: { user_id: string }) => b.user_id === userId) : false,
        })) as (Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number; comments_count: number })[];
    }
};
