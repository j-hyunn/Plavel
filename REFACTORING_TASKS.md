# 🛠️ Refactoring Tasks

## 🎯 Objective
1인 개발 환경에서 팀 수준의 생산성과 코드 유지보수성을 달성하기 위한 점진적 리팩토링.
작동하는 MVP를 훼손하지 않고(Non-Breaking Changes), 복잡도를 줄여 이후 기능 확장을 대비합니다.

---

## 📋 Task List

### Step 1: Type Safety (타입 시스템 구축) - ✅ 완료
- [x] `src/types/index.ts` 파일 생성
- [x] 코어 데이터 모델(User, Post, DayPlan, Comment 등)의 Interface 정의
- [x] 기존 컴포넌트(Profile, Upload 등)에 사용된 `any` 타입을 명시적 타입으로 교체

### Step 2: API Layer Modularization (도메인별 API 분리) - ✅ 완료
- [x] 단일 호스트 `src/services/api.ts`를 도메인별로 분할
- [x] `auth.ts` (인증 관련) 분리 - (현재 프로젝트에선 불필요하여 패스)
- [x] `posts.ts` (게시글 및 피드) 분리 완료
- [x] `users.ts` (유저 프로필 및 팔로우) 분리 완료

### Step 3: UI Componentization (거대 UI 컴포넌트 분할 - 파일 크기순)
현재 각 페이지의 크기(Lines of Code)를 분석하여 파일이 가장 크고 복잡도가 높은 순서대로 리팩토링합니다.

*   순위 1: `src/app/p/[postId]/page.tsx` (약 650줄) - ✅ 완료
    *   [x] `PostDetailHeader.tsx`: 대표 이미지 및 타이틀, 작성자 정보
    *   [x] `DayPlanList.tsx`: N일차 플랜 목록 및 지도보기
    *   [x] `CommentSection.tsx`: 댓글 입력 및 목록 영역
    *   [x] `FullscreenImageViewer.tsx`: 풀스크린 이미지 슬라이더 (추가 분리)
*   순위 2: `src/app/upload/page.tsx` (약 630줄) - ✅ 완료
    *   [x] `CoverImageUpload.tsx`: 상단 썸네일 업로더
    *   [x] `DateRangePicker.tsx`: 달력 컴포넌트
    *   [x] `DayPlanEditor.tsx`: N일차 컨텐츠 편집 리스트 및 DND 컴포넌트 
*   순위 3: `src/app/u/[userId]/page.tsx` (약 350줄) - ✅ 완료
    *   [x] `ProfileCard.tsx`: 유저 프로필 카드 및 통계 (Feed, Follower 등)
    *   [x] `ProfileTabs.tsx` & `ProfileGrid.tsx`: 네비게이션 칩 및 포스트 뷰어
    *   [x] `EditProfileModal.tsx`: 정보 수정 모달

### Step 4: Custom Hooks (비즈니스 로직/상태 분리) - ✅ 완료
- [x] `hooks/usePostDetail.ts`: 게시글 상세 조회 및 댓글/좋아요 상태 관리
- [x] `hooks/usePostUpload.ts`: 업로드 폼 상태 관리 및 검증 로직, 저장
- [x] `hooks/useProfile.ts`: 프로필 페칭, 팔로우 토글 핸들링

---

## 🚫 Constraints & Rules (Doc)
1. **MVP First & Component Stability**: 구조 변경 중 기존 기능이 깨지지 않도록 한 번에 하나의 Step만 진행합니다.
2. **Clear Responsibility**: 뷰(View)와 로직(Logic)의 역할을 명확히 분리합니다.
3. **Over-Engineering Avoidance**: 현재 시스템 범위를 벗어나는 과도한 라이브러리(Redux 등)나 불필요한 패턴 도입을 금지합니다.
