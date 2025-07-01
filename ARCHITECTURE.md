# 🏗️ 프로젝트 아키텍처 (Project Architecture)

**Catch Up AI - 재미로 하는 Vibe Coding** 프로젝트의 전체 아키텍처와 구조를 설명하는 문서입니다.

## 📋 목차
- [전체 구조 개요](#전체-구조-개요)
- [폴더 구조](#폴더-구조)
- [컴포넌트 아키텍처](#컴포넌트-아키텍처)
- [상태 관리](#상태-관리)
- [라우팅 시스템](#라우팅-시스템)
- [스타일링 구조](#스타일링-구조)
- [API 통합](#api-통합)
- [데이터 플로우](#데이터-플로우)
- [성능 최적화](#성능-최적화)

## 🎯 전체 구조 개요

이 프로젝트는 **React + TypeScript**를 기반으로 하며, **OpenAI Realtime API**를 활용한 실시간 음성 통역 애플리케이션입니다.

### 🔧 핵심 기술 스택
```
Frontend: React 18 + TypeScript
Styling: SCSS (모듈화)
Build Tool: Create React App
Audio Processing: WavRecorder + WavStreamPlayer
AI Integration: OpenAI Realtime API
State Management: React Hooks (useState, useEffect, useRef)
Routing: 커스텀 상태 기반 라우팅
```

### 🎨 아키텍처 패턴
- **Component-based Architecture**: 재사용 가능한 컴포넌트
- **State Management**: React Hooks 기반 상태 관리
- **Custom Routing**: React Router 없는 가벼운 라우팅
- **Modular Styling**: SCSS 모듈화 및 BEM 방법론
- **TypeScript First**: 완전한 타입 안전성

## 📁 폴더 구조

```
C:\AI_study\Projects\TR1_GC\openai-realtime-console\
├── 📁 public/                          # 정적 파일들
│   ├── index.html                       # HTML 템플릿
│   ├── favicon.ico                      # 파비콘
│   └── manifest.json                    # PWA 매니페스트
│
├── 📁 src/                              # 소스 코드
│   ├── 📁 components/                   # 재사용 가능한 컴포넌트들
│   │   ├── LandingPage.tsx              # 🏠 랜딩 페이지 컴포넌트
│   │   ├── LandingPage.scss             # 랜딩 페이지 스타일
│   │   ├── OriginalApp.tsx              # 🎯 원본 앱 컴포넌트
│   │   ├── ExperimentApp.tsx            # 🧪 실험용 앱 컴포넌트
│   │   ├── AdditionalStyles.scss        # 추가 스타일 및 최적화
│   │   ├── 📁 button/                   # 버튼 컴포넌트
│   │   │   ├── Button.tsx               # 버튼 컴포넌트 로직
│   │   │   └── Button.scss              # 버튼 스타일
│   │   ├── 📁 select/                   # 셀렉트 컴포넌트
│   │   │   ├── Select.tsx               # 드롭다운 컴포넌트
│   │   │   └── Select.scss              # 드롭다운 스타일
│   │   └── 📁 toggle/                   # 토글 컴포넌트
│   │       ├── Toggle.tsx               # 토글 스위치 컴포넌트
│   │       └── Toggle.scss              # 토글 스타일
│   │
│   ├── 📁 pages/                        # 페이지 컴포넌트들
│   │   ├── ConsolePage.tsx              # 메인 콘솔 페이지
│   │   └── ConsolePage.scss             # 콘솔 페이지 스타일
│   │
│   ├── 📁 lib/                          # 외부 라이브러리 및 유틸리티
│   │   └── 📁 wavtools/                 # 오디오 처리 라이브러리
│   │       ├── index.js                 # WavTools 진입점
│   │       ├── 📁 lib/                  # 핵심 라이브러리
│   │       │   ├── wav_recorder.js      # 음성 녹음 처리
│   │       │   ├── wav_stream_player.js # 음성 재생 처리
│   │       │   ├── wav_packer.js        # WAV 파일 패킹
│   │       │   └── 📁 analysis/         # 오디오 분석
│   │       │       ├── audio_analysis.js # 주파수 분석
│   │       │       └── constants.js     # 오디오 상수
│   │       └── 📁 dist/                 # 컴파일된 TypeScript 정의
│   │
│   ├── 📁 utils/                        # 유틸리티 함수들
│   │   ├── conversation_config.js       # 대화 설정
│   │   └── wav_renderer.ts              # WAV 시각화 렌더러
│   │
│   ├── App.tsx                          # 🎯 메인 애플리케이션 컴포넌트
│   ├── App.scss                         # 메인 애플리케이션 스타일
│   ├── index.tsx                        # React 앱 진입점
│   ├── index.css                        # 글로벌 스타일
│   ├── react-app-env.d.ts              # React 앱 타입 정의
│   ├── reportWebVitals.ts              # 성능 측정
│   └── setupTests.ts                    # 테스트 설정
│
├── 📁 relay-server/                     # 릴레이 서버 (Node.js)
│   ├── index.js                         # 릴레이 서버 진입점
│   └── 📁 lib/
│       └── relay.js                     # 릴레이 서버 로직
│
├── 📁 .github/                          # GitHub 설정 파일들
│   ├── 📁 workflows/                    # GitHub Actions
│   │   └── ci-cd.yml                    # CI/CD 파이프라인
│   ├── 📁 ISSUE_TEMPLATE/               # 이슈 템플릿
│   │   ├── bug_report.md                # 버그 리포트 템플릿
│   │   └── feature_request.md           # 기능 요청 템플릿
│   └── PULL_REQUEST_TEMPLATE.md         # PR 템플릿
│
├── 📄 README.md                         # 프로젝트 메인 문서
├── 📄 CONTRIBUTING.md                   # 기여 가이드라인
├── 📄 LICENSE.md                        # 라이선스 정보
├── 📄 CHANGELOG.md                      # 변경 로그
├── 📄 ARCHITECTURE.md                   # 이 문서
├── 📄 .env.example                      # 환경변수 템플릿
├── 📄 .gitignore                        # Git 무시 파일
├── 📄 .eslintrc.json                    # ESLint 설정
├── 📄 .prettierrc.json                  # Prettier 설정
├── 📄 .prettierignore                   # Prettier 무시 파일
├── 📄 package.json                      # NPM 패키지 설정
├── 📄 package-lock.json                 # NPM 잠금 파일
└── 📄 tsconfig.json                     # TypeScript 설정
```

## 🧩 컴포넌트 아키텍처

### 📊 컴포넌트 계층 구조

```
App (메인 애플리케이션)
├── LandingPageComponent (랜딩 페이지)
├── OriginalApp (원본 앱)
│   └── ConsolePage (콘솔 기능)
│       ├── Button (버튼 컴포넌트)
│       ├── Select (드롭다운 컴포넌트)
│       └── Toggle (토글 컴포넌트)
└── ExperimentApp (실험용 앱)
    └── ConsolePage (콘솔 기능)
        ├── Button (버튼 컴포넌트)
        ├── Select (드롭다운 컴포넌트)
        └── Toggle (토글 컴포넌트)
```

### 🎯 주요 컴포넌트 설명

#### 1. **App.tsx** - 메인 애플리케이션
```typescript
type AppView = 'landing' | 'original' | 'experiment' | 'console';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  // 상태 기반 라우팅 로직
}
```

**역할:**
- 전체 애플리케이션의 라우팅 관리
- 현재 보여줄 컴포넌트 결정
- 글로벌 상태 관리

#### 2. **LandingPageComponent** - 랜딩 페이지
```typescript
interface LandingPageProps {
  onNavigate: (view: 'landing' | 'original' | 'experiment' | 'console') => void;
}
```

**역할:**
- 프로젝트 소개 및 앱 선택
- 아름다운 UI로 사용자 첫인상 관리
- 원본 앱과 실험용 앱으로의 네비게이션

#### 3. **OriginalApp & ExperimentApp** - 핵심 앱 컴포넌트
```typescript
interface AppProps {
  onNavigate: (view: 'landing' | 'original' | 'experiment' | 'console') => void;
}
```

**역할:**
- OpenAI Realtime API 통합
- 오디오 처리 및 실시간 번역
- 사용자 인터페이스 제공

#### 4. **ConsolePage** - 콘솔 기능
**역할:**
- 실제 번역 기능 구현
- 오디오 녹음 및 재생 관리
- 실시간 이벤트 로그 표시

### 🔧 재사용 가능한 컴포넌트

#### Button 컴포넌트
```typescript
interface ButtonProps {
  label?: string;
  icon?: Icon;
  buttonStyle?: 'regular' | 'action' | 'alert' | 'flush';
  // ... 기타 props
}
```

#### Select 컴포넌트
```typescript
interface SelectProps {
  value: LanguageOption;
  options: LanguageOption[];
  onChange: (value: LanguageOption) => void;
}
```

#### Toggle 컴포넌트
```typescript
interface ToggleProps {
  defaultValue?: string | boolean;
  values?: string[];
  labels?: string[];
  onChange?: (isEnabled: boolean, value: string) => void;
}
```

## 🔄 상태 관리

### React Hooks 기반 상태 관리

```typescript
// 메인 앱 상태
const [currentView, setCurrentView] = useState<AppView>('landing');

// 연결 상태
const [isConnected, setIsConnected] = useState(false);

// 녹음 상태
const [isRecording, setIsRecording] = useState(false);

// 번역 데이터
const [translations, setTranslations] = useState<Translation[]>([]);

// 선택된 언어
const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>({
  code: 'ko',
  label: '🇰🇷 Korean',
  text: '번역된 텍스트'
});
```

### 📊 상태 플로우

```
사용자 입력 → useState 업데이트 → 컴포넌트 리렌더링 → UI 반영
     ↓
OpenAI API 호출 → 응답 처리 → 상태 업데이트 → 결과 표시
```

## 🛣️ 라우팅 시스템

### 커스텀 상태 기반 라우팅

React Router를 사용하지 않고 `useState`를 활용한 가벼운 라우팅 시스템:

```typescript
type AppView = 'landing' | 'original' | 'experiment' | 'console';

const renderView = () => {
  switch (currentView) {
    case 'landing':
      return <LandingPageComponent onNavigate={setCurrentView} />;
    case 'original':
      return <OriginalApp onNavigate={setCurrentView} />;
    case 'experiment':
      return <ExperimentApp onNavigate={setCurrentView} />;
    default:
      return <LandingPageComponent onNavigate={setCurrentView} />;
  }
};
```

### 📈 라우팅 플로우

```
Landing Page → 앱 선택 → Original/Experiment App → Home 버튼으로 복귀
```

## 🎨 스타일링 구조

### SCSS 모듈화 구조

```scss
// App.scss - 메인 스타일
[data-component='App'] {
  height: 100%;
  width: 100%;
  position: relative;
}

// 각 컴포넌트별 스타일 import
@import './components/LandingPage.scss';
@import './components/AdditionalStyles.scss';
```

### 🎯 스타일링 원칙

1. **BEM 방법론**: `.block__element--modifier`
2. **컴포넌트별 스타일 분리**: 각 컴포넌트마다 개별 SCSS 파일
3. **글로벌 스타일 최소화**: 필요한 경우에만 글로벌 스타일 사용
4. **반응형 디자인**: 모바일 퍼스트 접근법
5. **CSS 변수 활용**: 일관된 색상 및 크기 관리

### 📱 반응형 디자인

```scss
// Mobile First 접근법
.component {
  // 모바일 스타일 (기본)
  
  @media (min-width: 768px) {
    // 태블릿 스타일
  }
  
  @media (min-width: 1024px) {
    // 데스크톱 스타일
  }
}
```

## 🔗 API 통합

### OpenAI Realtime API 통합

```typescript
// RealtimeClient 인스턴스 생성
const clientRef = useRef<RealtimeClient>(
  new RealtimeClient({
    apiKey: apiKey,
    dangerouslyAllowAPIKeyInBrowser: true,
  })
);

// 오디오 처리
const wavRecorderRef = useRef<WavRecorder>(
  new WavRecorder({ sampleRate: 24000 })
);

const wavStreamPlayerRef = useRef<WavStreamPlayer>(
  new WavStreamPlayer({ sampleRate: 24000 })
);
```

### 🔄 API 호출 플로우

```
사용자 음성 입력 → WavRecorder → OpenAI API → 번역 결과 → WavStreamPlayer → 사용자 출력
```

### 🔒 보안 고려사항

1. **API 키 보안**: 환경변수 사용, 클라이언트 하드코딩 금지
2. **릴레이 서버**: API 키 숨김 및 서버 사이드 로직 실행
3. **에러 핸들링**: API 호출 실패 시 적절한 에러 메시지 표시

## 📊 데이터 플로우

### 전체 데이터 플로우

```
1. 사용자 인터랙션 (음성 입력/UI 조작)
   ↓
2. React 컴포넌트 상태 업데이트
   ↓
3. OpenAI Realtime API 호출
   ↓
4. API 응답 처리 및 상태 업데이트
   ↓
5. UI 리렌더링 및 결과 표시
   ↓
6. 오디오 출력 (해당하는 경우)
```

### 🎵 오디오 데이터 플로우

```
마이크 → WavRecorder → Float32Array → OpenAI API → 번역 결과 → WavStreamPlayer → 스피커
```

## ⚡ 성능 최적화

### React 최적화 기법

1. **React.memo**: 불필요한 리렌더링 방지
2. **useCallback**: 함수 메모이제이션
3. **useMemo**: 계산 결과 메모이제이션
4. **useRef**: DOM 접근 및 값 참조

### 🏗️ 번들 최적화

```typescript
// 동적 임포트 (필요한 경우)
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// 코드 분할
const [module, setModule] = useState(null);
useEffect(() => {
  import('./heavyModule').then(setModule);
}, []);
```

### 📦 빌드 최적화

- **Tree Shaking**: 사용하지 않는 코드 제거
- **Code Splitting**: 필요한 코드만 로드
- **Bundle Analyzer**: 번들 크기 분석 및 최적화

## 🔮 향후 확장 계획

### 1. 추가 기능 구현
- 더 많은 언어 지원
- 음성 감정 분석
- 실시간 자막 기능

### 2. 성능 향상
- PWA 지원
- 오프라인 기능
- 캐싱 전략 개선

### 3. 개발자 경험 개선
- Storybook 도입
- 더 많은 테스트 커버리지
- 자동화된 배포 파이프라인

---

**이 아키텍처 문서는 프로젝트의 성장과 함께 지속적으로 업데이트됩니다. 🚀**
