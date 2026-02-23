'use client';

import { supabase } from '@/lib/supabase';

export default function KakaoLoginButton() {
    const handleLogin = async () => {
        const searchParams = new URLSearchParams(window.location.search);
        const next = searchParams.get('next');

        if (next) {
            localStorage.setItem('auth_nextRoot', next);
        }

        const callbackUrl = new URL(window.location.origin + '/auth/callback');
        if (next) callbackUrl.searchParams.set('next', next);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: callbackUrl.toString(),
            },
        });

        if (error) {
            console.error('Login error:', error.message);
        }
    };

    return (
        <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] font-semibold py-3 px-4 rounded-xl hover:bg-[#FADA0A] transition-colors"
        >
            <img src="/kakaologo.svg" alt="Kakao" className="w-5 h-5" />
            카카오로 로그인하기
        </button>
    );
}
