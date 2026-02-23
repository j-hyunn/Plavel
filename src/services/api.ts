import { postsApi } from './posts';
import { usersApi } from './users';
import { plansApi } from './plans';
import { authApi } from './auth';

// Re-export specific models for convenience if needed, or directly use from @/types
export type { Post, DayPlan } from '@/types';

/**
 * Aggregated API object to maintain backward compatibility.
 * Use domain-specific APIs (`postsApi`, `usersApi`, `plansApi`, `authApi`) for new implementations if desired.
 */
export const api = {
    ...postsApi,
    ...usersApi,
    ...plansApi,
    ...authApi
};
