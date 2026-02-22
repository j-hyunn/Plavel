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
    async getFeed(userId?: string) {
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
            isLiked: userId ? post.likes?.some((l: any) => l.user_id === userId) : false,
            isBookmarked: userId ? post.bookmarks?.some((b: any) => b.user_id === userId) : false,
        }));
    },

    async getPostDetail(postId: string, userId?: string) {
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

        if (dayError) throw dayError;

        return {
            ...post,
            day_plans: dayPlans,
            likes_count: post.likes?.length || 0,
            isLiked: userId ? post.likes?.some((l: any) => l.user_id === userId) : false,
            isBookmarked: userId ? post.bookmarks?.some((b: any) => b.user_id === userId) : false,
        };
    },

    async createPost(postData: any, dayPlans: any[]) {
        const { data: post, error: postError } = await supabase
            .from('posts')
            .insert([postData])
            .select()
            .single();

        if (postError) {
            console.error('Supabase post insert error:', postError);
            throw postError;
        }

        if (dayPlans.length > 0) {
            const plansWithId = dayPlans.map(plan => {
                const { actions, description, ...validPlan } = plan;
                return { ...validPlan, description: description || '', post_id: post.id, images: validPlan.images || [] };
            });

            // Insert day plans and return data to get their generated IDs
            const { data: insertedPlans, error: dayError } = await supabase
                .from('day_plans')
                .insert(plansWithId)
                .select();

            if (dayError) {
                console.error('Supabase day_plans insert error:', dayError);
                throw dayError;
            }

            // Map and insert day_places if any
            if (insertedPlans && insertedPlans.length > 0) {
                const placesToInsert: any[] = [];
                dayPlans.forEach((originalPlan, idx) => {
                    const insertedPlan = insertedPlans.find(ip => ip.day_number === originalPlan.day_number);
                    if (insertedPlan && originalPlan.actions && originalPlan.actions.length > 0) {
                        originalPlan.actions.forEach((action: any, aIdx: number) => {
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

        if (error) {
            console.error('Supabase deletePost error:', error);
            throw error;
        }
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

    async getSavedPosts(userId: string) {
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
            isLiked: b.posts.likes?.some((l: any) => l.user_id === userId),
            isBookmarked: true,
        }));
    },

    async getComments(postId: string) {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                author:users!comments_author_id_fkey(nickname, avatar_url)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    async addComment(postId: string, userId: string, content: string) {
        const { data, error } = await supabase
            .from('comments')
            .insert([{ post_id: postId, author_id: userId, content }])
            .select(`
                *,
                author:users!comments_author_id_fkey(nickname, avatar_url)
            `)
            .single();

        if (error) throw error;
        return data;
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
