# Changelog

All notable changes to the **SuperBify Commerce Minimal** (Still Form) template
are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/);
versioning follows [SemVer](https://semver.org/).

## [0.4.8] - 2026-09-03

### Fixed
- 데모 시드에 상품↔카테고리 피벗(`ecommerce_product_categories`) 8행 누락 —
  카테고리별 상품 수가 전부 0으로 표시되고 카테고리 페이지가 비어 보이던 문제.
  시드 재실행(INSERT IGNORE)만으로 보완됨.
- 카테고리 페이지 카운트 문구의 번역 토큰 문법 오류 —
  `$t:key:{{expr}}` (콜론) 를 `$t:key|count={{expr}}` (파이프, 공식 문법)로 수정.
  `{{count}}`가 리터럴로 노출되던 문제. 약관/개인정보 모달의 시행일 토큰도 동일 수정
  (미지원 `| date` 필터 제거, lang 라벨에 `{{value}}` 플레이스홀더 추가).

## [0.4.7] - 2026-09-03

### Fixed
- 푸터 사업자 정보가 관리자 설정이 아닌 데모 시드로 표시되던 문제 —
  템플릿 `dependencies.plugins`에 `superbify-commerce-compat >=1.0.0` 누락.
  StoreFooter는 `/api/plugins/superbify-commerce-compat/shop-info`로 관리자
  기본정보를 라이브 오버레이하는 구조인데, 플러그인이 설치되지 않은 서버에서
  404 → 정적 데모 값 폴백. 의존성 선언으로 설치/활성화 게이트에 노출.

## [0.4.6] - 2026-09-03

### Changed
- 사업자 정보 데모 주소를 도로명 수준으로 축소 (상세 주소 제거) —
  이력 전체 커밋/태그에서도 동일 문자열로 치환하여 제거.

## [0.4.5] - 2026-09-03

### Fixed
- 템플릿 자산 이미지(hero/brand/editorial)가 nginx 정적 최적화 블록
  (`location ~* \.(jpg|png|css|js)$`)이 있는 서버에서 404가 되던 문제.
  레이아웃 JSON과 `demoAssets.ts`의 자산 URL을 path 세그먼트 형태에서
  G7 쿼리 형태로 전환 — `/api/templates/assets/{id}?file=images/...`.
  쿼리스트링은 nginx location 정규식 매칭 대상이 아니므로 어느 서버에서도 동작
  (G7 `DualExtensionRoute` 이중 등록 규격).

## [0.4.4] - 2026-09-03

### Added
- `seed/import-seed.sh`에 DB 접속 플래그 — `--db`/`--user`/`--password`/`--host`/`--port`.
  `.env` 값이 틀렸거나 탐지가 안 되는 환경에서 플래그만으로 임포트 가능
  (비밀번호 미지정 시 프롬프트). `--prefix`도 플래그로 지정, 미지정 시
  `.env`의 `DB_PREFIX`, 그것도 없으면 G7 기본값 `g7_`. `--prefix ''`로
  접두어 없는 사이트 명시 지원.

## [0.4.3] - 2026-09-03

### Fixed
- `seed/import-seed.sh` 사전 체크가 DB 접속/존재 실패(Access denied, Unknown database 등)를
  "테이블 없음"으로 잘못 보고하던 문제 — mysql 종료 코드/stderr를 구분해
  `.env`의 `DB_WRITE_*`(특히 `DB_WRITE_DATABASE`) 점검 안내를 표시.
  참고: DB명은 테이블 prefix(`g7_`)와 별개 (로컬 개발 예: DB `20feet`, prefix `g7_`).

## [0.4.2] - 2026-09-03

### Fixed
- `seed/import-seed.sh`가 G7 환경에서 `ERROR: DB_USERNAME / DB_DATABASE not found`로
  중단되던 문제 — G7 mysql 커넥션은 `DB_WRITE_*` 계열 환경변수를 사용
  (`config/database.php`). 이제 `DB_WRITE_*` 우선, 표준 Laravel 이름(`DB_*`) fallback.

## [0.4.1] - 2026-09-03

### Added
- 데모 시드 임포트 스크립트 `seed/import-seed.sh` — 앱 `.env`의 `DB_PREFIX`(G7 기본값 `g7_`)를
  읽어 `demo-seed.sql` 테이블명을 치환 후 임포트. 테이블 미존재 시 사전 체크로
  `ERROR 1146` 방지, `--dry-run`/`--prefix`/`--env`/`--force` 옵션
- seed README에 prefix 설명 + 수동 sed 임포트 fallback 문서화

## [0.4.0] - 2026-09-02

### Added
- Mobile(≤767px) 반응형 재구성 — Desktop(≥768) 무변경
  - Header: hamburger 메뉴(nav+auth full-width 패널, 링크 클릭 시 close)
  - Product detail: hero/description/info/shipping 1-column, 이미지 full-width(90%),
    쿠폰/수량/예상금액/CTA full width(50px touch), 한국어 keep-all
  - Story/brand block: single column(text first, image 4/3)
  - Footer: brand → nav 2-col → business info(label:value) → legal 순서, gutter 20px 통일
  - PageLoading + transition_overlay(19개 layout), ProductGallery/PurchasePanel 로딩 skeleton

### Fixed
- 로딩 중 빈 empty-state 플래시 제거(0.3.1/0.3.2 후속)
- 햄버거 tap focus ring 제거(focus-visible만 유지)

## [0.3.2] - 2026-09-02

### Fixed
- 상품 상세 페이지 로딩 시 플레이스홀더 이미지/빈 제목/0원이 플래시되던 문제
  - ProductGallery/PurchasePanel loading prop + skeleton
  - 요약 컬럼 노드(제목/가격/분류·상태 rows/상세설명/쿠폰/위시리스트)에 로딩 게이트

## [0.3.1] - 2026-09-02

### Fixed
- 모든 데이터 페이지에서 fetch 완료 전 빈 empty-state('등록된 상품이 없습니다' 등)가
  플래시되던 문제 — 로딩 중 skeleton 표시로 교체
  - ProductGrid/NoticeList: 데이터 미로딩(undefined) 시 skeleton
  - CategoryNav: pill skeleton 신규, CategoryPreviewStrip: 로딩 중 미표시
  - mypage 6개 목록 partial empty 조건에 로딩 완료 게이트
  - layout items 바인딩 trailing `?? []` 폴백 제거(undefined 통과)
- PageLoading 컴포넌트 신설 + 19개 layout transition_overlay(spinner, wait_for) —
  전환/refetch 시 로딩 표시(G7 공식 패턴)

## [0.3.0] - 2026-09-02

### Changed
- 전체 카피 리미디에이션: 1,341건 사용자 노출 카피 전수 조사 후 77건 flag 정리
- 브랜드 카피 확정(verbatim): Hero sub, Brand Story(heading/body/CTA 'Still Form의 기준'),
  Editorial(heading/body/CTA '상품 둘러보기'), Final CTA, Story H1('오래 곁에 둘 물건을 고릅니다.')
- Functional English 제거: Checkout 버튼, SHOPPING BAG, YOU MAY ALSO LIKE, Cart H1,
  헤더/푸터 nav(Shop/스토리/공지사항/장바구니 — lang nav.* 연결, 신규 label props)
- 용어 통일: 소계/상품금액 → 상품 금액, 적립금 → 마일리지(G7 공식), 주문내역 띄어쓰기,
  할인코드 → 할인 코드, 휴대폰 번호/현금영수증 카드
- 비회원 문구 '가입하신/가입 시' 제거, confirm 다이얼로그 의문형, 시스템 어투 에러 문구 교체
- 한국어 타이포그래피: word-break keep-all(단어 중간 강제 개행 제거), body max-width 36em,
  pre-line paragraph rhythm

### Added
- BrandStorySection headingAs prop (Story 페이지 H1 시맨틱)
- CheckoutForm depositDueSuffixLabel prop (lang 연결 — en locale 한국어 누출 제거)
- StoreHeader/StoreFooter nav label props (shopLabel/storyLabel/noticeLabel/cartLabel)
- 약관/개인정보처리방침 모달 partial (auth register)

### Fixed
- home Final CTA href 소실 — node-level href 표현식 미평가(props.href로 이동)
- admin/데모 문구가 고객 empty state에 노출되던 문제(shop/notice empty_message 제거)
- dead key 정리: home.promo(책 비유 카피), auth.already_member, login_form.no_account
- ko/en 100% pair (deposit_due en 누락 추가)

## [0.2.0] - 2026-08-31

### Added
- Auth pages: 로그인 / 회원가입 / 비밀번호 찾기 / 비밀번호 재설정 (+ errors/401) — BASIC auth 포크, X-Cart-Key 병합 체인 유지
- Header auth state: 로그인 사용자 이름 / 마이페이지 / 로그아웃 (엔진 액션 시퀀스 logout → cart_count refetch → navigate)
- 마이페이지 8 tabs (총 10 레이아웃): 주문내역 목록+상세(+취소/재주문), 배송지 관리 CRUD(다음 우편번호), 회원정보/수정, 비밀번호 변경, 찜, 쿠폰, 마일리지, 문의
- Checkout 다음 우편번호 extension_point (`address_search_slot`) — `_global.checkoutAddress` → CheckoutForm G7Core.state 구독 브리지
- 비회원 → 회원 장바구니 병합: 로그인 요청에 X-Cart-Key globalHeaders(/api/auth/*) 첨부, 로그인 성공 후 cart_count refetch
- 회원 결제: 주문자 이름/전화/이메일 currentUser 프리필, 비회원 비밀번호 블록 미렌더

### Changed
- dependencies.plugins sirsoft-daum_postcode >=1.0.0
- _user_base: /api/auth/* auth globalHeaders + current_user 데이터소스(401 suppress, initGlobal currentUser)

### Fixed
- 회원(로그인 상태) 결제 시 비회원 비밀번호 블록 숨김
- 컴포지트 raw fetch 에 Authorization bearer 미첨부로 임시주문이 게스트로 생성되던 문제 (CheckoutPage fetchJson)
- 헤더 로그아웃 dispatcher 미호출 수정(dispatchAction 호환) + 모바일 390px 헤더 브랜드/내비 겹침 수정

## [0.1.0] - 2026-09-01

First public release.

### Added
- Home: hero, category chip rail, new arrivals, best sellers (featured-first),
  brand story with emblem stamp, editorial banner, final shop CTA
- Shop: category chip navigation, DB-driven product cards
- Product detail: gallery (DB images, up to 3), purchase CTA (add-to-cart 201,
  buy-now), related products, shipping/returns info
- Cart: item qty update / delete, cross-sell strip, order summary
- Checkout: orderer / shipping / payment (dbank from settings), guest lookup,
  order placement (`POST /user/orders`), guest order retrieval, order complete
  page with deposit guide
- Notice: board-driven list with pagination + detail page (sirsoft-board,
  DOMPurify content rendering)
- Policy pages: 이용약관 / 개인정보처리방침 / 배송·교환·반품 안내 driven by a
  single `config/business-info.json` edit point; conditional footer business
  info with demo-store notice
- Brand assets: Still Form wordmark header lockup + emblem stamp
- i18n: ko / en
- Prebuilt dist (no npm on install servers)
