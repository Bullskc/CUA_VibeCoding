# 🛡️ GitHub 브랜치 보호 설정 가이드

팀 협업을 위한 브랜치 보호 규칙을 설정하는 방법을 안내합니다.

## 📋 목차
- [브랜치 보호 설정 방법](#브랜치-보호-설정-방법)
- [main 브랜치 보호 규칙](#main-브랜치-보호-규칙)
- [develop 브랜치 보호 규칙](#develop-브랜치-보호-규칙)
- [팀 권한 설정](#팀-권한-설정)
- [자동화 설정](#자동화-설정)

## 🔧 브랜치 보호 설정 방법

### 1단계: GitHub Repository 설정 접근
1. GitHub에서 프로젝트 저장소로 이동
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Branches** 클릭

### 2단계: 브랜치 보호 규칙 추가
1. **Add rule** 버튼 클릭
2. **Branch name pattern**에 보호할 브랜치명 입력

## 🎯 main 브랜치 보호 규칙

### 기본 설정
- **Branch name pattern**: `main`
- **Restrict pushes that create files larger than**: `100 MB`

### 필수 체크 항목
- ✅ **Require a pull request before merging**
  - ✅ **Require approvals**: `2` (최소 2명의 승인 필요)
  - ✅ **Dismiss stale reviews when new commits are pushed**
  - ✅ **Require review from code owners**
  - ✅ **Restrict reviews to users in teams**

- ✅ **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**
  - **Required status checks**:
    - `🔍 Lint & Format Check`
    - `🧪 Run Tests`
    - `🏗️ Build Test`
    - `🔒 Security Audit`
    - `📋 TypeScript Check`

- ✅ **Require linear history**
- ✅ **Include administrators**
- ✅ **Allow force pushes**: ❌ (비활성화)
- ✅ **Allow deletions**: ❌ (비활성화)

### 고급 설정
```yaml
# .github/branch-protection.yml (예시)
protection_rules:
  main:
    required_status_checks:
      strict: true
      contexts:
        - "ci/github-actions"
        - "ci/lint-and-format"
        - "ci/test"
        - "ci/build"
        - "ci/security"
    enforce_admins: true
    required_pull_request_reviews:
      required_approving_review_count: 2
      dismiss_stale_reviews: true
      require_code_owner_reviews: true
    restrictions: null
```

## 🌿 develop 브랜치 보호 규칙

### 기본 설정
- **Branch name pattern**: `develop`

### 필수 체크 항목
- ✅ **Require a pull request before merging**
  - ✅ **Require approvals**: `1` (최소 1명의 승인 필요)
  - ✅ **Dismiss stale reviews when new commits are pushed**

- ✅ **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**
  - **Required status checks**:
    - `🔍 Lint & Format Check`
    - `🧪 Run Tests`
    - `🏗️ Build Test`
    - `📋 TypeScript Check`

- ✅ **Allow force pushes**: ❌ (비활성화)
- ✅ **Allow deletions**: ❌ (비활성화)

## 👥 팀 권한 설정

### 1단계: 팀 생성 및 멤버 추가
1. **Settings** → **Manage access**
2. **Invite teams or people** 클릭
3. 팀 멤버들을 적절한 권한으로 추가

### 권한 레벨
- **Admin**: 프로젝트 리더, 모든 권한
- **Maintain**: 시니어 개발자, 설정 관리 가능
- **Write**: 일반 개발자, 코드 작성 및 PR 생성
- **Triage**: 이슈 관리자, 이슈 라벨링 및 할당
- **Read**: 외부 협력자, 코드 읽기만 가능

### Code Owners 설정
```bash
# .github/CODEOWNERS 파일 생성
# Global owners
* @project-lead @senior-dev

# Frontend components
/src/components/ @frontend-team @ui-specialist

# Backend/API related
/relay-server/ @backend-team @api-specialist

# Documentation
*.md @docs-team @project-lead

# Configuration files
package.json @senior-dev @devops-team
.github/ @devops-team @project-lead

# Security sensitive files
.env.example @security-team @project-lead
```

## 🤖 자동화 설정

### GitHub Actions 필수 체크
현재 설정된 GitHub Actions 워크플로우:

1. **🔍 Lint & Format Check**: 코드 스타일 검사
2. **🧪 Run Tests**: 자동 테스트 실행
3. **🏗️ Build Test**: 빌드 가능 여부 확인
4. **🔒 Security Audit**: 보안 취약점 검사
5. **📋 TypeScript Check**: 타입 에러 검사
6. **🌐 E2E Browser Tests**: 크로스 브라우저 테스트
7. **📋 Dependency Review**: 의존성 보안 검토

### 자동 머지 설정 (선택사항)
```yaml
# .github/workflows/auto-merge.yml
name: Auto-merge dependabot PRs
on:
  pull_request:
    branches: [develop]

jobs:
  auto-merge:
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - name: Auto-merge for dependabot
        uses: actions/github-script@v6
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            await github.rest.pulls.createReview({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
              event: 'APPROVE'
            });
            await github.rest.pulls.merge({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: context.issue.number,
              merge_method: 'squash'
            });
```

## 📋 브랜치 전략 워크플로우

### 일반적인 개발 워크플로우
```bash
# 1. 최신 develop 브랜치로 전환
git checkout develop
git pull origin develop

# 2. 새로운 feature 브랜치 생성
git checkout -b feature/새로운-기능

# 3. 개발 작업 수행
# ... 코딩 작업 ...

# 4. 커밋 (컨벤션 준수)
git add .
git commit -m "feat: 새로운 기능 추가"

# 5. 브랜치 푸시
git push origin feature/새로운-기능

# 6. GitHub에서 Pull Request 생성
# - Base: develop
# - Compare: feature/새로운-기능

# 7. 코드 리뷰 및 승인 후 머지

# 8. 로컬 브랜치 정리
git checkout develop
git pull origin develop
git branch -d feature/새로운-기능
```

### 릴리즈 워크플로우
```bash
# 1. develop에서 release 브랜치 생성
git checkout develop
git checkout -b release/v1.1.0

# 2. 버전 업데이트 및 최종 테스트
npm version minor  # package.json 버전 업데이트

# 3. main으로 머지
git checkout main
git merge release/v1.1.0
git tag v1.1.0

# 4. develop으로 백머지
git checkout develop
git merge main

# 5. 원격 저장소에 푸시
git push origin main
git push origin develop
git push origin v1.1.0
```

## 🚨 긴급 수정 (Hotfix) 워크플로우
```bash
# 1. main에서 hotfix 브랜치 생성
git checkout main
git checkout -b hotfix/긴급-버그-수정

# 2. 버그 수정 작업
# ... 수정 작업 ...

# 3. 커밋 및 푸시
git commit -m "fix: 긴급 버그 수정"
git push origin hotfix/긴급-버그-수정

# 4. main과 develop 양쪽으로 PR 생성
```

## 📊 브랜치 상태 모니터링

### 유용한 Git 명령어
```bash
# 브랜치 상태 확인
git branch -a
git status

# 브랜치 간 차이점 확인
git diff develop..main

# 커밋 히스토리 확인
git log --oneline --graph --all

# 원격 브랜치와 동기화
git fetch --all --prune
```

### GitHub Insights 활용
1. **Insights** 탭에서 프로젝트 통계 확인
2. **Network** 그래프로 브랜치 흐름 시각화
3. **Pulse**로 프로젝트 활동 요약 확인

## 🎯 모범 사례

### DO ✅
- 작은 단위로 자주 커밋
- 명확한 커밋 메시지 작성
- PR 생성 전 로컬 테스트 완료
- 코드 리뷰에 적극적으로 참여
- 브랜치명 컨벤션 준수

### DON'T ❌
- main/develop 브랜치에 직접 푸시
- 리뷰 없이 강제 머지
- 대용량 파일 커밋
- 작업 중인 코드를 다른 사람과 공유하지 않음
- 커밋 메시지에 의미 없는 내용 작성

---

**이 설정으로 안전하고 효율적인 팀 협업이 가능합니다! 🚀**
