import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import type { User } from '@supabase/supabase-js';
import { trackEvent } from '@/lib/gtag';

export function usePostDetail(postId: string) {
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [commentsCount, setCommentsCount] = useState<number>(0);
    const [initialComments, setInitialComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const session = await api.getSession();
                const userId = session?.user?.id;
                if (session) setCurrentUser(session.user);

                const postData = await api.getPostDetail(postId, userId);
                const commentsData = await api.getComments(postId);

                setPost(postData);
                setInitialComments(commentsData);
                setCommentsCount(commentsData.length);
            } catch (error) {
                console.error('Error fetching post detail:', error);
            } finally {
                setLoading(false);
            }
        };
        if (postId) fetchPost();
    }, [postId]);

    const handleDelete = async () => {
        if (confirm("정말 이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
            try {
                await api.deletePost(postId);
                router.push('/');
            } catch (error) {
                alert("게시물 삭제 중 오류가 발생했습니다.");
            }
        }
    };

    const handleLike = async () => {
        if (!currentUser) {
            alert('로그인이 필요한 기능입니다.');
            router.push('/login');
            return;
        }
        const newLiked = !post.isLiked;

        setPost((prev: any) => ({
            ...prev,
            isLiked: newLiked,
            likes_count: newLiked ? (prev.likes_count || 0) + 1 : Math.max(0, (prev.likes_count || 0) - 1)
        }));

        try {
            if (newLiked) await api.likePost(postId, currentUser.id);
            else await api.unlikePost(postId, currentUser.id);
            trackEvent('click_like', { post_id: postId, action: newLiked ? 'like' : 'unlike' });
        } catch (err) {
            setPost((prev: any) => ({
                ...prev,
                isLiked: !newLiked,
                likes_count: !newLiked ? (prev.likes_count || 0) + 1 : Math.max(0, (prev.likes_count || 0) - 1)
            }));
            console.error(err);
        }
    };

    const handleBookmark = async () => {
        if (!currentUser) {
            alert('로그인이 필요한 기능입니다.');
            router.push('/login');
            return;
        }
        const newBookmarked = !post.isBookmarked;

        setPost((prev: any) => ({ ...prev, isBookmarked: newBookmarked }));

        try {
            if (newBookmarked) await api.bookmarkPost(postId, currentUser.id);
            else await api.unbookmarkPost(postId, currentUser.id);
            trackEvent('bookmark_post', { post_id: postId, action: newBookmarked ? 'save' : 'unsave' });
        } catch (err) {
            setPost((prev: any) => ({ ...prev, isBookmarked: !newBookmarked }));
            console.error(err);
        }
    };

    return {
        post,
        commentsCount,
        initialComments,
        loading,
        currentUser,
        handleDelete,
        handleLike,
        handleBookmark,
    };
}
