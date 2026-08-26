# 20ft Website — Current Decisions Override

> 갱신 기준: 2026-08-24
> 역할: `20ftdocs v1.2 FINAL` 이후 사용자와 다시 합의된 현재 결정을 기록한다.
> 충돌 시 이 문서가 기존 20ftdocs의 IA/Navigation/Acceptance 관련 항목보다 우선한다.

## 1. 현재 Top-level IA

```text
20ft
├─ HOME                 /
├─ PORTFOLIO            /portfolio
│  └─ DETAIL            /portfolio/{slug}
├─ SUPERBIFY            /superbify
│  └─ DETAIL            /superbify/{slug}
├─ ABOUT                /about
└─ PROJECT INQUIRY      /inquiry
```

### Navigation

```text
[20ft Logo]    Portfolio    SuperBify    [Project Inquiry]
```

- `About`은 Top Navigation에서 제거한다.
- 독립 `/about` 페이지를 추가한다. Home `ABOUT 20FT` Preview는 유지하며 CTA를 `/about`로 연결한다.
- About/Founder/Studio Identity는 `/about`에서 상세히, Home Preview에서는 요약해 전달한다.
- `Services`, `Works`, `Contact`를 별도 Top Navigation으로 만들지 않는다.
- 견적/프로젝트 문의의 영문 명칭은 `Project Inquiry`를 기본으로 한다.

## 2. Home Current Composition

```text
01 HERO
02 SELECTED PORTFOLIO
03 SUPERBIFY
04 ABOUT 20FT
05 JUST FOR FUN + PROJECT INQUIRY
FOOTER
```

### Selected Portfolio

- Home에는 실제 공개 가능한 Portfolio를 **2~3개 정도** 보여주는 것을 기본 목표로 한다.
- 최소 개수를 맞추기 위해 가짜 프로젝트를 만들지 않는다.
- 사용자가 실제 작업 화면을 Screenshot으로 제공하면 그 이미지가 프로젝트 비주얼의 중심이다.
- 작은 SaaS 카드 여러 개보다 Screenshot을 크게 보여주는 Editorial layout을 우선한다.
- Screenshot이 아직 제공되지 않았다면 가짜 Screenshot을 생성하지 않는다.
- Home Featured와 `/portfolio`는 동일 데이터 소스를 사용한다.

## 3. SuperBify Current Definition

SuperBify는 20ft가 만드는 **Gnuboard 7용 재사용 가능한 기술 제품/확장 허브**다.

v1 우선 Product Type:

- `MODULE`
- `PLUGIN`
- `TEMPLATE`

필요할 때 다음 타입을 추가할 수 있다.

- `INTEGRATION`
- `DEVELOPER_TOOL`
- `OPEN_SOURCE`

G7 공식 용어와 충돌하면 G7 공식 용어를 우선한다.

### SuperBify Detail의 목적

사용자가 제품을 확인하고 실제로 사용할 수 있어야 한다.

필요 섹션:

```text
Overview
Features
Requirements / Compatibility
Installation
Usage
Changelog
Links / Release
```

실제로 존재하는 경우에만:

- Download
- GitHub
- SIR 창작마당
- Documentation
- Release
- Purchase

버튼/버전/다운로드 수/가격/링크를 추측해서 만들지 않는다.

## 4. Project Inquiry

- `/inquiry`
- Header CTA label: `Project Inquiry`
- 웹사이트/웹서비스/커머스/G7/시스템 구축/개선/협업 문의를 받는 영역이다.
- `Request a Quote`, `Get a Quote`, `Estimate`처럼 단가 견적 회사로 좁혀 보이는 표현은 기본 Navigation 명칭으로 사용하지 않는다.
- 초기에는 G7 기존 기능으로 해결 가능한지 먼저 검토한다.
- 단순 문의를 위해 신규 Module을 과설계하지 않는다.
- 실제 backend가 없으면 fake submit을 만들지 않는다.

## 5. Acceptance Delta

기존 `15_ACCEPTANCE.md`에서 아래 항목은 현재 결정으로 대체한다.

### A. IA

- [ ] Top nav가 `Portfolio / SuperBify / Project Inquiry`인가
- [ ] Top nav에 About이 없는가
- [ ] 독립 `/about` route에 의존하지 않는가
- [ ] Home에 `ABOUT 20FT` 섹션이 존재하는가
- [ ] Services / Works / Contact 중복 메뉴가 없는가

### B. Home

- [ ] Selected Portfolio가 실제 공개 가능한 작업 2~3개를 목표로 하되 가짜 데이터로 수를 채우지 않는가
- [ ] 실제 Screenshot을 제공받았을 때 Screenshot이 작업물의 중심 비주얼로 사용되는가
- [ ] Screenshot 미제공 상태에서 가짜 화면을 생성하지 않는가

### F. SuperBify

- [ ] G7 `Module / Plugin / Template`이 일급 제품 타입으로 표현 가능한가
- [ ] Detail에서 Compatibility / Installation / Usage / Changelog / 실제 링크를 제공할 수 있는가
- [ ] 즉시 사용할 수 없는 프로젝트에 Download/Purchase CTA를 만들지 않는가

### G. About

독립 `/about` 페이지와 Home `ABOUT 20FT` Preview를 함께 검수한다.

- [ ] `/about` route가 정상 렌더링되는가
- [ ] Software Studio / Digital Garage 정체성이 짧게 전달되는가
- [ ] 이름의 기원과 Builder의 깊이를 과장 없이 전달하는가
- [ ] Home `ABOUT 20FT` Preview는 유지되며 CTA가 `/about`로 연결되는가
- [ ] About이 Home에서 Portfolio/SuperBify보다 과도하게 커지지 않는가

### J. Runtime Routes

v1 필수 route:

```text
/
/portfolio
/portfolio/{slug}
/superbify
/superbify/{slug}
/about
/inquiry
error routes
```

`/about`은 독립 브랜드 스토리 페이지로 추가한다.

## 6. BRAND COPY LOCK

다음 카피는 사용자가 변경을 요청하기 전까지 LOCKED COPY다. AI가 임의로 재작성·의역·확장하지 않는다.

```text
HOME PRIMARY SLOGAN:
작은 공간에서, 큰 가능성을 만듭니다.

ABOUT PRIMARY SLOGAN:
작은 공간에서 가능성을 만듭니다.

ENGLISH BRAND STATEMENT:
A SMALL SPACE. INFINITE POSSIBILITIES.

BRAND ATTITUDE:
JUST FOR FUN.

PRIMARY DESCRIPTOR:
Software Studio

SECONDARY BRAND CONCEPT:
Digital Garage
```

사용하지 않는 표현:

- `공간의 새로운 가능성을 디자인합니다`
- `브랜드 디자인 파트너`
- `공간의 가치를 발견하고 확장`
- `브랜드 · 공간 · 디지털` / `브랜드·공간·디지털`
- `작은 공간에서 계속 만듭니다`

새 카피가 필요하면 AI가 임의로 생성하지 않고 `COPY REQUIRED`로 사용자에게 요청한다.

## 7. 변경 금지 원칙

- G7 Core 수정 금지
- 실제 작업보다 설명이 앞서지 않게 함
- 가짜 프로젝트/가짜 Screenshot/가짜 수치/가짜 배포 링크 금지
- 20ft 디자인 시스템의 Indigo/Ivory/Gold/Signal Red 역할을 유지
- 기존 실패한 twentyft-studio UI를 복구/복사하지 않음
