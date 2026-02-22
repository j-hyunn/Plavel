import { supabase } from '@/lib/supabase';
import type { Post, DayPlan, DayAction, Comment } from '@/types';

type PartialCreatePostData = Pick<Post, 'author_id' | 'title' | 'caption' | 'images' | 'travel_start_date' | 'travel_end_date'>;

interface DbPlace {
    day_plan_id: string;
    place_name: string;
    lat: number | null;
    lng: number | null;
    google_types: string[] | null;
    sequence: number;
}

export const postsApi = {
    async getFeed(userId?: string): Promise<(Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number })[]> {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                author:users!posts_author_id_fkey(nickname, avatar_url),
                likes(user_id),
                bookmarks(user_id),
                day_plans(images)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase getFeed error:', error.message, error.details, error.hint, error.code);
            throw error;
        }

        return data.map(post => ({
            ...post,
            likes_count: post.likes?.length || 0,
            isLiked: userId ? post.likes?.some((l: { user_id: string }) => l.user_id === userId) : false,
            isBookmarked: userId ? post.bookmarks?.some((b: { user_id: string }) => b.user_id === userId) : false,
        })) as (Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number })[];
    },

    async getPostDetail(postId: string, userId?: string): Promise<Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number; day_plans: DayPlan[] }> {
        const { data: post, error: postError } = await supabase
            .from('posts')
            .select(`
                *,
                author:users!posts_author_id_fkey(nickname, avatar_url),
                likes(user_id),
                bookmarks(user_id)
            `)
            .eq('id', postId)
            .single();

        if (postError) {
            console.error('Supabase getPostDetail error:', postError.message, postError.details, postError.hint, postError.code);
            throw postError;
        }

        const { data: dayPlans, error: dayError } = await supabase
            .from('day_plans')
            .select('*, day_places(*)')
            .eq('post_id', postId)
            .order('day_number', { ascending: true });

        if (dayPlans) {
            dayPlans.forEach(plan => {
                if (plan.day_places) {
                    plan.day_places.sort((a: { sequence: number }, b: { sequence: number }) => (a.sequence || 0) - (b.sequence || 0));
                }
            });
        }

        if (dayError) throw dayError;

        return {
            ...post,
            day_plans: dayPlans,
            likes_count: post.likes?.length || 0,
            isLiked: userId ? post.likes?.some((l: { user_id: string }) => l.user_id === userId) : false,
            isBookmarked: userId ? post.bookmarks?.some((b: { user_id: string }) => b.user_id === userId) : false,
        } as unknown as (Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number; day_plans: DayPlan[] });
    },

    async createPost(postData: PartialCreatePostData, dayPlans: DayPlan[]) {
        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert([postData])
            .select()
            .single();

        if (postError) {
            console.error('Supabase post insert error:', postError.message, postError.details, postError.hint, postError.code);
            throw postError;
        }

        if (dayPlans.length > 0) {
            const plansWithId = dayPlans.map(plan => {
                const { actions, description, ...validPlan } = plan;
                return { ...validPlan, description: description || '', post_id: post.id, images: validPlan.images || [] };
            });

            const { data: insertedPlans, error: dayError } = await supabase
                .from('day_plans')
                .insert(plansWithId)
                .select();

            if (dayError) {
                console.error('Supabase day_plans insert error:', dayError);
                throw dayError;
            }

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

                    if (placesError) {
                        console.error('Supabase day_places insert error:', placesError);
                        throw placesError;
                    }
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

        if (error) throw error;
    },

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

    async bookmarkPost(postId: string, userId: string) {
        const { error } = await supabase
            .from('bookmarks')
            .insert([{ user_id: userId, post_id: postId }]);
        if (error) throw error;
    },

    async unbookmarkPost(postId: string, userId: string) {
        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .match({ user_id: userId, post_id: postId });
        if (error) throw error;
    },

    async getSavedPosts(userId: string): Promise<(Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number })[]> {
        const { data, error } = await supabase
            .from('bookmarks')
            .select(`
                post_id,
                posts (
                    *,
                    author:users!posts_author_id_fkey(nickname, avatar_url),
                    likes(user_id),
                    bookmarks(user_id)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((b: any) => ({
            ...b.posts,
            likes_count: b.posts.likes?.length || 0,
            isLiked: b.posts.likes?.some((l: { user_id: string }) => l.user_id === userId),
            isBookmarked: true,
        })) as (Post & { isLiked: boolean; isBookmarked: boolean; likes_count: number })[];
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

        if (error) throw error;
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

        if (error) throw error;
        return data as unknown as Comment;
    }
};
