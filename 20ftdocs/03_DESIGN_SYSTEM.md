# Design System

## 1. 디자인 방향

### Concept

**Refined Software Studio × Digital Garage**

키워드:

- Structural
- Editorial
- Technical
- Warm
- Confident
- Precise
- Maker-minded
- Minimal, but not empty

20ft의 과거 공간 이미지를 사진으로 복원하지 않고, **구조·규격·재료의 감각만 추상화**합니다.

## 2. Color Tokens

```css
:root {
  --20ft-indigo-900: #102A4C;
  --20ft-indigo-700: #183B6B;
  --20ft-gold-500:   #B69B5F;
  --20ft-ivory-100:  #F4F0E6;
  --20ft-paper-50:   #FAF8F3;
  --20ft-charcoal:   #1A1A1A;
  --20ft-gray-700:   #5E6063;
  --20ft-gray-500:   #777A7D;
  --20ft-gray-300:   #B8B7B2;
  --20ft-line:       #D8D0BF;
  --20ft-signal:     #E7482D;
}
```

### 역할

| Token | 역할 |
|---|---|
| Deep Indigo `#102A4C` | 브랜드의 가장 강한 Surface, Hero/Footer/주요 강조 |
| 20ft Indigo `#183B6B` | 링크, 보조 Surface, 그래픽 |
| Heritage Gold `#B69B5F` | Label, fine rule, 작은 brand detail |
| Warm Ivory `#F4F0E6` | 기본 배경 |
| Paper White `#FAF8F3` | 콘텐츠 Surface |
| Charcoal `#1A1A1A` | 기본 텍스트 |
| Signal Red `#E7482D` | 프로젝트 문의 등 핵심 CTA에 제한 사용 |

### 사용 비율

- Ivory/Paper 45~60%
- Indigo 20~35%
- Charcoal/Gray 10~20%
- Gold 3~6%
- Signal Red 0~3%

## 3. Typography

### Display

**Paperlogy** — 700 / 800 / 900

### Body/UI

**SUIT Variable** — 400 / 500 / 600 / 700

### Utility

System monospace.

Utility typography는 장식이며 전체 화면을 지배하면 안 됩니다.

### Font source policy

- 실제 사용 전 URL/패키지/라이선스를 검증
- 검증되지 않은 CDN URL을 하드코딩하지 않음
- 가능하면 안정적인 self-host 또는 신뢰 가능한 공개 배포 경로 사용
- 로고 워드마크를 웹폰트로 재현하지 않음. 공식 SVG 사용

## 4. Typography Scale

| Role | Desktop |
|---|---:|
| Hero | 72~112px |
| Major Heading | 44~68px |
| Project Feature Title | 34~52px |
| Subheading | 24~32px |
| Lead | 18~22px |
| Body | 16~18px |
| UI | 14~16px |
| Utility | 10~12px |

**Hero 외 모든 섹션을 80px 이상 영문 타이포로 만들지 않습니다.**

## 5. Layout

### Container

- Max content width: 1280~1360px
- Large desktop side padding: 48~64px
- Tablet: 32~40px
- Mobile: 20~24px

Surface는 full bleed 가능하지만 내용은 container에 맞춥니다.

### Grid

- Desktop: 12 columns
- Tablet: 8 columns
- Mobile: 1-column flow 기본

### Vertical rhythm

- Hero: 72~120px top/bottom
- Major section: 96~128px
- Mobile major section: 64~88px

**일반 섹션에 `min-height:100vh` 사용 금지.**

## 6. Borders / Radius / Shadow

- Border: 1px fine rule
- Radius: 0~6px
- Shadow: 기본적으로 없음
- Separator line은 필요할 때만
- 모든 블록을 테두리 상자로 만들지 않음

## 7. Graphic Language

허용:

- 20ft official symbol
- 20 FT measurement motif
- section index
- 얇은 gold rule
- 구조적 grid line
- 작은 registration/coordinate mark
- print/editorial-like caption

금지:

- 컨테이너 직접 일러스트
- 도면 흉내 과다
- 가짜 좌표/Status를 정보처럼 과도하게 표시
- 3D
- dashboard mockup
- stock image
- cafe archive image

## 8. Logo Usage

- Header light: `full.svg` 또는 `compact.svg`
- Dark surface: `full-white.svg` / `compact-white.svg`
- Symbol: `symbol.svg` / `symbol-white.svg`
- Heritage badge: `badge-light.svg` / `badge-dark.svg`

Badge는 About 등에서 **한 번 정도**만 사용합니다.

금지:

- 로고 recolor
- 임의 stroke
- blur/shadow
- aspect ratio 변경
- 지나치게 큰 watermark 반복
- 한 화면에 로고 여러 종류 동시 노출

## 9. Motion

- transition 120~240ms
- hover line shift / text shift / subtle opacity
- prefers-reduced-motion 지원
- Scroll hijacking 금지
- reveal animation 필수 아님

## 10. UI Tone

20ft 사이트는 **브랜드 포스터가 아니라 실제 회사 사이트**입니다.

비주얼 우선순위:

1. 정보
2. 신뢰
3. 브랜드
4. 장식
