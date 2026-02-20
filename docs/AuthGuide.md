# Supabase 카카오 로그인 설정 가이드

Plavel 프로젝트에서 카카오 로그인을 활성화하기 위한 단계별 가이드입니다.

## 1. 카카오 개발자 콘솔 설정
[Kakao Developers](https://developers.kakao.com/)에 접속하여 애플리케이션을 생성합니다.

1.  **애플리케이션 추가**: '내 애플리케이션' -> '애플리케이션 추가하기'
2.  **앱 키 확인**: '플랫폼' -> '가이드 보기' 또는 '요약 정보'에서 **REST API 키**를 복사해둡니다.
3.  **플랫폼 등록**: '플랫폼' -> 'Web' -> '사이트 도메인'에 `http://localhost:3000` (개발 환경) 추가
4.  **카카오 로그인 활성화**: '제품 설정' -> '카카오 로그인' -> '활성 상태'를 **ON**으로 변경
5.  **Redirect URI 설정**: Supabase 대시보드에서 복사한 **Callback URL**을 등록해야 합니다. (2단계 참조)
    *   주의: `http://localhost:3000`이 아니라 Supabase 주소(예: `https://[REF].supabase.co/auth/v1/callback`)를 넣어야 합니다.
6.  **보안(Client Secret)**: '제품 설정' -> '카카오 로그인' -> '보안' -> '코드 생성'을 통해 **Client Secret**을 발급받고 복사해둡니다.
7.  **동의항목 설정**: '제품 설정' -> '카카오 로그인' -> '동의항목'에서 `닉네임`, `프로필 사진`(필수), `이메일`(선택) 등을 설정합니다.

## 2. Supabase 대시보드 설정
[Supabase Dashboard](https://supabase.com/dashboard)에서 설정을 완료합니다.

1.  **Provider 활성화**: `Authentication` -> `Providers` -> `Kakao` 선택
2.  **값 입력**:
    *   **Kakao Client ID (REST API Key)**: 1단계에서 복사한 **REST API 키** 입력
    *   **Kakao Client Secret**: 1단계에서 복사한 **Client Secret** 입력
3.  **Callback URL 확인**: 활성화 창 하단에 표시된 `Callback URL`을 복사하여 **카카오 개발자 콘솔의 Redirect URI**에 붙여넣습니다.
4.  **Redirect URLs (Allow List) 설정**: `Authentication` -> `URL Configuration`에서 다음을 수행합니다.
    *   **Site URL**: `http://localhost:3000` 입력
    *   **Redirect URLs**: `http://localhost:3000/**` 또는 `http://localhost:3000/auth/callback` 추가 (이게 빠지면 에러가 발생합니다!)

## 3. 로컬 환경 테스트
1.  `.env.local` 파일에 Supabase 정보가 정확히 입력되었는지 확인합니다.
2.  `npm run dev` 실행 후 로그인 페이지에서 '카카오로 로그인하기' 버튼을 클릭하여 동작을 확인합니다.
