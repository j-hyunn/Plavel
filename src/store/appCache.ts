import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────
interface CacheEntry<T> {
    data: T;
    cachedAt: number;
}

interface AppCacheState {
    feed: CacheEntry<any[]> | null;
    posts: Record<string, CacheEntry<any>>;    // postId → post detail
    profiles: Record<string, CacheEntry<any>>; // userId → profile

    setFeed: (data: any[]) => void;
    setPost: (postId: string, data: any) => void;
    updatePost: (postId: string, patch: Partial<any>) => void;
    setProfile: (userId: string, data: any) => void;

    getFeed: () => any[] | null;
    getPost: (postId: string) => any | null;
    getProfile: (userId: string) => any | null;
}

const CACHE_TTL = 5 * 60 * 1000; // 5분

function isFresh<T>(entry: CacheEntry<T> | null): boolean {
    if (!entry) return false;
    return Date.now() - entry.cachedAt < CACHE_TTL;
}

export const useAppCache = create<AppCacheState>((set, get) => ({
    feed: null,
    posts: {},
    profiles: {},

    setFeed: (data) => set({ feed: { data, cachedAt: Date.now() } }),

    setPost: (postId, data) =>
        set((state) => ({
            posts: { ...state.posts, [postId]: { data, cachedAt: Date.now() } },
        })),

    updatePost: (postId, patch) =>
        set((state) => {
            const existing = state.posts[postId];
            if (!existing) return state;
            return {
                posts: {
                    ...state.posts,
                    [postId]: { ...existing, data: { ...existing.data, ...patch } },
                },
            };
        }),

    setProfile: (userId, data) =>
        set((state) => ({
            profiles: { ...state.profiles, [userId]: { data, cachedAt: Date.now() } },
        })),

    getFeed: () => {
        const entry = get().feed;
        return isFresh(entry) ? entry!.data : null;
    },

    getPost: (postId) => {
        const entry = get().posts[postId];
        return isFresh(entry) ? entry!.data : null;
    },

    getProfile: (userId) => {
        const entry = get().profiles[userId];
        return isFresh(entry) ? entry!.data : null;
    },
}));
