# 20ftdocs v1.2 FINAL — Release Notes

이 버전은 외부 AI 검수 결과 중 **Major로 수용하기로 한 항목만** 반영한 최종 구현 하네스입니다.

## 반영한 항목

### 1. Services 제거로 인한 수행범위 가시성 보완

Services 페이지는 만들지 않는 기존 결정을 유지합니다.

대신 Home Hero와 Footer에 아래 capability line을 필수로 노출합니다.

`WEB / COMMERCE / SOFTWARE / GNUBOARD 7`

### 2. SuperBify 초기 데이터 정책 확정

공개 프로젝트가 0개여도 정상적인 v1 상태로 인정합니다.

가짜 Seed를 만들지 않고 공식 Empty State를 사용합니다.

> 첫 프로젝트를 만들고 있습니다. 실제로 쓸 수 있을 때 공개합니다.

Home Preview도 동일한 source와 정책을 사용합니다.

### 3. Portfolio 공개 미확정 항목 정책 확정

PurePol 등 공개 범위가 확정되지 않은 프로젝트는 기본 `private`입니다.

사용자/프로젝트 소유자의 명시적 공개 범위 확인 전에는 Status, Screenshot, 사업정보 등을 AI가 임의 작성하거나 공개하지 않습니다.

Portfolio 최소 프로젝트 개수는 강제하지 않습니다.

### 4. 최종 디자인 품질 독립 검수

구현 AI는 자신의 결과물을 스스로 최종 PASS할 수 없습니다.

구현 직후 상태:

`IMPLEMENTATION COMPLETE / REVIEW PENDING`

사용자 또는 별도의 독립 리뷰어가 실제 브라우저 결과를 검수한 후에만:

`FINAL REVIEW / PASS`

로 전환할 수 있습니다.

---

## 이번 버전에서 의도적으로 수정하지 않은 외부 검수 항목

사용자 결정에 따라 이번 FINAL에서는 아래 항목을 변경하지 않았습니다.

- CSS 브랜드 컬러와 SVG 실측 컬러 차이
- badge-light / badge-dark geometry 차이
- 개인정보 동의 UI/Data Model
- G7 rollback 상세 절차
- 예산 필드 공개 여부
- Error page 상세 카피
- Favicon 세부 규격
- Analytics / Search Console

위 항목은 구현 과정에서 사실 확인 또는 별도 사용자 결정이 필요한 경우 기존 문서 원칙에 따라 처리합니다.
