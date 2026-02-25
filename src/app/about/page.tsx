import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Plavel - P들을 위한 J들의 여행 커뮤니티',
    description: '실제 다녀온 여행 일정을 Day별로 공유하고, 다른 사람의 루트를 참고하세요. Plavel은 계획 없는 P들을 위한 구조화된 여행 커뮤니티입니다.',
};

const features = [
    {
        emoji: '🎇',
        title: '피드 탐색',
        desc: '여행자들의 Day별 일정을 한눈에 확인하세요.',
    },
    {
        emoji: '🔍',
        title: '여행 일정 검색',
        desc: '제목이나 내용으로 검색해 원하는 여행지의 실제 일정을 바로 찾아보세요.',
    },
    {
        emoji: '🗓️',
        title: '내 여행 추가',
        desc: '마음에 드는 일정을 내 여행으로 추가해서 나만의 여행을 만들어보세요.',
    },
    {
        emoji: '👤',
        title: '팔로우 & 피드',
        desc: '마음이 맞는 여행 고수를 팔로우하고 최신 일정을 피드에서 확인하세요.',
    },
];

const problems = [
    { platform: '📸 인스타그램', issue: '감성 사진만 있고 정보 구조가 없어요' },
    { platform: '📝 블로그', issue: '글이 길어서 핵심 일정만 빠르게 보기 어려워요' },
    { platform: '💬 커뮤니티', issue: '자유 형식이라 일정 단위로 볼 수 없어요' },
];

