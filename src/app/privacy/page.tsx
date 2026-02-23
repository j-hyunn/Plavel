'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button onClick={() => router.back()} className="text-gray-700 hover:text-primary transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-base font-bold text-gray-900">개인정보 처리방침</h1>
            </header>

            <main className="max-w-2xl mx-auto px-5 py-8 pb-20">
                <div className="space-y-1 mb-8">
                    <h2 className="text-xl font-bold text-gray-900">개인정보 처리방침</h2>
                    <p className="text-sm text-gray-400">시행일: 2026년 2월 23일</p>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-8">
                    Plavel(이하 "서비스")은 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 및 관련 법령을 준수합니다.
                    본 방침은 서비스가 수집하는 개인정보의 항목, 수집 방법, 이용 목적, 보유 기간 및 이용자의 권리에 대해 안내합니다.
                </p>

                <Section title="1. 수집하는 개인정보 항목">
                    <SubTitle>1-1. 카카오 소셜 로그인을 통해 수집하는 정보</SubTitle>
                    <List items={[
                        '카카오 계정 고유 식별자(ID)',
                        '프로필 닉네임',
                        '프로필 이미지 URL',
                    ]} />
                    <Note>Plavel은 카카오 이메일, 전화번호, 생년월일 등 민감정보는 수집하지 않습니다.</Note>

                    <SubTitle>1-2. 서비스 이용 과정에서 생성·수집되는 정보</SubTitle>
                    <List items={[
                        '작성한 여행 일정 게시글 (제목, 이미지, 기간, Day별 일정, 설명)',
                        '댓글 내용',
                        '좋아요, 북마크, 팔로우 활동 기록',
                        '내 여행 계획 데이터 (제목, 일정, 방문 장소)',
                        '서비스 이용 일시 및 접속 로그',
                    ]} />

                    <SubTitle>1-3. 자동으로 수집되는 정보</SubTitle>
                    <List items={[
                        '접속 페이지, 이벤트 유형 (Google Analytics를 통해 수집)',
                        '기기 유형 (모바일/웹)',
                    ]} />
                </Section>

                <Section title="2. 개인정보 수집 방법">
                    <List items={[
                        '카카오 OAuth 2.0 인증을 통한 수집',
                        '이용자가 서비스를 사용하는 과정에서 직접 입력 및 생성',
                    ]} />
                </Section>

                <Section title="3. 개인정보 이용 목적">
                    <Table
                        headers={['목적', '세부 내용']}
                        rows={[
                            ['회원 식별 및 서비스 제공', '로그인 유지, 게시글·댓글·좋아요 등 기능 제공'],
                            ['서비스 품질 개선', '이용 패턴 분석을 통한 UI/UX 개선'],
                            ['불법·부정 이용 방지', '악용 사례 감지 및 차단'],
                        ]}
                    />
                </Section>

                <Section title="4. 제3자 제공 및 위탁">
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                        Plavel은 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
                        다만, 서비스 운영을 위해 아래 업체에 처리를 위탁합니다.
                    </p>
                    <Table
                        headers={['업체', '위탁 내용', '보유 기간']}
                        rows={[
                            ['Supabase (미국)', '데이터베이스 저장 및 인증', '회원 탈퇴 시까지'],
                            ['Vercel (미국)', '웹 서비스 호스팅', '서비스 운영 기간'],
                            ['Kakao (대한민국)', '소셜 로그인 인증', 'Kakao 정책에 따름'],
                            ['Google Analytics (미국)', '서비스 이용 통계 수집', '14개월'],
                        ]}
                    />
                </Section>

                <Section title="5. 개인정보 보유 및 파기">
                    <List items={[
                        '보유 기간: 회원 탈퇴 시까지',
                        '파기 방법: 데이터베이스에서 영구 삭제',
                        '단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.',
                    ]} />
                </Section>

                <Section title="6. 이용자의 권리">
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        이용자는 언제든지 다음 권리를 행사할 수 있습니다.
                    </p>
                    <List items={[
                        '자신의 개인정보 열람 요청',
                        '개인정보 수정 요청',
                        '회원 탈퇴(개인정보 삭제) 요청',
                    ]} />
                    <p className="text-sm text-gray-500 mt-3">요청은 아래 연락처로 문의하시면 처리해드립니다.</p>
                </Section>

                <Section title="7. 쿠키 및 분석 도구">
                    <List items={[
                        'Supabase 세션 쿠키: 로그인 상태 유지를 위해 사용됩니다.',
                        'Google Analytics: 페이지뷰, 이벤트 클릭 등 익명화된 행동 데이터를 수집합니다.',
                    ]} />
                </Section>

                <Section title="8. 만 14세 미만 아동 보호">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        본 서비스는 만 14세 미만 아동의 가입을 받지 않습니다.
                    </p>
                </Section>

                <Section title="9. 개인정보 보호 담당자">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        개인정보와 관련한 문의, 불만, 권리 행사 요청은 아래로 연락해주세요.
                    </p>
                    <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 space-y-1">
                        <p><span className="font-semibold">서비스명:</span> Plavel</p>
                        <p><span className="font-semibold">이메일:</span> [운영자 이메일]</p>
                    </div>
                </Section>

                <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
                    본 방침은 2026년 2월 23일부터 시행됩니다.
                </div>
            </main>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-8">
            <h3 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function SubTitle({ children }: { children: React.ReactNode }) {
    return <p className="text-sm font-semibold text-gray-700 mt-4 mb-1">{children}</p>;
}

function List({ items }: { items: string[] }) {
    return (
        <ul className="space-y-1.5">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                    {item}
                </li>
            ))}
        </ul>
    );
}

function Note({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-2 p-3 bg-primary/5 border border-primary/10 rounded-xl text-xs text-primary/80 leading-relaxed">
            {children}
        </div>
    );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50">
                        {headers.map((h, i) => (
                            <th key={i} className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-t border-gray-100">
                            {row.map((cell, j) => (
                                <td key={j} className="px-3 py-2.5 text-xs text-gray-600 leading-relaxed">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
