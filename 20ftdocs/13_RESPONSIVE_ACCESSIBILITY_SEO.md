# Responsive / Accessibility / SEO

## 1. Breakpoint 검증 기준

필수:

- 375px
- 390px
- 768px
- 1280px
- 1440px

추가 가능:

- 1920px

## 2. Responsive 원칙

- Desktop 축소판을 Mobile에 그대로 넣지 않음
- Hero headline line break를 모바일에 맞게 별도 제어 가능
- Portfolio는 mobile 1-column
- SuperBify row는 metadata wrap
- Header는 compact logo + drawer
- 최소 touch target 44px 권장
- horizontal scroll 0

## 3. Accessibility

필수:

- semantic heading order
- nav landmark
- main landmark
- footer
- visible keyboard focus
- button/link 역할 구분
- image alt
- decorative SVG appropriate handling
- form label 연결
- field errors 연계
- sufficient color contrast
- reduced motion

색만으로 status를 구분하지 않습니다.

## 4. SEO

### Home

Title: `20ft — Software Studio`

Description:

`20ft는 웹사이트, 쇼핑몰, Gnuboard 7 개발과 커스텀 소프트웨어를 만드는 독립 소프트웨어 스튜디오입니다.`

### Portfolio

`Portfolio — 20ft`

### SuperBify

`SuperBify — 20ft`

### About

`About — 20ft`

### Inquiry

`Project Inquiry — 20ft`

### Detail

`{Project Title} — Portfolio — 20ft`

`{Project Name} — SuperBify — 20ft`

## 5. Open Graph

필요:

- default OG
- portfolio detail OG 가능
- superbify detail OG 가능

초기 default OG는 공식 logo + Indigo/Ivory 기반으로 제작.

가짜 screenshot 사용 금지.

## 6. Structured Content

사업자/주소/연락처 등 실제 정보가 확정되지 않은 항목을 지어내지 않습니다.

## 7. Performance

- SVG logo
- image WebP/AVIF where appropriate
- responsive image
- font weight 최소화
- preload 남용 금지
- layout shift 방지
- JS animation 최소화