export default function AboutPage() {
    return (
        <div className="bg-white text-gray-900 font-sans overflow-x-hidden">

            {/* ── NAV ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <img src="/applogo.svg" alt="Plavel" className="h-7 w-auto" />
                <Link
                    href="/"
                    className="text-sm font-bold px-5 py-2 rounded-full text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #933FFB, #c084fc)' }}
                >
                    시작하기
                </Link>
            </nav>

            {/* ── HERO ── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
                {/* background blobs */}
                <div className="absolute top-[-120px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: '#933FFB' }} />
                <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: '#c084fc' }} />

                <div className="relative z-10 flex flex-col items-center gap-6 max-w-xl mx-auto">
                    <img src="/applogo.svg" alt="Plavel" className="h-12 w-auto" />

                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-gray-900">
                        P들을 위한<br />
                        <span style={{ background: 'linear-gradient(135deg, #933FFB, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            J들의 여행 커뮤니티
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-sm">
                        실제 다녀온 여행의 <strong className="text-gray-800">Day별 일정</strong>을 공유하고,<br />
                        검증된 루트를 그대로 따라가보세요.
                    </p>

                    <Link
                        href="/"
                        className="mt-2 flex items-center gap-2 text-white font-bold text-base px-8 py-3.5 rounded-full shadow-lg transition-all hover:shadow-xl hover:scale-[1.03]"
                        style={{ background: 'linear-gradient(135deg, #933FFB, #c084fc)' }}
                    >
                        무료로 시작하기 →
                    </Link>
                    <p className="text-xs text-gray-400">카카오 계정으로 3초 만에 로그인</p>
                </div>
            </section>

            {/* ── PROBLEM ── */}
            <section className="bg-gray-950 text-white py-24 px-6">
                <div className="max-w-2xl mx-auto">
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3 text-center">Problem</p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-4 leading-tight">
                        기존 플랫폼,<br />
                        <span className="text-gray-400">뭔가 아쉽지 않으셨나요?</span>
                    </h2>
                    <p className="text-center text-gray-400 mb-12 text-sm">
                        여행 계획할 때 참고할 만한 <em>구조화된 일정</em>을 찾기가 의외로 힘듭니다.
                    </p>

                    <div className="flex flex-col gap-4">
                        {problems.map((p) => (
                            <div key={p.platform} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                                <span className="text-2xl mt-0.5">{p.platform.split(' ')[0]}</span>
                                <div>
                                    <p className="font-bold text-white text-sm">{p.platform.split(' ').slice(1).join(' ')}</p>
                                    <p className="text-gray-400 text-sm mt-0.5">{p.issue}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 p-6 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg, rgba(147,63,251,0.25), rgba(192,132,252,0.15))', border: '1px solid rgba(147,63,251,0.3)' }}>
                        <p className="text-lg font-bold text-white">그래서 <span style={{ color: '#c084fc' }}>Plavel</span>을 만들었습니다.</p>
                        <p className="text-gray-300 text-sm mt-1">일정 단위로, 구조적으로, 빠르게.</p>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-2xl mx-auto">
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-3 text-center">Features</p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-12 leading-tight text-gray-900">
                        여행 일정 공유의<br />새로운 기준
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {features.map((f) => (
                            <div key={f.title} className="group bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-100 rounded-2xl p-6 transition-all duration-300">
                                <span className="text-3xl mb-4 block">{f.emoji}</span>
                                <h3 className="font-extrabold text-gray-900 mb-1.5 group-hover:text-purple-700 transition-colors">{f.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-24 px-6 sm:px-12 bg-gray-50">
                <div className="max-w-4xl mx-auto">
                    <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-3 text-center">How it works</p>
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gray-900 leading-tight text-center">
                        이렇게 사용해요
                    </h2>
                    <p className="text-gray-400 text-sm text-center mb-14">3단계로 나의 여행 커뮤니티를 시작하세요.</p>

                    {/* Asymmetric 2-column: left has step 01+03, right has step 02 */}
                    <div className="flex flex-col sm:flex-row gap-8 items-start">

                        {/* LEFT COLUMN — 01 + 03 */}
                        <div className="flex flex-col gap-8 flex-1">
                            {/* Step 01 */}
                            <div className="flex flex-col gap-4">
                                <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white">
                                    <img src="/ss-feed.png" alt="피드 탐색" className="w-full block" />
                                </div>
                                <div className="pl-1">
                                    <span className="text-[11px] font-extrabold text-purple-400 tracking-widest">01</span>
                                    <p className="font-extrabold text-gray-900 mt-0.5">피드 탐색</p>
                                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">여행자들의 Day별 실제 일정을 피드에서 구경하세요.</p>
                                </div>
                            </div>

                            {/* Step 03 */}
                            <div className="flex flex-col gap-4">
                                <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white">
                                    <img src="/ss-add-plan.png" alt="내 여행 추가" className="w-full block" />
                                </div>
                                <div className="pl-1">
                                    <span className="text-[11px] font-extrabold text-purple-400 tracking-widest">03</span>
                                    <p className="font-extrabold text-gray-900 mt-0.5">내 여행 추가</p>
                                    <p className="text-sm text-gray-400 mt-1 leading-relaxed">마음에 드는 일정을 내 여행에 추가해 나만의 플랜을 만드세요.</p>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN — 02 */}
                        <div className="flex flex-col gap-4 flex-[1.4]">
                            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white">
                                <img src="/ss-detail.png" alt="여행 일정 확인" className="w-full block" />
                            </div>
                            <div className="pl-1">
                                <span className="text-[11px] font-extrabold text-purple-400 tracking-widest">02</span>
                                <p className="font-extrabold text-gray-900 mt-0.5">여행 일정 확인</p>
                                <p className="text-sm text-gray-400 mt-1 leading-relaxed">게시글을 눌러 Day별 일정, 장소, 지도를 상세하게 확인하세요.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="relative py-28 px-6 overflow-hidden text-center" style={{ background: 'linear-gradient(135deg, #933FFB 0%, #c084fc 100%)' }}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="relative z-10 max-w-lg mx-auto">
                    <img src="/applogo.svg" alt="Plavel" className="h-8 w-auto mx-auto mb-6 brightness-0 invert" />
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                        다음 여행,<br />Plavel로 기록해보세요.
                    </h2>
                    <p className="text-purple-100 text-sm mb-8">카카오 계정만 있으면 바로 시작할 수 있어요.</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-white text-purple-700 font-extrabold text-base px-8 py-3.5 rounded-full shadow-xl transition-all hover:scale-[1.03]"
                    >
                        지금 시작하기 →
                    </Link>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="bg-gray-950 text-gray-500 text-xs text-center py-8 px-4 space-y-2">
                <div className="flex items-center justify-center gap-4">
                    <Link href="/privacy" className="hover:text-white transition-colors">개인정보 처리방침</Link>
                    <span>·</span>
                    <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
                    <span>·</span>
                    <a href="mailto:lab.jehyun@gmail.com" className="hover:text-white transition-colors">문의</a>
                </div>
                <p>© 2026 Plavel. All rights reserved.</p>
            </footer>
        </div>
    );
}
