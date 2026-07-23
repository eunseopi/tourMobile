# 하루제주 Mobile

하루제주는 제주 여행자가 위치 기반 스팟을 발견하고, 방문 기록과 챌린지를 통해 리워드를 쌓으며, 커뮤니티에서 여행 경험을 공유할 수 있는 모바일 서비스입니다.

이 레포지토리는 기존 React 웹 프로젝트의 핵심 사용자 흐름을 Expo 기반 React Native 앱으로 포팅한 프로젝트입니다. 웹에서 검증한 기능과 디자인 방향은 유지하면서, 위치 권한, 지도, 카메라/앨범, 푸시 알림처럼 모바일 환경에 필요한 기능을 네이티브 API에 맞춰 재구성했습니다.

## 기술적 하이라이트

- React 웹 서비스의 도메인 기능을 Expo/React Native 환경으로 마이그레이션
- Redux Toolkit 기반 상태 관리를 제거하고 Zustand + TanStack Query 역할 분리 구조로 전환
- 서버 상태, 화면 플로우, 로컬 UI 상태를 분리해 유지보수 가능한 feature hook 구조로 정리
- 위치, 지도, 이미지 선택, 카메라, 푸시 알림 등 모바일 네이티브 기능 연동
- TypeScript strict mode와 route param typing으로 화면 이동 안정성 확보
- 웹/Figma 기준 디자인을 모바일 UI로 단계적으로 재현할 수 있도록 design token과 공통 컴포넌트 기반 정리

## 주요 기능

- **온보딩 / 인증**
  - 스플래시, 권한 안내, 언어 설정, 로그인, 이메일 회원가입 플로우
  - 이메일 중복 확인, 기본 정보 입력, 비밀번호 설정, 프로필 설정, 관심 테마 선택
  - 카카오 로그인 및 카카오 가입 진입 흐름

- **메인 / 위치 기반 탐색**
  - 현재 위치 기반 주변 스팟 조회
  - 방문 체크인 및 이동/걸음 데이터 기반 통계 표시
  - 지도 화면, 스팟 상세, 신규 스팟 등록 흐름

- **챌린지**
  - 챌린지 목록/상세 조회
  - 챌린지 시작, 인증, 완료 화면

- **커뮤니티**
  - 게시글 목록, 상세, 댓글, 게시글 작성
  - 위치/태그 기반 게시글 작성 플로우

- **상점 / 리워드**
  - 상품 목록 및 상세
  - 걸음 수 포인트 전환
  - 보유 쿠폰 조회 및 쿠폰 상세

- **마이페이지**
  - 내 정보 조회
  - 프로필 수정
  - 관심 테마 수정
  - 알림 수신 설정

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| App Framework | Expo 54, React Native 0.81 |
| Language | TypeScript strict mode |
| Navigation | React Navigation Native Stack |
| Server State | TanStack Query |
| Client State | Zustand |
| HTTP Client | Axios |
| Validation | Zod, custom validation utils |
| Native APIs | Expo Location, Camera, Image Picker, Notifications |
| Map | react-native-maps |

## 프로젝트 구조

```text
src
├── api                 # Axios 인스턴스와 도메인별 API 함수
├── app
│   ├── navigation      # Root navigator와 route type
│   └── providers       # QueryClientProvider, NavigationContainer
├── components          # 공통 UI, form, brand component
├── design              # 색상, 타이포그래피, 공통 스타일 토큰
├── features            # 화면별 비즈니스 로직 hook
├── screens             # 실제 화면 단위 컴포넌트
├── stores              # Zustand 기반 client state
├── types               # API/domain type
└── utils               # validation, query keys, formatter 등
```

## 설계 포인트

### 1. 웹 기능을 모바일 흐름으로 재구성

웹 프로젝트의 화면과 기능을 단순 복사하지 않고, 모바일 사용성에 맞춰 다시 구성했습니다. 예를 들어 회원가입은 단계별 입력 플로우로 나누고, 하단 CTA를 고정해 한 손 조작이 편하도록 정리했습니다.

### 2. 서버 상태와 클라이언트 상태 분리

API로부터 가져오는 데이터는 TanStack Query로 관리하고, 앱 내부 UI 설정이나 디바이스 알림 상태처럼 서버와 직접 연결되지 않는 값은 Zustand store로 분리했습니다. 이를 통해 캐싱, refetch, optimistic update, local state의 책임이 섞이지 않도록 했습니다.

### 3. Feature Hook 중심 구조

화면 컴포넌트는 렌더링에 집중하고, API 호출/검증/상태 전환은 `features` 아래의 hook으로 분리했습니다.

예시:

- `useRegisterFlow`: 회원가입 단계, 검증, 이메일 중복 확인, 최종 제출
- `useMapScreenFlow`: 지도 화면 상태, 현재 위치, 주변 스팟
- `usePostWriteFlow`: 게시글 작성, 위치 선택, 태그/폼 검증
- `usePushNotifications`: 푸시 알림 권한 및 디바이스 토큰

### 4. 모바일 네이티브 기능 대응

Expo 모듈을 사용해 웹에서 직접 다루기 어려운 기능을 앱 환경에 맞춰 연결했습니다.

- 위치 권한 및 현재 위치 조회
- 지도 기반 스팟 탐색
- 카메라/앨범 권한과 이미지 업로드 준비
- 푸시 알림 권한 및 알림 설정 상태 관리

### 5. Type-safe Navigation

`RootStackParamList`를 기준으로 화면 이동 파라미터를 타입화했습니다. 화면 간 이동 시 route params의 누락이나 타입 불일치를 컴파일 단계에서 잡을 수 있도록 구성했습니다.

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

기본 API 주소는 `src/api/instance.ts`에 fallback으로 설정되어 있습니다. 로컬/개발 서버 주소를 바꾸려면 Expo public env를 사용합니다.

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 3. 앱 실행

```bash
npx expo start
```

Expo Go에서 QR을 스캔하거나, 아래 명령으로 플랫폼별 실행을 할 수 있습니다.

```bash
npm run ios
npm run android
npm run web
```

> `react-native-maps` 같은 네이티브 모듈은 Expo Go 버전이나 실행 환경에 따라 동작 방식이 달라질 수 있습니다. Expo Go가 프로젝트 SDK 버전과 맞지 않으면 최신 Expo Go를 사용하거나 development build 환경에서 확인해야 합니다.

## 검증 명령

```bash
npx tsc --noEmit
npx expo export --platform ios --output-dir /tmp/tourmobile-export-check
```

## 포팅 진행 상태

현재 앱은 웹 버전의 핵심 도메인을 RN 화면/네이티브 API 기준으로 옮기는 단계입니다. 기능 포팅을 우선 완료한 뒤, 웹/Figma 기준의 시각 디자인을 모바일 화면 단위로 다시 정밀하게 맞춰가는 전략으로 진행하고 있습니다.

## 앞으로 개선할 점

- Figma 기준의 세부 UI spacing, typography, component state 정밀화
- 지도/위치 기능의 실제 디바이스 테스트 강화
- 푸시 알림 수신/탭 이동 시나리오 검증
- 인증 만료, 네트워크 실패, 빈 데이터 상태에 대한 UX 보강
- EAS development build 및 배포 파이프라인 구성
