'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function TermsPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3">
                <button onClick={() => router.back()} className="text-gray-700 hover:text-primary transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <h1 className="text-base font-bold text-gray-900">이용약관</h1>
            </header>

            <main className="max-w-2xl mx-auto px-5 py-8 pb-20">
                <div className="space-y-1 mb-8">
                    <h2 className="text-xl font-bold text-gray-900">이용약관</h2>
                    <p className="text-sm text-gray-400">시행일: 2026년 2월 23일</p>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-8">
                    본 약관은 Plavel(이하 "서비스")의 이용 조건 및 절차에 관한 사항을 규정합니다.
                    서비스를 이용함으로써 본 약관에 동의한 것으로 간주됩니다.
                </p>

                <Section title="제1조 (목적)">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        본 약관은 Plavel이 제공하는 여행 일정 공유 커뮤니티 서비스의 이용과 관련하여 서비스와 이용자 간의 권리,
                        의무 및 책임 사항을 규정함을 목적으로 합니다.
                    </p>
                </Section>

                <Section title="제2조 (서비스 내용)">
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">Plavel은 다음 기능을 제공합니다.</p>
                    <List items={[
                        '여행 일정(Itinerary) 게시글 작성 및 공유',
                        '타 이용자의 여행 일정 열람 및 탐색',
                        '좋아요, 댓글, 북마크 기능',
                        '이용자 팔로우/팔로워 기능',
                        '개인 여행 계획 작성 및 관리 (내 여행)',
                        '카카오 계정 기반 소셜 로그인',
                    ]} />
                </Section>

                <Section title="제3조 (회원가입)">
                    <NumberList items={[
                        '회원가입은 카카오 소셜 로그인을 통해 이루어집니다.',
                        '만 14세 미만 이용자는 서비스를 이용할 수 없습니다.',
                        '타인의 정보를 도용하거나 허위 정보로 가입한 경우 서비스 이용이 제한될 수 있습니다.',
                    ]} />
                </Section>

                <Section title="제4조 (이용자의 의무)">
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">이용자는 다음 행위를 해서는 안 됩니다.</p>
                    <div className="space-y-2">
                        {[
                            ['타인 권리 침해', '타인의 저작권, 초상권, 개인정보를 침해하는 콘텐츠 게시'],
                            ['불법 콘텐츠', '음란물, 폭력적 콘텐츠, 혐오 표현 등 법령에 위반되는 내용 게시'],
                            ['스팸·광고', '서비스 목적과 무관한 반복적 홍보, 광고 게시'],
                            ['서비스 방해', '해킹, 과도한 요청, 자동화 도구 등을 통한 서비스 과부하 유발'],
                            ['허위 정보', '사실과 다른 여행 정보나 후기를 의도적으로 게시'],
                            ['계정 공유', '계정 양도, 판매, 대여 행위'],
                        ].map(([title, desc], i) => (
                            <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                                <span className="text-xs font-bold text-primary flex-shrink-0 mt-0.5">{i + 1}</span>
                                <div>
                                    <span className="text-sm font-semibold text-gray-800">{title}: </span>
                                    <span className="text-sm text-gray-600">{desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="제5조 (콘텐츠 저작권)">
                    <NumberList items={[
                        '이용자가 게시한 콘텐츠(글, 이미지 등)의 저작권은 이용자 본인에게 있습니다.',
                        '이용자는 Plavel에 해당 콘텐츠를 서비스 운영 목적(예: 썸네일, 미리보기 등)으로 사용할 수 있는 비독점적 권리를 부여합니다.',
                        '서비스 자체의 로고, 디자인, 코드 등에 대한 지식재산권은 Plavel에 귀속됩니다.',
                    ]} />
                </Section>

                <Section title="제6조 (콘텐츠 관리 및 제재)">
                    <NumberList items={[
                        '본 약관 제4조를 위반한 콘텐츠는 사전 통보 없이 삭제될 수 있습니다.',
                        '위반이 반복되거나 중대한 경우 계정이 정지 또는 영구 삭제될 수 있습니다.',
                    ]} />
                </Section>

                <Section title="제7조 (서비스의 변경 및 중단)">
                    <NumberList items={[
                        '서비스는 운영상 필요에 따라 기능을 추가, 변경, 또는 종료할 수 있습니다.',
                        '서비스 종료 시 이용자에게 30일 전 공지를 원칙으로 합니다.',
                        '천재지변, 점검, 외부 서비스 장애(Supabase, Vercel 등) 등 불가피한 사유로 서비스가 일시 중단될 수 있습니다.',
                    ]} />
                </Section>

                <Section title="제8조 (면책 조항)">
                    <NumberList items={[
                        '서비스는 이용자가 게시한 콘텐츠의 정확성, 신뢰성에 대해 보증하지 않습니다.',
                        '이용자 간의 분쟁에 대해 서비스는 책임지지 않습니다.',
                        '이용자의 귀책 사유로 발생한 손해에 대해 서비스는 책임지지 않습니다.',
                    ]} />
                </Section>

                <Section title="제9조 (회원 탈퇴 및 데이터 삭제)">
                    <NumberList items={[
                        '이용자는 언제든지 회원 탈퇴를 요청할 수 있습니다.',
                        '탈퇴 요청 시 해당 계정과 관련된 개인정보는 즉시 삭제됩니다.',
                        '단, 이용자가 게시한 게시글·댓글은 별도 삭제 요청이 없을 경우 서비스에 남을 수 있습니다.',
                    ]} />
                </Section>

                <Section title="제10조 (준거법 및 분쟁 해결)">
                    <NumberList items={[
                        '본 약관은 대한민국 법령에 따라 해석됩니다.',
                        '서비스와 이용자 간 분쟁이 발생할 경우, 상호 협의를 통해 해결을 우선 시도합니다.',
                        '협의가 이루어지지 않을 경우 관할 법원은 민사소송법에 따릅니다.',
                    ]} />
                </Section>

                <Section title="제11조 (약관의 개정)">
                    <NumberList items={[
                        '본 약관은 법령 변경, 서비스 정책 변경 등에 따라 개정될 수 있습니다.',
                        '개정 시 시행 7일 전 서비스 내 공지를 통해 안내합니다.',
                        '개정에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.',
                    ]} />
                </Section>

                <div className="mt-8 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 space-y-1">
                    <p className="text-xs font-bold text-gray-500 mb-2">부칙</p>
                    <p>본 약관은 2026년 2월 23일부터 시행됩니다.</p>
                    <p><span className="font-semibold">문의:</span> [운영자 이메일]</p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-400 text-center">
                    © 2026 Plavel. All rights reserved.
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

function NumberList({ items }: { items: string[] }) {
    return (
        <ol className="space-y-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="flex-shrink-0 font-bold text-primary/60 text-xs mt-0.5">{i + 1}.</span>
                    <span className="leading-relaxed">{item}</span>
                </li>
            ))}
        </ol>
    );
}
