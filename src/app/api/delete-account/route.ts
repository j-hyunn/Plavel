import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// service_role key가 필요한 admin API
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function DELETE(req: NextRequest) {
    try {
        // 요청 헤더에서 현재 세션의 access token 꺼내기
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accessToken = authHeader.replace('Bearer ', '');

        // access token으로 현재 유저 확인
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
        if (userError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = user.id;

        // 1. 유저 데이터 삭제 (DB CASCADE로 게시글, 댓글, 좋아요, 팔로우 등 자동 삭제됨)
        const { error: profileError } = await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.error('Profile delete error:', profileError);
            return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
        }

        // 2. Supabase Auth 계정 삭제 (다음 카카오 로그인 시 재동의 필요)
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
