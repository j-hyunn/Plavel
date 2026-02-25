'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { api } from '@/services/api';
import type { Post } from '@/types';
import PostCard from '@/components/feed/PostCard';
import { DEFAULT_AVATAR } from '@/lib/constants';
import { trackEvent } from '@/lib/gtag';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        const initUser = async () => {
            const session = await api.getSession();
            if (session) setUserId(session.user.id);
        };
        initUser();

        // Auto-focus input on mount
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                setHasSearched(false);
                return;
            }

            setLoading(true);
            setHasSearched(true);
            try {
                const searchResults = await api.searchPosts(debouncedQuery.trim(), userId || undefined);
                setResults(searchResults as unknown as Post[]);
                trackEvent('search', { search_term: debouncedQuery });
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery, userId]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans mb-16">
            {/* Search Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
                <div className="relative flex items-center w-full bg-gray-100 rounded-xl px-3 py-2 border border-transparent focus-within:border-primary/30 focus-within:bg-white transition-all">
                    <Search className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="제목 또는 내용으로 검색"
                        className="flex-1 bg-transparent border-none outline-none text-[15px] text-gray-900 placeholder:text-gray-400"
                    />
                    {query && (
                        <button
                            onClick={() => {
                                setQuery('');
                                inputRef.current?.focus();
                            }}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors ml-1"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-[935px] mx-auto bg-white min-h-[calc(100vh-65px)]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center pt-32 gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-gray-500 font-medium">검색 중...</p>
                    </div>
                ) : hasSearched && results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-32 text-center px-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">검색 결과가 없습니다</h3>
                        <p className="text-sm text-gray-500">다른 검색어로 다시 시도해보세요.</p>
                    </div>
                ) : !hasSearched ? (
                    <div className="flex flex-col items-center justify-center pt-32 text-center px-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-6 h-6 text-primary/60" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">여행 일정 검색</h3>
                        <p className="text-sm text-gray-500">궁금한 여행지나 키워드를 입력해보세요.</p>
                    </div>
                ) : (
                    <div className="pt-4 px-0 sm:px-4 flex flex-col items-center">
                        <div className="w-full sm:max-w-[470px]">
                            {results.map((post: any) => (
                                <PostCard
                                    key={post.id}
                                    id={post.id}
                                    username={post.author?.nickname || 'Unknown'}
                                    userImage={post.author?.avatar_url || DEFAULT_AVATAR}
                                    travelTitle={post.title}
                                    postImage={(() => {
                                        const all = [...(post.images || [])];
                                        post.day_plans?.forEach((dp: any) => { if (dp.images && Array.isArray(dp.images)) all.push(...dp.images); });
                                        return all;
                                    })()}
                                    caption={post.caption || ''}
                                    likes={post.likes_count || 0}
                                    commentsCount={post.comments_count || 0}
                                    timeAgo={new Date(post.created_at).toLocaleDateString()}
                                    travelStartDate={post.travel_start_date}
                                    travelEndDate={post.travel_end_date}
                                    isLiked={post.isLiked}
                                    isBookmarked={post.isBookmarked}
                                    currentUserId={userId || undefined}
                                    authorId={post.author_id}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
