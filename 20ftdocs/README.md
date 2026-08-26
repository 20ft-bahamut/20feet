# 20ftdocs

20ft Software Studio 웹사이트를 처음부터 다시 구축하기 위한 **설계 문서 + 콘텐츠 원고 + 구현 하네스**입니다.

이 문서 세트의 목적은 특정 AI 모델의 감각에 디자인을 맡기는 것이 아니라, **20ft의 브랜드·정보구조·콘텐츠·디자인 시스템·G7 구현 규칙을 먼저 고정하고 AI는 이를 구현하도록 만드는 것**입니다.

## 1. 프로젝트 한 줄 정의

**20ft는 웹과 소프트웨어, 필요한 도구를 직접 만드는 독립 Software Studio / Digital Garage입니다.**

브랜드의 중심 문장:

> **A SMALL SPACE. INFINITE POSSIBILITIES.**  
> 작은 공간에서, 큰 가능성을 만듭니다.

브랜드 태도:

> **JUST FOR FUN.**

## 2. 사이트의 최우선 목적

1. 방문자가 20ft가 무엇을 만드는 곳인지 빠르게 이해한다.
2. Portfolio를 통해 실력과 작업 범위를 증명한다.
3. SuperBify를 통해 G7/Open Source 활동과 기술적 깊이를 보여준다.
4. About을 통해 20ft와 Founder의 정체성을 전달한다.
5. 프로젝트 문의로 자연스럽게 전환한다.

20ft는 정형화된 상품 패키지를 판매하는 에이전시가 아니므로 **Services 페이지를 만들지 않습니다.**

## 3. 최종 Top Navigation

- Portfolio
- SuperBify
- About
- 프로젝트 문의

`Contact`와 `프로젝트 문의`를 중복 배치하지 않습니다.

## 4. 문서 읽는 순서

1. `README.md`
2. `00_AI_HARNESS.md`
3. `01_IA.md`
4. `02_BRAND.md`
5. `03_DESIGN_SYSTEM.md`
6. `04_CONTENT.md`
7. `05_HOME.md`
8. `06_PORTFOLIO.md`
9. `07_SUPERBIFY.md`
10. `08_ABOUT.md`
11. `09_PROJECT_INQUIRY.md`
12. `10_COMPONENTS.md`
13. `11_DATA_MODELS.md`
14. `12_G7_TEMPLATE_RULES.md`
15. `13_RESPONSIVE_ACCESSIBILITY_SEO.md`
16. `14_IMPLEMENTATION_PLAN.md`
17. `15_ACCEPTANCE.md`
18. `16_EXTERNAL_REVIEW_GUIDE.md`
19. `17_ASSETS.md`
20. `18_RELEASE_NOTES.md`

## 5. 비협상 원칙

- 기존 실패한 `twentyft-studio` UI를 복원하거나 재사용하지 않는다.
- 카페/캠핑/카라반 사진을 웹사이트 비주얼로 사용하지 않는다.
- 과거 20ft는 **철학과 이름의 기원**으로만 계승한다.
- 흔한 SaaS, AI Startup, SI 회사 디자인을 피한다.
- 가짜 고객, 가짜 숫자, 가짜 다운로드, 가짜 포트폴리오를 만들지 않는다.
- 공개 여부가 확정되지 않은 Portfolio 후보는 기본 `private`로 취급하며 사용자 승인 전 공개하지 않는다.
- `Services`를 최상위 메뉴로 만들지 않는다.
- Home은 Portfolio 중심으로 단순하게 구성한다.
- Services 페이지를 두지 않는 대신, Home Hero와 Footer에는 `WEB / COMMERCE / SOFTWARE / GNUBOARD 7` 수행범위를 반드시 노출한다.
- SuperBify는 홍보 섹션이 아니라 **프로젝트 허브/게시판형 구조**로 설계한다.
- 공개 가능한 SuperBify 프로젝트가 0개이면 가짜 Seed를 만들지 않고 공식 Empty State를 사용한다.
- 프로젝트 문의 버튼은 항상 명확하게 존재해야 한다.
- G7 Core는 수정하지 않는다.
- Runtime DB에만 최신 레이아웃이 남는 상태를 만들지 않는다.
- `template:update --force` 같은 덮어쓰기 명령 전에는 Git commit + DB snapshot이 반드시 존재해야 한다.
- 브라우저 실제 렌더링을 확인하지 않고 “완료”라고 보고하지 않는다.
- 구현 AI는 최종 디자인 품질을 스스로 최종 PASS할 수 없다. 최종 Quality Gate는 사용자 또는 별도의 독립 리뷰어가 판단한다.

## 6. 공식 브랜드 에셋

```text
assets/
└── brand/
    └── 20ft/
        └── logo/
            ├── badge-dark.svg
            ├── badge-light.svg
            ├── compact.svg
            ├── compact-white.svg
            ├── full.svg
            ├── full-white.svg
            ├── symbol.svg
            └── symbol-white.svg
```

공식 SVG는 비율, 색상, path를 임의로 변형하지 않습니다.

## 7. 이번 v1에서 하지 않는 것

- 블로그
- 뉴스
- Build Log 별도 메뉴
- Services 페이지
- 가격표
- 가짜 고객사 로고
- 팀원 소개 페이지
- 카페 Archive Gallery
- AI 기능 홍보
- 화려한 WebGL/3D
- 불필요한 관리자형 메타 테이블
- 콘텐츠가 없는 메뉴를 미리 만들어두기

## 8. 성공 상태

> **20ft가 누구지?** → 작은 Software Studio.  
> **무엇을 만들지?** → Portfolio를 보니 웹, SaaS, G7/Open Source 등 실제로 만드는 범위가 보임.  
> **개발 깊이가 있나?** → SuperBify에서 직접 도구를 만들고 관리하는 것을 확인.  
> **누가 운영하지?** → About에서 20년+ 웹 개발 경험을 가진 Builder가 운영함을 이해.  
> **일을 맡기려면?** → 프로젝트 문의.

## 9. 문서 변경 규칙

구현 중 IA나 브랜드 정책을 바꾸고 싶다면 코드부터 바꾸지 않습니다.

1. 해당 문서 수정
2. 변경 이유 기록
3. 관련 페이지 문서/Acceptance 갱신
4. 코드 구현

**문서가 설계도이고 코드는 결과물입니다.**
