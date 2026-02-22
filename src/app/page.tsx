'use client';
import BottomNav from '@/components/layout/BottomNav';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PostCard from '@/components/feed/PostCard';
import { api } from '@/services/api';

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        setUserId(session.user.id);
        const feed = await api.getFeed(session.user.id);
        setPosts(feed);
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-gray-50">
      <BottomNav />
      {/* Feed Header (Web and Mobile) */}
      <div className="w-full px-4 md:px-8 py-3 border-b border-[var(--border)] bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
        <img src="/applogo.svg" alt="Plavel Logo" className="h-6 w-auto" />
        <div className="bg-gray-100 rounded-full px-4 py-1.5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium uppercase tracking-tight">Active</span>
        </div>
      </div>

      <main className="pb-28 min-h-screen flex justify-center">
        <div className="w-full max-w-[630px] sm:py-6 px-0 sm:px-4">
          <div className="w-full sm:max-w-[470px] mx-auto">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  username={post.author?.nickname || 'Unknown'}
                  userImage={post.author?.avatar_url || 'https://i.pravatar.cc/150'}
                  travelTitle={post.title}
                  postImage={(() => {
                    let coverImgs = [];
                    try {
                      const imgVal = post.images || post.cover_image_url;
                      coverImgs = typeof imgVal === 'string' && imgVal.startsWith('[') ? JSON.parse(imgVal) : (Array.isArray(imgVal) ? imgVal : [imgVal]);
                    } catch {
                      coverImgs = [post.cover_image_url];
                    }
                    const all = [...coverImgs];
                    post.day_plans?.forEach((dp: any) => { if (dp.images && Array.isArray(dp.images)) all.push(...dp.images); });
                    return all;
                  })()}
                  caption={post.caption || ''}
                  likes={post.likes_count || 0}
                  timeAgo={new Date(post.created_at).toLocaleDateString()}
                  travelStartDate={post.travel_start_date}
                  travelEndDate={post.travel_end_date}
                  isLiked={post.isLiked}
                  isBookmarked={post.isBookmarked}
                  currentUserId={userId || undefined}
                />
              ))
            ) : (
              <div className="text-center py-20 bg-white sm:rounded-lg border-y sm:border border-[var(--border)] w-full">
                <p className="text-gray-500">아직 게시물이 없습니다.</p>
                <p className="text-sm text-gray-400 mt-2">첫 번째 여행기를 작성해보세요!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

