# SuperBify Commerce Minimal — Still Form

Gnuboard 7 기반의 미니멀 브랜드형 쇼핑몰(User Template)입니다.
홈 & 라이프스타일 브랜드에 가장 잘 맞으며, 화장품 / 의류 / 잡화 등
소형 브랜드 자사몰에도 응용할 수 있는 범용 D2C 스토어프론트 템플릿입니다.

데모 스토어(Still Form)는 템플릿 출하용 시안 데이터입니다.
`config/business-info.json`과 `src/components/fixtures/`를 교체하면
자신의 스토어에 맞게 그대로 운영에 사용할 수 있습니다.

---

## 요구사항

| 항목 | 요구 버전 |
|---|---|
| Gnuboard 7 | >= 7.0.0 |
| PHP | 8.2+ |
| 필수 모듈 | **sirsoft-ecommerce >= 1.1.0** (설치 + 활성화 필요) |
| 플러그인 | sirsoft-daum_postcode >= 1.0.0 (우편번호 검색) |

> 템플릿 식별자는 `superbify-commerce_minimal`입니다.
> G7 템플릿 디렉터리 명명 규칙(`^[a-z0-9]+-[a-z0-9_]+$`)상 하이픈은
> vendor 구분자 1개만 허용되므로, 템플릿 부분에는 언더스코어를 사용합니다.

## 포함 페이지

| 경로 | 내용 |
|---|---|
| `/` | 홈 (Hero / 카테고리 / 신상품 / 인기상품 / 브랜드 스토리 / 에디토리얼 / Shop CTA) |
| `/shop` (`/shop/products`) | 상품 목록 (카테고리 필터 칩) |
| `/shop/category/:slug` | 카테고리별 상품 목록 |
| `/shop/products/:slug` | 상품 상세 (갤러리 / 구매 CTA / 리뷰 / Q&A / 관련상품 / 브랜드 블록) |
| `/shop/cart` | 장바구니 (수량 변경 / 삭제 / 크로스셀 / 주문 요약) |
| `/shop/checkout` | 주문서 (주문자 / 배송지 / 결제수단 / 쿠폰·마일리지 / 게스트 비밀번호) |
| `/shop/orders/:order_number/complete` | 주문 완료 (입금 안내 / 주문 확인) |
| `/shop/guest/orders` | 비회원 주문 조회 |
| `/shop/guest/orders/:order_number` | 비회원 주문 상세 |
| `/shop/notice` | 공지 목록 (페이징) |
| `/shop/notice/:id` | 공지 상세 |
| `/shop/story` | 브랜드 스토리 |
| `/shop/terms` `/shop/privacy` `/shop/shipping-policy` | 약관 / 개인정보처리방침 / 배송·교환·반품 안내 |
| `/login` `/register` `/forgot-password` `/reset-password` | 인증 (BASIC 포크 액션 체인, 약관·개인정보 모달) |
| `/mypage` | 마이페이지 — 주문 내역(+상세/취소/재주문), 배송지 관리, 프로필/수정, 비밀번호 변경, 찜, 쿠폰, 마일리지, 상품 문의 |
| `/404` `/403` `/500` | 에러 페이지 |

데이터는 기존 Gnuboard 7 모듈 API 그대로를 사용합니다 —
`sirsoft-ecommerce`(상품/카트/주문/설정)와 `sirsoft-board`(공지).

## 설치 방법

### 1. 관리자 → 템플릿 관리 → 수동 설치 → GitHub

```text
https://github.com/20ft-bahamut/20feet-stillform-template.git
```

설치 완료 후 **SuperBify Commerce Minimal** 템플릿을 활성화합니다.
활성화하면 기존 사용자용 템플릿(예: twentyft-studio)은 비활성 상태로 전환되며,
`php artisan template:activate {기존식별자}`로 언제든 복귀할 수 있습니다.

### 2. ZIP 패키지 설치 (Release)

GitHub Release에서 ZIP을 받아
**관리자 → 템플릿 관리 → 수동 설치 → 파일 업로드**로 설치합니다.
ZIP은 `20feet-stillform-template-<버전>/` wrapper 디렉터리를 가지며,
그 안에 `template.json`이 있습니다:

```text
20feet-stillform-template-<버전>/
├── template.json
├── routes.json
├── components.json
├── layouts/
├── lang/
├── src/
├── dist/           # prebuilt assets — 설치 서버에 npm 불필요
├── seed/           # 데모 시드 (선택)
├── config/
├── README.md
└── ...
```

