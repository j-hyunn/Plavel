export interface UserProfile {
    id: string;
    nickname: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: string;
    follower_count?: number;
    following_count?: number;
    posts?: Post[];
}

export interface Post {
    id: string;
    author_id: string;
    title: string;
    caption: string | null;
    images: string[];
    travel_start_date: string | null;
    travel_end_date: string | null;
    created_at: string;
    likes_count?: number;
    comments_count?: number;
    author?: UserProfile;
    day_plans?: DayPlan[];
}

export interface DayAction {
    id: string;
    address: string;
    lat?: number;
    lng?: number;
    google_types?: string[];
    time?: string;
}

export interface DayPlan {
    id?: string;
    post_id?: string;
    plan_id?: string;
    day_number: number;
    title: string;
    description?: string;
    actions: DayAction[];
    images?: string[];
}

export interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    created_at: string;
    author?: UserProfile;
}

export interface Like {
    user_id: string;
    post_id: string;
    created_at: string;
}

export interface Bookmark {
    user_id: string;
    post_id: string;
    created_at: string;
}

export interface Follow {
    follower_id: string;
    following_id: string;
    created_at: string;
}
