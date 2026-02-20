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

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        const feed = await api.getFeed();
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

      <main className=" pb-28 min-h-screen flex justify-center">
        <div className="w-full max-w-[630px] py-8 px-0 sm:px-4">
          {/* Feed Header (Mobile only) */}
          <div className="md:hidden p-4 border-b border-[var(--border)] bg-white sticky top-0 z-50 flex items-center justify-between">
            <h1 className="text-xl font-serif italic font-bold">Plavel</h1>
            <div className="bg-gray-100 rounded-full px-4 py-1.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium uppercase tracking-tight">Active</span>
            </div>
          </div>



          {/* Feed */}
          <div className="max-w-[470px] mx-auto">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  username={post.author?.nickname || 'Unknown'}
                  userImage={post.author?.avatar_url || 'https://i.pravatar.cc/150'}
                  travelTitle={post.title}
                  postImage={post.cover_image_url}
                  caption={post.caption || ''}
                  likes={post.likes_count || 0}
                  timeAgo={new Date(post.created_at).toLocaleDateString()}
                  travelStartDate={post.travel_start_date}
                  travelEndDate={post.travel_end_date}
                />
              ))
            ) : (
              <div className="text-center py-20 bg-white md:rounded-lg border border-[var(--border)]">
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