> CLI로 설치할 때는 ZIP을 해제한 뒤 `template.json`이 있는 디렉터리를 지정합니다.

### 3. Bundled Source 설치 (CLI)

ZIP 해제물을 G7 호스트의 `templates/_bundled/superbify-commerce_minimal`에
배치한 뒤:

```bash
php artisan template:install superbify-commerce_minimal
php artisan template:activate superbify-commerce_minimal
```

설치 후 공개 페이지가 로드되지 않으면 **관리자 → 환경설정 → 캐시 모두 삭제**
(또는 `php artisan template:cache-clear`)를 실행합니다.

## 업데이트 (Bundled source)

```bash
php artisan template:update superbify-commerce_minimal --source=bundled --force
php artisan template:refresh-layout superbify-commerce_minimal
php artisan template:cache-clear
```

## 운영 전 설정

### 1. 데모 시드 (선택 — 화면을 바로 확인하려면)

`seed/` 디렉터리에 데모 상품 8개 + 카테고리 7개 + 공지 게시판 및 게시물 14개가
포함되어 있습니다. 임포트 방법은 [seed/README.md](seed/README.md)를 참고하세요.

> 시드 데이터는 데모용입니다. 운영으로 전환할 때 상품·공지는 관리자 화면에서
> 교체하세요.

### 2. 상품 / 카테고리 / 공지 데이터

- **관리자 → 이커머스 → 상품 관리**: 카테고리와 상품, 대표 이미지 업로드
  (상품 이미지는 DB에서 직접 서빙됩니다 — `/product-image/{hash}`)
- **관리자 → 게시판**: `store-notice` 슬러그 게시판을 만들고 공지 게시
  (비회원 열람 권한 자동 부여 — 시드를 임포트한 경우 이미 생성됨)

### 3. 사업자 정보 / 약관 (단일 편집 지점)

```text
config/business-info.json
```

이 파일 하나에 사업자 정보(상호·대표자·사업자등록번호·통신판매업신고번호·
주소·고객센터·호스팅 제공자·사업자정보확인 URL)와
이용약관 / 개인정보처리방침 / 배송·교환·반품 안내 본문이 담겨 있습니다.
수정 후 다시 빌드·배포하면 푸터와 정책 페이지 전체에 반영됩니다.

> 번호류는 반드시 **문자열**로 기입하세요(앞자리 0, 하이픈 보존).
> 값이 비어 있으면 해당 항목은 푸터에 출력되지 않습니다.
>
> 본 템플릿의 약관·개인정보처리방침 본문은 **시안 문구**입니다.
> 실제 운영 전 사업자 상황에 맞는 약관 작성과 법적 검토가 필요합니다.

## 개발 / 재빌드

일반 설치 서버에는 Node.js가 필요하지 않습니다(Release에 prebuilt dist 포함).
소스를 수정하려면:

```bash
npm install
npm run type-check
npm run test:run
npm run build
```

```bash
php artisan template:build superbify-commerce_minimal --production
php artisan template:update superbify-commerce_minimal --source=bundled --force
php artisan template:refresh-layout superbify-commerce_minimal
php artisan template:cache-clear
```

## 테스트 및 검증 (v0.4.0)

- TypeScript type-check clean (테스트 파일 경고 5건 제외 — 카피·기능 무관)
- Vitest **228 passed** (컴포넌트 / 레이아웃 / checkout·product parity /
  외부 URL 배제 / fixture 가드 / 사업자정보 스냅샷 가드)
- Template install/activate/update lifecycle
- 전 페이지 Chromium 스크린샷 검증 (1440 / 768 / 430 / 390 / 360, 가로 오버플로 0)
- 모바일 반응형 + 로딩 스켈레톤 검증 (360–1440, 기능 클릭 QA)
- 풀 구매 플로우 headless 검증 (담기 → 수량 → 삭제 → 체크아웃 → 주문 생성 201 →
  비회원 조회 → 주문 완료)

## 기술 스택

- Gnuboard 7 Template Engine (JSON Layout + React 19 + TypeScript + Vite)
- 기존 모듈 연동: `sirsoft-ecommerce`, `sirsoft-board` (코어 수정 없음)
- Vitest, Playwright headless (개발 환경 QA)

## 라이선스

MIT License — [LICENSE](LICENSE)