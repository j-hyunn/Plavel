'use client';

import Link from 'next/link';
import KakaoLoginButton from '@/components/auth/KakaoLoginButton';

export default function LoginPageContent() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
            <div className="w-full max-w-[320px] flex flex-col items-center gap-8">

                {/* Logo + Tagline */}
                <div className="flex flex-col items-center gap-3">
                    <img src="/applogo.svg" alt="Plavel" className="h-10 w-auto" />
                    <p className="text-sm font-medium text-primary text-center">
                        P들을 위한 J들의 여행 커뮤니티
                    </p>
                </div>

                {/* Kakao Login Button */}
                <div className="w-full">
                    <KakaoLoginButton />
                </div>

                {/* Disclaimer */}
                <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                    카카오 계정을 통해 로그인함으로써 플레블의{' '}
                    <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600 transition-colors">
                        개인정보 처리방침
                    </Link>
                    {' '}및{' '}
                    <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600 transition-colors">
                        이용약관
                    </Link>
                    에 동의한 것으로 간주합니다.
                </p>
            </div>
        </div>
    );
}
