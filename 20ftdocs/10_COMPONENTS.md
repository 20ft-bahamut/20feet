# Component Architecture

컴포넌트 이름은 G7 프로젝트 convention에 맞춰 조정할 수 있으나 역할은 유지합니다.

## 1. Global

### SiteHeader

Props:

- logoVariant
- navigation
- inquiryHref

Responsibilities:

- desktop nav
- mobile trigger
- sticky behavior
- active route

### MobileNavigation

- Portfolio
- SuperBify
- About
- 프로젝트 문의

### SiteFooter

Compact footer.

## 2. Brand

### BrandLogo

공식 SVG asset selector.

Variants:

- full
- compact
- symbol
- badge

Tone:

- light
- dark

SVG 자체 변경 금지.

### SectionEyebrow

작은 mono label.

### MeasurementMark

선택적 장식. 콘텐츠보다 중요하게 보이면 안 됨.

## 3. Home

### HomeHero

Home 전용 Hero.

### SelectedPortfolio

Portfolio data를 받아 featured items 렌더링.

### SuperBifyPreview

SuperBify data 재사용.

### AboutPreview

짧은 브랜드/Founder proof.

### InquiryMottoCTA

JUST FOR FUN + 문의를 하나의 섹션으로 결합.

## 4. Portfolio

### PortfolioGrid / PortfolioList

프로젝트 수와 이미지에 따라 반응형.

### PortfolioCard

정보 우선순위:

1. Cover
2. Title
3. Summary
4. Category / Year

### PortfolioDetailHero

### ProjectMeta

### ProjectSection

### ProjectGallery

실제 이미지가 있을 때만.

### NextProject

## 5. SuperBify

### SuperBifyList

### SuperBifyProjectItem

### StatusBadge

Status enum만 허용.

### ProjectVersion

Version이 있을 때만 표시.

### SuperBifyDetail

### ChangelogList

## 6. About

### AboutHero

### FounderProof

### BrandBadgeBlock

필요할 때 1회.

## 7. Inquiry

### InquiryForm

Backend contract와 연결.

### FormField

### SelectField

### TextArea

### FormError

### FormSuccess

## 8. Shared UI

### PrimaryButton

Indigo 또는 Signal CTA.

### TextLink

### Tag

### Status

### Container

### Section

### Divider

## 9. 금지 컴포넌트 패턴

- `TechnicalList` 하나로 모든 정보를 key/value table 렌더링
- 모든 섹션에 `SectionHeading`을 똑같이 반복
- `ServiceCard`
- 메타 테이블
- 범용 Hero 하나에 모든 페이지를 억지로 끼워 넣기
- CSS variant 수십 개를 가진 God Component
