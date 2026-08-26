# Implementation Plan

신규 `twentyft-studio`를 완전히 새로 만드는 기준입니다.

## Phase 0 — Clean State

- legacy template 제거 확인
- logo 8종 recovery 확인
- G7 기본 user template active
- Git clean/known state
- `20ftdocs` 프로젝트 내부에 복사 또는 읽을 수 있는 위치 확보

Exit: 기존 20ft UI source가 신규 구현에 영향을 주지 않음.

## Phase 1 — Scaffold

- G7 공식 user template 구조로 신규 scaffold
- template metadata
- routes
- layout base
- component registry
- build pipeline
- assets/brand/20ft/logo 복구

Exit: 빈 Home이 G7 runtime에서 정상 렌더링.

## Phase 2 — Design Foundation

- color tokens
- typography
- container/grid
- button/link
- header/footer
- brand logo component
- shared spacing

Exit: style foundation 일관성 확인.

## Phase 3 — Home

구현 순서:

1. Header
2. Hero
3. Selected Portfolio
4. SuperBify Preview
5. About Preview
6. Inquiry/Motto CTA
7. Footer

Exit: Home Acceptance PASS.

## Phase 4 — Portfolio

- list data source
- list page
- detail page
- seed projects
- public/private visibility
- home selected reuse

Exit: Portfolio route/detail 정상.

## Phase 5 — SuperBify

- project data source
- list
- status
- detail
- changelog
- external links
- home preview reuse

Exit: SuperBify가 실제 프로젝트 게시 허브로 사용 가능.

## Phase 6 — About

- brand story
- founder proof
- Just For Fun
- badge usage

## Phase 7 — Inquiry

- UI
- backend availability investigation
- real submit integration or explicit non-submit state
- validation
- privacy requirements

Fake backend 금지.

## Phase 8 — QA

- routes
- 375/390/768/1280/1440
- keyboard
- contrast
- network
- console
- asset
- font
- SEO
- error routes
- runtime API/source parity

## Phase 9 — Release

- source diff
- Git commit
- DB snapshot
- G7 official runtime update
- production smoke test
- release notes
