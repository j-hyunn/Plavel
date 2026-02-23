import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function DELETE(req: NextRequest) {
    try {
        // 1. 현재 유저 인증
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accessToken = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);

        if (userError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = user.id;

        // 2. Kakao 유저 ID 가져오기 (identities에서 찾기)
        const kakaoIdentity = user.identities?.find(id => id.provider === 'kakao');
        const kakaoUserId = kakaoIdentity?.id;

        // 3. Kakao 앱 연결 해제 (unlink) - 다음 로그인 시 동의 재요청
        if (kakaoUserId && process.env.KAKAO_ADMIN_KEY) {
            try {
                const kakaoRes = await fetch('https://kapi.kakao.com/v1/user/unlink', {
                    method: 'POST',
                    headers: {
                        'Authorization': `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `target_id_type=user_id&target_id=${kakaoUserId}`,
                });

                if (!kakaoRes.ok) {
                    const kakaoError = await kakaoRes.text();
                    console.error('Kakao unlink error:', kakaoError);
                    // Kakao unlink 실패해도 계속 진행 (Supabase 계정은 삭제)
                }
            } catch (kakaoErr) {
                console.error('Kakao unlink request failed:', kakaoErr);
            }
        }

        // 4. DB 프로필 삭제 (CASCADE → 게시글, 댓글, 좋아요, 팔로우 등 자동 삭제)
        const { error: profileError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error('Profile delete error:', profileError);
            return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
        }

        // 5. Supabase Auth 계정 삭제
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authDeleteError) {
            console.error('Auth delete error:', authDeleteError);
            return NextResponse.json({ error: 'Failed to delete auth user' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Delete account error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
