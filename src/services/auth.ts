import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const authApi = {
    async getSession(): Promise<Session | null> {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error('getSession error', error);
            return null;
        }
        return session;
    },

    async getCurrentUser(): Promise<User | null> {
        const session = await this.getSession();
        return session?.user || null;
    },

    async signOut(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }
};
