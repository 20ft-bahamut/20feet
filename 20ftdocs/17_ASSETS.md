# 20ft Official Assets

이 디렉토리는 신규 `twentyft-studio` 템플릿 구축 시 사용하는 **공식 20ft 브랜드 에셋**입니다.

## Asset Tree

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
            ├── symbol-white.svg
            └── checksums.sha256
```

## Usage

### Light Surface
- `full.svg`
- `compact.svg`
- `symbol.svg`
- `badge-light.svg`

### Dark / Indigo Surface
- `full-white.svg`
- `compact-white.svg`
- `symbol-white.svg`
- `badge-dark.svg`

## Roles

- `full*`: 공식 가로형 로고. Header, Footer, 주요 브랜드 표기.
- `compact*`: 축약형. 좁은 Header, Mobile, 작은 배치.
- `symbol*`: 20ft 공간/프레임 심볼. Favicon, UI mark, 제한적인 graphic element.
- `badge-*`: Heritage / Digital Garage seal. About/Brand Story 보조 요소.

## Non-negotiable Rules

- SVG path 임의 수정 금지
- 비율 변경 금지
- 임의 recolor 금지
- stroke/shadow/glow/blur 추가 금지
- 워드마크를 웹폰트 텍스트로 재작성 금지
- 한 화면에서 여러 로고 variant를 장식처럼 반복 금지

## G7 Implementation

신규 G7 User Template에서는 이 에셋을 다음 구조로 옮겨 사용합니다.

```text
templates/<new-template>/assets/brand/20ft/logo/
```

실제 publicDir / asset endpoint 규칙은 G7 공식 Template 구조를 우선합니다.

원본 SVG 자체는 변경하지 않습니다.

## Integrity

`checksums.sha256`은 패키지에 포함된 SVG 8종의 SHA-256입니다.
구현 AI는 템플릿으로 복사한 뒤 원본과 checksum을 비교할 수 있습니다.
