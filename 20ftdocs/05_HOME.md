# Home Specification

## 1. 목적

Home은 브랜드 선언문을 전시하는 페이지가 아니라 **20ft를 빠르게 이해시키고 Portfolio와 문의로 연결하는 페이지**입니다.

본문 섹션은 5개만 둡니다.

# 01 HERO

## 목적

5초 안에 20ft / Software Studio / 무엇을 만드는지 / Portfolio / 문의를 이해시킵니다.

## 콘텐츠

`04_CONTENT.md`의 Home Hero를 그대로 사용합니다.

### Capability 노출 정책

`WEB / COMMERCE / SOFTWARE / GNUBOARD 7`는 **필수 정보**입니다.

- Desktop/Mobile 모두 보여야 합니다.
- 장식 metadata 안에 숨기지 않습니다.
- 너무 작거나 대비가 낮아 사실상 읽히지 않는 상태도 허용하지 않습니다.
- Services 페이지가 없는 초기 사이트에서 수행 범위를 보완하는 역할입니다.

## 레이아웃

Desktop:

- 12-column
- 카피 7~8 columns
- 공식 symbol 또는 구조 그래픽 4~5 columns
- Hero는 대략 viewport 70~85% 범위
- 100vh 강제 금지

Mobile:

- 카피 먼저
- Symbol은 작게 뒤따르거나 생략 가능
- CTA 2개는 stack 또는 wrap

## 금지

- STUDIO/FIELD/STATUS/BASE 표
- 불필요한 위치 좌표
- 세 줄 이상의 장식 metadata
- Hero 아래에 또 거대한 brand manifesto

# 02 SELECTED PORTFOLIO

## 목적

Services를 대신합니다.

방문자가 작업물을 보며 “이런 일을 하는 곳”이라고 이해해야 합니다.

## 구성

- Heading
- Lead
- Featured portfolio 2~4개
- 전체 Portfolio CTA

Desktop에서 project item은 반복 카드가 아니라 이미지/텍스트 비율을 달리한 editorial project block 또는 간결한 2-column grid 사용 가능.

## 프로젝트 표시 정보

- Cover
- Title
- Summary
- Category
- Year
- Status (필요 시)
- Detail Link

### v1 Seed

공개 여부가 확정된 항목만 게시합니다.

권장 초기 후보:

1. **20ft Website**
   - Category: WEB / BRAND / G7
   - Status: BUILDING 또는 OPERATING
   - Year: 2026
   - Summary: 20ft의 새로운 Software Studio 브랜드와 G7 User Template을 구축하는 자체 프로젝트.

2. **PurePol — 공개 후보, 기본 비공개**
   - Category 후보: SAAS / WEB APPLICATION
   - `visibility: private`를 기본값으로 한다.
   - Status / Summary / Screenshot / 상세 사업정보는 **사용자가 공개 범위를 명시적으로 확정한 뒤에만** 작성하고 public으로 전환한다.
   - 구현 AI가 운영 상태나 공개 가능한 내용을 추측해 채우지 않는다.

3. **SuperBify — 실제 공개 데이터가 있을 때만**
   - Category: OPEN SOURCE / GNUBOARD 7
   - `/superbify`에 실제 공개 가능한 프로젝트 또는 허브 콘텐츠가 준비된 경우에만 Portfolio 항목으로 공개한다.
   - 준비되지 않았다면 Portfolio 수를 채우기 위해 억지로 노출하지 않는다.

가짜 고객 작업을 채우지 않습니다.

# 03 SUPERBIFY

## 목적

“20ft는 고객 작업만 하는 곳이 아니라 필요한 도구를 직접 만든다”는 기술적 신뢰를 줍니다.

## Home에서는 짧게

- SuperBify 설명
- 공개 프로젝트가 있으면 최근/대표 프로젝트 최대 2~3개
- 프로젝트명 + status + type
- `/superbify` CTA

### v1 Empty State 정책

공개 가능한 SuperBify 프로젝트가 **0개**이면 프로젝트 카드를 만들지 않습니다.

대신 설명 + 아래 Empty State + `/superbify` CTA를 렌더링합니다.

> 첫 프로젝트를 만들고 있습니다. 실제로 쓸 수 있을 때 공개합니다.

공개 프로젝트가 1개라면 1개만 보여줍니다. 2~3개를 맞추기 위해 가짜 Seed를 생성하지 않습니다.

SuperBify가 Home의 1/3 이상을 차지하지 않습니다.

# 04 ABOUT 20FT

## 목적

회사 규모보다 Builder의 깊이와 브랜드 배경을 전달합니다.

## 구성

- About heading
- 20ft 이름 설명 2~3문장
- Founder proof 1블록
- About CTA

사진은 사용하지 않아도 됩니다.

Badge 로고는 이 영역에서 1회 사용할 수 있습니다.

# 05 JUST FOR FUN + PROJECT INQUIRY

## 목적

브랜드 태도와 전환을 하나의 섹션으로 끝냅니다.

별도의 `JUST FOR FUN` 풀스크린과 별도 CTA 풀스크린으로 쪼개지 않습니다.

## 구성

Left/Top:

- JUST FOR FUN.
- 짧은 의미

Right/Bottom:

- 만들고 싶은 것이 있으신가요?
- 프로젝트 문의 버튼

Deep Indigo surface 사용 가능.

# FOOTER

Compact.

포함:

- 20ft white/compact logo
- Portfolio / SuperBify / About
- Project Inquiry
- A SMALL SPACE. INFINITE POSSIBILITIES.
- `WEB / COMMERCE / SOFTWARE / GNUBOARD 7` capability line
- © 20ft

Footer가 별도 Hero처럼 커지면 실패입니다.
