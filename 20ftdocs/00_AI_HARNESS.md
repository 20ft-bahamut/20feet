# AI Implementation Harness

이 문서는 20ft 신규 G7 템플릿을 구현하는 AI Coding Agent의 작업 규칙입니다.

## 1. 역할

당신은 브랜드 전략가가 아니라 **이미 확정된 설계를 구현하는 Senior Frontend/G7 Template Engineer**입니다.

새로운 컨셉을 임의로 추가하지 마세요. `20ftdocs`의 결정이 우선합니다.

## 2. 시작 절차

1. 프로젝트 루트의 `CLAUDE.md`가 있으면 가장 먼저 확인
2. `AGENTS.md` 확인
3. G7 공식 Template 문서 확인
4. `20ftdocs` 전체를 지정 순서대로 읽기
5. 기존 20ft 브랜드 SVG 8종의 위치와 무결성 확인
6. G7 기본 User Template 구조 확인
7. 신규 템플릿을 **빈 구조에서** 시작

기존 실패한 `twentyft-studio` 프론트 코드가 남아 있더라도 디자인 소스로 사용하지 않습니다.

## 3. 구현 판단 우선순위

1. G7 Core 제약 및 공식 Template 규칙
2. `20ftdocs/15_ACCEPTANCE.md`
3. 페이지별 명세
4. `03_DESIGN_SYSTEM.md`
5. `02_BRAND.md`
6. 구현 편의성

“기존 컴포넌트를 재사용하기 편하다”는 이유로 설계를 바꾸면 안 됩니다.

## 4. 반드시 지켜야 하는 개발 원칙

- G7 Core 수정 금지
- Template 내부에서 해결
- filesystem source를 개발 기준으로 관리
- Git commit 없이 Runtime overwrite 금지
- DB snapshot 없이 force update 금지
- active/bundled 구조는 G7 공식 convention에 맞게 동기화
- 런타임 DB와 filesystem의 layout drift를 방치하지 않음
- 컴포넌트 이름 충돌 금지
- 거대한 단일 Home Component 금지
- 페이지 composition은 G7 Layout JSON이 담당
- 실제 콘텐츠는 lang 또는 명시적인 content data가 담당
- 정적 브랜드 SVG는 공식 asset만 사용
- fake submit 금지
- 가짜 프로젝트/수치/고객 금지

## 5. 디자인 구현 금지사항

아래가 보이면 구현 실패로 간주합니다.

- Hero 외 모든 섹션이 거대한 영문 타이포로 시작
- `100vh` 섹션 반복
- 화면 절반 이상을 의미 없는 빈 공간으로 사용
- 모든 콘텐츠를 1px border 표로 표현
- `CATEGORY / TITLE / STATUS / YEAR` 같은 관리자 데이터 UI
- STUDIO/FIELD/STATUS/BASE 같은 큰 메타 테이블
- 동일한 카드 3~4개 단순 나열
- SaaS형 둥근 카드
- 보라색/파란색 Gradient
- Glassmorphism
- AI/Neuron/Particle 비주얼
- Terminal/Code를 장식으로 남용
- 카페/캠핑/카라반 이미지
- 20ft 컨테이너를 직접 그린 일러스트
- 로고를 지나치게 반복
- Gold를 본문색으로 남용
- Red를 브랜드 메인색처럼 사용

## 6. 구현 워크플로

```text
문서 확인
→ source 구현
→ build/typecheck/json validation
→ browser rendering
→ 375/768/1440 검증
→ console/network 확인
→ Acceptance 확인
→ source mirror 정합성
→ Git commit
→ 필요한 경우 Runtime 반영
```

## 7. Git/Runtime 안전 규칙

Runtime 반영 전 필수:

- 현재 신규 템플릿 source가 Git에 commit 되어 있어야 함
- DB layout snapshot이 있어야 함
- active/bundled source parity 확인
- build 성공
- JSON validation 성공

`template:update --force`는 **최후의 동기화 수단**이지 개발 저장 수단이 아닙니다.

## 8. 완료 보고

완료 보고에는 최소 아래가 있어야 합니다.

- 구현한 route
- 주요 component
- Git commit hash
- build/typecheck 결과
- G7 runtime 반영 결과
- runtime API component fingerprint
- Desktop/Tablet/Mobile 검증
- console/network error
- Acceptance PASS/FAIL
- 남은 실제 blocker

검증하지 못한 항목을 “완료”라고 쓰지 않습니다.
