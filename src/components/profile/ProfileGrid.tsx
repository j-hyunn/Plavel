import { Heart, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Post } from '@/types';

interface ProfileGridProps {
    posts: Post[];
}

export default function ProfileGrid({ posts }: ProfileGridProps) {
    const router = useRouter();

    if (!posts || posts.length === 0) {
        return <div className="text-center text-gray-500 py-10">게시물이 없습니다.</div>;
    }

    return (
        <div className="grid grid-cols-3 gap-0.5 md:gap-1">
            {posts.map((post: Post) => {
                const firstImage = post.images && post.images.length > 0 ? post.images[0] : '';
                return (
                    <div
                        key={post.id}
                        onClick={() => router.push(`/p/${post.id}`)}
                        className="aspect-square bg-gray-100 relative group cursor-pointer overflow-hidden rounded-sm"
                    >
                        <img
                            src={firstImage}
                            alt="post"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold">
                            <div className="flex items-center gap-1">
                                <Heart className="w-5 h-5 fill-white" />
                                <span className="text-base">{post.likes_count || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageCircle className="w-5 h-5 fill-white" />
                                <span className="text-base">{post.comments_count || 0}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
