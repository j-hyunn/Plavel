'use client';
import KakaoLoginButton from '@/components/auth/KakaoLoginButton';

export default function LoginPageContent() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-[350px] space-y-4">
                <div className="instagram-card p-10 flex flex-col items-center space-y-8">
                    <h1 className="text-4xl font-serif italic font-bold">Plavel</h1>
                    <p className="text-center text-gray-500 font-medium">
                        사진과 동영상을 보려면 로그인하세요.
                    </p>
                    <div className="w-full">
                        <KakaoLoginButton />
                    </div>
                    <div className="flex items-center w-full gap-4">
                        <div className="h-[1px] bg-gray-300 flex-1" />
                        <span className="text-xs text-gray-400 font-bold">또는</span>
                        <div className="h-[1px] bg-gray-300 flex-1" />
                    </div>
                    <button className="text-[var(--primary-button)] font-semibold text-sm">
                        비밀번호를 잊으셨나요?
                    </button>
                </div>

                <div className="instagram-card p-6 text-center">
                    <p className="text-sm">
                        계정이 없으신가요?
                        <button className="text-[var(--primary-button)] font-semibold ml-1">가입하기</button>
                    </p>
                </div>
            </div>
        </div>
    );
}
