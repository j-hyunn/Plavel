# Plavel (플라벨)

> P들을 위한 J들의 여행 커뮤니티 — 실제 다녀온 일정을 Day별로 공유한다

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Database_+_Auth-3FCF8E?logo=supabase)](https://supabase.com)
[![Google Maps](https://img.shields.io/badge/Google_Maps-Places_+_Routes-4285F4?logo=googlemaps)](https://developers.google.com/maps)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com)

---

## 왜 플라벨인가

여행 계획은 남의 일정을 참고하는 데서 시작한다. 그런데 참고할 만한 **구조화된 일정**을 찾기가 의외로 어렵다.

- **인스타그램** — 감성 사진만 있고 정보 구조가 없다
- **블로그** — 글이 길어서 핵심 일정만 빠르게 보기 어렵다
- **커뮤니티** — 자유 형식이라 일정 단위로 볼 수 없다

Plavel은 게시글의 단위를 글이 아니라 **여행 일정 카드(Itinerary Post)** 로 고정한다. Day별 · 장소별 · 시간순으로 쪼개진 일정이라, 마음에 드는 Day를 통째로 **내 여행에 담아** 그대로 따라갈 수 있다.

> **Plavel**
> - Plan + Travel: 계획을 그대로 옮겨 담는 여행

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **피드** | 최신순 여행 일정 카드 리스트. 좋아요·저장·댓글 수를 카드에서 바로 확인 |
| **일정 상세** | 여러 장의 대표 이미지, Day별 장소·시간 목록, 작성자 정보, 댓글 |
| **지도 경로 보기** | Day에 담긴 장소들을 마커 + 경로 폴리라인으로 렌더링, 장소 간 직선거리(Haversine) 표시 |
| **장소 타입 아이콘** | Google Places `types` 기반으로 공항·숙소·역·식당/카페 아이콘 자동 매칭 |
| **일정 스크랩** | 남의 Day를 내 여행 일정으로 복사. 기존 일정에 붙이거나 새 일정으로 생성 |
| **내 여행** | 게시글과 분리된 개인 일정 저장소. Day 추가/편집, 장소 드래그 정렬(dnd-kit), 5분 단위 시간 선택 |
| **일정 작성** | 대표 이미지 다중 업로드(클라이언트 리사이즈), 여행 기간 선택, Day별 장소 자동완성 입력 |
| **검색** | 제목·본문 대상 검색, 500ms 디바운스 |
| **소셜** | 팔로우/팔로워, 좋아요, 저장(북마크), 댓글 |
| **프로필** | 작성한 일정 / 저장한 일정 탭, 닉네임·소개 수정 |
| **카카오 로그인** | Supabase OAuth 기반 소셜 로그인 |
| **회원 탈퇴** | 카카오 앱 연결 해제(unlink) + 프로필 CASCADE 삭제 + Auth 계정 삭제 |
| **PWA** | 홈 화면 설치, standalone 스플래시, 당겨서 새로고침 |

---

## 타겟 유저

여행을 계획하는 순간부터 다녀와서 기록하는 순간까지의 **일반 여행자**

- 남의 실제 루트를 참고해 계획을 짜고 싶은 사람
- 검증된 일정을 그대로 따라가고 싶은 사람 (계획 세우기 싫은 "P")
- 자기 여행을 일정 단위로 기록하고 공유하고 싶은 사람 (기록하는 "J")

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16.1.6 (App Router), React 19.2 |
| 언어 | TypeScript 5 |
| 스타일 | Tailwind CSS v4, tailwindcss-animate / tw-animate-css |
| UI | shadcn/ui + Radix UI, lucide-react, sonner(토스트) |
| 상태 관리 | Zustand (전역 캐시 스토어) |
| 지도 / 장소 | `@react-google-maps/api`, `use-places-autocomplete` |
| 드래그 앤 드롭 | dnd-kit (core / sortable / utilities) |
| 날짜 | date-fns, react-day-picker |
| Database / Auth | Supabase (Postgres + RLS + Kakao OAuth) |
| 분석 | Google Analytics 4 (`@next/third-parties`) |
| 배포 | Vercel |

---

## 시스템 구조

```
[App Router — src/app]
├─ /                       홈 피드 (PullToRefresh)
├─ /search                 일정 검색 (디바운스)
├─ /my-plans               내 여행 목록
│  ├─ /create              내 여행 생성
│  └─ /[planId]/(edit)     상세 · 편집
├─ /upload                 일정 게시글 작성
├─ /p/[postId]             게시글 상세 (지도 · 댓글 · 스크랩)
├─ /u/[userId]             프로필 (작성/저장 탭, `me` 지원)
├─ /login, /auth/callback  카카오 로그인 플로우
├─ /about                  랜딩 페이지
└─ /privacy, /terms        약관

[Service Layer — src/services]
├─ posts.ts    피드 · 상세 · 작성 · 좋아요 · 북마크 · 댓글 · 검색
├─ plans.ts    내 여행 조회 · 저장 · 삭제 (plans → days → places 3단 트랜잭션성 저장)
├─ users.ts    프로필 조회 · 수정 · 팔로우
├─ auth.ts     세션 · 현재 유저 · 로그아웃
└─ api.ts      위 4개를 합친 집계 객체 (하위 호환)

[Hooks — src/hooks]
usePostDetail · usePostUpload · useProfile · useMyPlans · usePlanEditor · useDayPlans · useDebounce

[상태 / 캐시 — src/store/appCache.ts]
Zustand 스토어에 feed / posts / profiles 를 5분 TTL로 캐싱 → 재진입 시 즉시 렌더

[Route Handler]
└─ DELETE /api/delete-account   Service Role Key 사용, 서버에서만 실행

[Supabase]
├─ Auth     Kakao OAuth
├─ DB       users, posts, day_plans, day_places,
│           likes, comments, bookmarks, follows,
│           my_plans, my_plan_days, my_plan_places
└─ RLS      전 테이블 활성화 — 조회는 공개, 쓰기는 소유자만
```

> 이미지는 Storage 버킷이 아니라 **클라이언트에서 리사이즈한 JPEG data URL** 을 `posts.images` (jsonb) 에 직접 저장한다.

---

## 유저 플로우

```
[탐색]  피드/검색 → 일정 상세 → 지도로 경로 확인 → 좋아요·저장·팔로우
[담기]  마음에 드는 Day → 스크랩 → 내 여행에 추가 → 장소·시간 편집
[기록]  일정 작성 → 사진·기간 입력 → Day별 장소 추가 → 게시
```

1. **로그인** — 카카오 소셜 로그인 (`/login` → `/auth/callback`)
2. **탐색** — 피드에서 최신 일정 확인, 검색으로 여행지별 실제 일정 찾기
3. **상세** — Day별 장소·시간 확인, 지도에서 동선과 거리 확인
4. **스크랩** — Day 단위로 내 여행에 담기 (기존 일정에 추가 or 새 일정 생성)
5. **편집** — `/my-plans`에서 Day 추가, 장소 드래그 정렬, 시간 지정
6. **작성** — `/upload`에서 사진·기간·Day별 장소를 입력해 게시
7. **소셜** — 좋아요 · 저장 · 댓글 · 팔로우로 피드 확장

---

## 개발

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 빌드 결과 실행
npm run lint     # ESLint
```

### 환경 변수

`.env.local`에 아래 값을 설정한다.

```bash
# 클라이언트 노출 허용
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GA_ID=

# 서버 전용 — 클라이언트 노출 금지
SUPABASE_SERVICE_ROLE_KEY=      # /api/delete-account 에서만 사용
KAKAO_ADMIN_KEY=                # 회원 탈퇴 시 카카오 unlink
```

`src/lib/supabase.ts`는 Supabase 환경 변수가 없으면 모듈 로드 시점에 즉시 예외를 던진다.

### 데이터베이스 세팅

1. `docs/Schema.sql` — 기본 테이블 · RLS 정책 · 신규 가입 트리거
2. `supabase_schema_update.sql` — `posts.images` (jsonb) 전환, `day_places` 생성
3. `supabase_my_plans_method_b.sql` — 내 여행(`my_plans` / `my_plan_days` / `my_plan_places`)
4. 나머지 `supabase_*.sql` — 댓글 · 북마크 · 캡션 · Day 이미지 · `google_types` 증분 반영

### 카카오 로그인

카카오 개발자 콘솔과 Supabase Auth 설정 절차는 [docs/AuthGuide.md](./docs/AuthGuide.md) 참고. Redirect URI에는 앱 주소가 아니라 **Supabase Callback URL**을 넣어야 한다.

### 주의

- 마이그레이션이 `docs/Schema.sql` + 루트의 `supabase_*.sql` 로 흩어져 있고 순서 의존성이 있다. 신규 환경 구성 시 위 순서를 지킬 것.
- 이미지가 data URL로 DB에 들어가므로 행 크기가 커진다. `processImageFile`의 기본값(최대 800px, 품질 0.6)을 임의로 올리지 말 것.
- `day_places`의 RLS는 조회·삽입·삭제가 전체 공개 상태다. 소유자 기준으로 조일 필요가 있다.

---

## 문서

| 문서 | 설명 |
|------|------|
| [docs/PRD.md](./docs/PRD.md) | 문제 정의 · 타겟 유저 · 코어 루프 · 콘텐츠 모델 |
| [docs/IA.md](./docs/IA.md) | 라우트 및 화면 구조 |
| [docs/DataModel.md](./docs/DataModel.md) | 도메인 모델 정의 |
| [docs/Schema.sql](./docs/Schema.sql) | 테이블 · RLS · 트리거 DDL |
| [docs/API.md](./docs/API.md) | 초기 API 명세 (현재는 Supabase 직접 호출로 대체) |
| [docs/AuthGuide.md](./docs/AuthGuide.md) | 카카오 로그인 설정 가이드 |
| [docs/PrivacyPolicy.md](./docs/PrivacyPolicy.md) · [docs/TermsOfService.md](./docs/TermsOfService.md) | 개인정보처리방침 · 이용약관 |
| [REFACTORING_TASKS.md](./REFACTORING_TASKS.md) | 리팩토링 로드맵 및 진행 상황 |
| [.agents/rules/](./.agents/rules/) | 에이전트가 매 세션 읽는 프로젝트 규칙 |

---

## 설계 원칙

> 여행 일정은 "빠르게 훑고, 그대로 가져가는" 콘텐츠다. 읽는 비용보다 담는 비용이 낮아야 한다.

- **일정 단위 고정** — 자유 서식을 허용하지 않는다. Day → 장소 → 시간 구조를 강제해 탐색과 복사가 가능하게 한다.
- **모바일 우선** — 하단 탭 네비게이션, 당겨서 새로고침, PWA 설치를 기본 전제로 설계한다.
- **뷰와 로직 분리** — 페이지는 조합만 하고, 데이터 페칭·검증·저장은 훅과 서비스 레이어가 담당한다.
- **과한 추상화 금지** — MVP 범위를 벗어나는 라이브러리·패턴은 도입하지 않는다 (`REFACTORING_TASKS.md` 제약).
- **에러는 삼키지 않는다** — 모든 Supabase 호출은 `handleSupabaseError`로 컨텍스트를 붙여 던진다.

---

*MVP: 전면 무료*
