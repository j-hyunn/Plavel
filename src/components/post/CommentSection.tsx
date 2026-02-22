'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import type { Comment } from '@/types';
import type { User } from '@supabase/supabase-js';
import { DEFAULT_AVATAR } from '@/lib/constants';
import { trackEvent } from '@/lib/gtag';

interface CommentSectionProps {
    postId: string;
    currentUser: User | null;
    initialComments: Comment[];
}

export default function CommentSection({ postId, currentUser, initialComments }: CommentSectionProps) {
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState('');

    const handleProfileClick = (authorId: string) => {
        if (!currentUser) {
            alert('로그인이 필요한 기능입니다.');
            router.push('/login');
            return;
        }
        router.push(`/u/${authorId}`);
    };

    const submitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!currentUser) {
            alert('로그인이 필요한 기능입니다.');
            router.push('/login');
            return;
        }

        try {
            const added = await api.addComment(postId, currentUser.id, newComment.trim());
            setComments(prev => [...prev, added]);
            setNewComment('');
            trackEvent('submit_comment', { post_id: postId });
        } catch (error) {
            console.error('Failed to add comment', error);
            alert('댓글 작성 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="pt-6 mt-6 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">댓글 {comments.length}개</h3>

            <div className="space-y-4 mb-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                        <div
                            className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleProfileClick(comment.author_id)}
                        >
                            <img src={comment.author?.avatar_url || DEFAULT_AVATAR} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                                <span
                                    className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => handleProfileClick(comment.author_id)}
                                >
                                    {comment.author?.nickname || 'Unknown'}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comment Input */}
            <form onSubmit={submitComment} className="flex items-center gap-3">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글 달기..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-base focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/40 transition-all"
                />
                <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="font-bold text-base text-primary disabled:text-primary/40 disabled:cursor-not-allowed px-2 transition-colors"
                >
                    게시
                </button>
            </form>
        </div>
    );
}
