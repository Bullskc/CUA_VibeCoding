# 🤝 기여 가이드 (Contributing Guide)

**Catch Up AI - 재미로 하는 Vibe Coding** 프로젝트에 기여해주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 설명합니다.

## 📋 목차

- [시작하기](#시작하기)
- [개발 환경 설정](#개발-환경-설정)
- [브랜치 전략](#브랜치-전략)
- [커밋 컨벤션](#커밋-컨벤션)
- [코딩 스타일](#코딩-스타일)
- [Pull Request 가이드](#pull-request-가이드)
- [이슈 리포팅](#이슈-리포팅)

## 🚀 시작하기

### 1. 저장소 포크 및 클론

```bash
# 1. GitHub에서 저장소 포크
# 2. 로컬에 클론
git clone https://github.com/[your-username]/CUA_VibeCoding.git
cd CUA_VibeCoding

# 3. 원본 저장소를 upstream으로 추가
git remote add upstream https://github.com/Bullskc/CUA_VibeCoding.git
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
# .env.example을 복사하여 .env 파일 생성
copy .env.example .env

# OpenAI API 키 설정
# OPENAI_API_KEY=your_api_key_here
```

## 🛠️ 개발 환경 설정

### 필수 도구

- **Node.js**: v16 이상
- **npm**: v7 이상
- **Git**: 최신 버전
- **VS Code**: 권장 에디터

### 권장 VS Code 확장프로그램

- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- GitLens
- Auto Rename Tag

## 🌿 브랜치 전략

### 브랜치 유형

- **main**: 프로덕션 브랜치 (배포용)
- **develop**: 개발 통합 브랜치
- **feature/[기능명]**: 새로운 기능 개발
- **bugfix/[버그명]**: 버그 수정
- **hotfix/[이슈명]**: 긴급 수정

### 브랜치 작업 플로우

```bash
# 1. develop 브랜치로 전환 및 최신화
git checkout develop
git pull upstream develop

# 2. 새로운 기능 브랜치 생성
git checkout -b feature/새로운-기능명

# 3. 개발 작업 수행
# ... 코딩 작업 ...

# 4. 커밋 및 푸시
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin feature/새로운-기능명

# 5. Pull Request 생성
```

## 💬 커밋 컨벤션

### 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 커밋 타입

- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **docs**: 문서 수정
- **style**: 코드 스타일 변경 (포맷팅, 세미콜론 등)
- **refactor**: 코드 리팩토링
- **test**: 테스트 코드 추가/수정
- **chore**: 빌드 과정 또는 보조 도구 변경

### 커밋 메시지 예시

```bash
feat(landing): 랜딩 페이지 그라데이션 배경 추가

- 모던한 그라데이션 배경 디자인 적용
- 반응형 디자인 지원
- 애니메이션 효과 추가

Closes #123
```

## 🎨 코딩 스타일

### TypeScript/React 규칙

```typescript
// ✅ 좋은 예시
interface UserProps {
  name: string;
  age: number;
}

const UserComponent: React.FC<UserProps> = ({ name, age }) => {
  return (
    <div className="user-component">
      <h1>{name}</h1>
      <p>Age: {age}</p>
    </div>
  );
};

export default UserComponent;
```

### SCSS 규칙

```scss
// ✅ 좋은 예시
.user-component {
  padding: 1rem;
  border-radius: 8px;

  h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  p {
    color: #666;
    font-size: 0.9rem;
  }
}
```

### 네이밍 컨벤션

- **컴포넌트**: PascalCase (`UserProfile`)
- **파일명**: PascalCase (`UserProfile.tsx`)
- **변수/함수**: camelCase (`userName`, `getUserData`)
- **상수**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **CSS 클래스**: kebab-case (`user-profile`)

## 📝 Pull Request 가이드

### PR 체크리스트

- [ ] 코드가 린트 규칙을 통과하는가?
- [ ] 타입 에러가 없는가?
- [ ] 새로운 기능에 대한 테스트가 추가되었는가?
- [ ] 문서가 업데이트되었는가?
- [ ] 브랜치명이 규칙에 맞는가?
- [ ] 커밋 메시지가 컨벤션에 맞는가?

### PR 제목 형식

```
[타입] 간단한 변경사항 설명
```

예시:

- `[feat] 다국어 지원 기능 추가`
- `[fix] 드롭다운 z-index 문제 해결`
- `[docs] README 설치 가이드 업데이트`

### PR 설명 템플릿

```markdown
## 📋 변경사항

- 변경사항 1
- 변경사항 2

## 🎯 변경 이유

변경한 이유를 설명합니다.

## 🧪 테스트 방법

1. 단계 1
2. 단계 2

## 📸 스크린샷 (필요시)

변경사항을 보여주는 스크린샷

## 📋 체크리스트

- [ ] 코드 리뷰 준비 완료
- [ ] 테스트 통과
- [ ] 문서 업데이트
```

## 🐛 이슈 리포팅

### 버그 리포트

```markdown
## 🐛 버그 설명

버그에 대한 명확하고 간결한 설명

## 🔄 재현 단계

1. '...'로 이동
2. '....'를 클릭
3. '....'까지 스크롤
4. 오류 확인

## 🎯 예상 동작

예상했던 동작에 대한 설명

## 📸 스크린샷

가능하다면 스크린샷 첨부

## 💻 환경 정보

- OS: [예: Windows 11]
- 브라우저: [예: Chrome 91]
- Node.js 버전: [예: 16.14.0]
```

### 기능 요청

```markdown
## 🚀 기능 요청

새로운 기능에 대한 설명

## 💡 동기

이 기능이 필요한 이유

## 📋 상세 설명

기능의 작동 방식에 대한 설명

## 🎨 추가 컨텍스트

관련 스크린샷, 링크 등
```

## 🎯 개발 가이드라인

### 성능 고려사항

- React.memo, useMemo, useCallback 적절히 사용
- 불필요한 리렌더링 방지
- 번들 크기 최적화

### 보안 고려사항

- API 키는 절대 클라이언트 코드에 하드코딩 금지
- 환경변수 사용
- XSS 공격 방지

### 접근성 고려사항

- 적절한 ARIA 라벨 사용
- 키보드 네비게이션 지원
- 색상 대비 고려

## 🤝 커뮤니티 규칙

### 행동 강령

- 서로 존중하고 배려하는 태도
- 건설적인 피드백 제공
- 다양성과 포용성 중시
- 학습과 성장을 위한 환경 조성

### 소통 방식

- GitHub Issues: 버그 리포트, 기능 요청
- Pull Requests: 코드 리뷰, 토론
- Discussions: 일반적인 질문, 아이디어 공유

## 📞 도움이 필요한 경우

문제가 있거나 질문이 있다면:

1. 먼저 [Issues](https://github.com/Bullskc/CUA_VibeCoding/issues)를 확인
2. 해결책을 찾을 수 없다면 새로운 Issue 생성
3. 급한 경우 프로젝트 메인테이너에게 연락

---

**즐거운 Vibe Coding을 함께 만들어 갑시다! 🎉**
