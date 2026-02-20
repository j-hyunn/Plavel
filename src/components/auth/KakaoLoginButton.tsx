'use client';

import { supabase } from '@/lib/supabase';

export default function KakaoLoginButton() {
    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: window.location.origin + '/auth/callback',
            },
        });

        if (error) {
            console.error('Login error:', error.message);
        }
    };

    return (
        <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] font-semibold py-2.5 px-4 rounded-lg hover:bg-[#FADA0A] transition-colors"
        >
            {/* Kakao Icon placeholder */}
            <span className="w-5 h-5 bg-[#191919] rounded-full flex items-center justify-center text-[10px] text-white">k</span>
            카카오로 로그인하기
        </button>
    );
}
