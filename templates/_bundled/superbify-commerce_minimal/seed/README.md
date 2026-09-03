# Demo Seed — Still Form (데모 상품 + 공지)

템플릿 설치 후 초기 화면이 "있어 보이도록" 하는 데모 시드입니다.
상품 8개 (Still Form 데모 브랜드, 대표 이미지 포함) + 카테고리 7개 +
`store-notice` 공지 게시판 + 공지 게시물 14개.

> **선택 사항입니다.** 시드를 넣지 않으면 Empty State가 렌더링됩니다.
> 시드의 상품·공지·사업자 정보는 템플릿 출하용 데모 데이터입니다.

## 임포트

### 1. DB 시드

**권장 — 임포트 스크립트 (DB_PREFIX 자동 적용):**

`demo-seed.sql`은 논리 테이블명(`ecommerce_*`, `boards`, `board_posts`)을 사용합니다.
실제 테이블명에는 G7의 테이블 접두어가 붙습니다(기본값 `g7_`, `.env`의 `DB_PREFIX`).
접두어 없이 raw SQL로 임포트하면
`ERROR 1146: Table '<db>.ecommerce_categories' doesn't exist` 가 납니다.

스크립트가 앱 루트의 `.env`에서 `DB_PREFIX`와 DB 접속 정보를 읽어
SQL 테이블명을 자동 치환한 뒤 임포트합니다. (비밀번호는 출력되지 않습니다.)

```bash
cd <laravel-app-root>
bash templates/superbify-commerce_minimal/seed/import-seed.sh
```

옵션:

```bash
--dry-run            # 임포트 없이 치환된 SQL 출력
--prefix g7_         # 접두어 직접 지정 (미지정: .env의 DB_PREFIX, 그것도 없으면 g7_)
--prefix ''          # 접두어 없는 사이트 — 명시적으로 빈 값
--db <name>          # DB 이름 (overrides DB_WRITE_DATABASE / DB_DATABASE)
--user <u>           # DB 사용자 (overrides DB_WRITE_USERNAME / DB_USERNAME)
--password <p>       # DB 비밀번호 (미지정 시 프롬프트)
--host <h> / --port <n>  # DB 접속 주소 (기본 127.0.0.1:3306)
--env /path/to/.env  # .env 자동 탐지 실패 시 직접 지정
--force              # 테이블 존재 여부 사전 체크 건너뜀
--sql <file>         # 다른 시드 파일 지정
```

`.env` 자동 탐지가 안 되는 환경(배포 경로가 다른 경우 등)은 플래그만으로
동작합니다:

```bash
bash templates/superbify-commerce_minimal/seed/import-seed.sh \
    --db <db_name> --user <db_user>          # 비밀번호는 프롬프트에서 입력
```

테이블이 존재하지 않으면 에러 안내와 함께 중단합니다 —
이 경우 먼저 `php artisan template:install superbify-commerce_minimal` 을
실행하세요.

**수동 임포트 (스크립트를 못 쓰는 경우):**

접두어를 붙여 테이블명을 치환한 뒤 임포트합니다.

```bash
sed -e 's/`ecommerce_/`g7_ecommerce_/g' \
    -e 's/`board_posts`/`g7_board_posts`/g' \
    -e 's/`boards`/`g7_boards`/g' \
    seed/demo-seed.sql | mysql -u <user> -p <db_name>
```

(`DB_PREFIX`가 비어 있는 사이트는 치환 없이 원본 그대로 임포트합니다.)

공통:

- `INSERT IGNORE` 방식이라 기존 데이터와 id가 겹치는 행은 건너뜁니다.
- 설치 직후(신규 DB)라면 그대로 들어갑니다.
- 관리자 계정이 생긴 뒤(import 전) 실행을 권장합니다 — 상품 생성자/게시물
  작성자가 첫 관리자(id 1)로 지정됩니다.
  (공지 게시물의 `user_id`는 시드에서 1로 고정됩니다.)

### 2. 상품 이미지 복사

```bash
cp -r seed/images/products <storage_path>/modules/sirsoft-ecommerce/images/
```

- `<storage_path>`는 기본값 `storage/app`입니다. (Laravel storage disk `modules`)
- 경로 규칙: `products/{product_code}/{stored_filename}.jpg`
  — `eco…_product_images` 테이블의 `path` 컬럼과 일치합니다.

### 3. 캐시 정리

```bash
php artisan template:cache-clear
php artisan cache:clear
```

## 포함 데이터

| 테이블 (논리명) | 건수 | 내용 |
|---|---|---|
| `ecommerce_categories` | 7 | 컵/조명/트레이/패브릭/향/소형가구/데스크 |
| `ecommerce_products` | 8 | Still Form 데모 SKU (머그컵, 글라스 컵, 테이블 램프, 우드 트레이, 쿠션 커버, 리드 디퓨저, 펜 스탠드, 북 스탠드) |
| `ecommerce_product_options` | 8 | 기본 옵션 (cart/checkout 필수) |
| `ecommerce_product_images` | 8 | 대표 이미지 1장/상품 |
| `boards` + `board_posts` | 1 + 14 | `store-notice` 공지 게시판 + 데모 공지 |

> 실제 테이블명에는 `.env`의 `DB_PREFIX`(기본값 `g7_`)가 붙습니다.
> 예: `g7_ecommerce_products`. 위 표는 논리명 기준.

이미지 파일: `seed/images/products/{product_code}/*.jpg` →
`storage/app/modules/sirsoft-ecommerce/images/products/{product_code}/*.jpg`
(테이블의 `hash`/`stored_filename`/`path`와 짝을 이룹니다.)

## 운영 전 교체

시드 데이터는 데모용입니다. 상품·카테고리·공지는 관리자 화면에서
수정/삭제하고, 사업자 정보는 템플릿 `config/business-info.json`에서
교체하세요.