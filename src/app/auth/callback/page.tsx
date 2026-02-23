'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { error } = await supabase.auth.getSession();

            // Try to get 'next' from URL, then from localStorage
            const searchParams = new URLSearchParams(window.location.search);
            let next = searchParams.get('next');

            if (!next) {
                next = localStorage.getItem('auth_nextRoot');
            }

            // Clean up
            localStorage.removeItem('auth_nextRoot');

            const targetPath = next || '/';

            if (!error) {
                router.replace(targetPath);
            } else {
                console.error('Auth callback error:', error.message);
                router.replace('/login');
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    );
}
