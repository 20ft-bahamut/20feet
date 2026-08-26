# SuperBify Specification

## 1. 정의

SuperBify는 20ft가 Gnuboard 7을 더 편하게 활용하기 위해 만드는:

- Extension
- Developer Tool
- Integration
- Experiment
- Open Source Project

를 관리하고 공개하는 프로젝트 허브입니다.

**단일 제품 랜딩페이지가 아닙니다.**

## 2. URL

List: `/superbify`

Detail: `/superbify/{slug}`

## 3. List Header

Eyebrow: `SUPERBIFY / 20FT`

Heading: **G7 Extensions & Developer Tools.**

Lead:

> Gnuboard 7을 사용하는 데서 끝나지 않고, 더 편하게 만들기 위한 도구를 직접 연구하고 공개합니다.

## 4. Project Types

- EXTENSION
- PLUGIN
- TOOL
- INTEGRATION
- EXPERIMENT

G7의 실제 공식 용어와 충돌하면 G7 용어를 우선합니다.

## 5. Status

- IDEA
- RESEARCH
- BUILDING
- RELEASED
- MAINTENANCE
- ARCHIVED

Released가 아닌 프로젝트에 다운로드 버튼을 만들지 않습니다.

## 6. List Item Fields

필수:

- name
- slug
- summary
- type
- target
- status
- updated_at

선택:

- version
- release_date
- github_url
- sir_url
- docs_url
- featured

## 7. Project Detail

### Overview
한 줄 정의와 현재 상태.

### Why
왜 만들었는가.

### Features
실제로 구현된 기능만.

### Requirements
- G7 version
- PHP/Node 등 요구사항
- dependency

### Installation
Released 이후에만 노출.

### Usage
실제 사용법.

### Changelog
버전별 변화.

### Links
- GitHub
- SIR 창작마당
- Documentation
- Release

존재하는 링크만 표시.

## 8. Project List UI

게시판처럼 지속 추가/관리하기 쉬워야 합니다. 그러나 전통적인 게시판 표 UI는 피합니다.

권장 정보:

```text
PROJECT NAME
짧은 설명

TYPE / EXTENSION
STATUS / BUILDING
TARGET / G7
VERSION / 0.x
UPDATED / YYYY.MM.DD
```

한 프로젝트를 하나의 compact block/row로 구성.

## 9. Home Integration

Home에서는 **공개된 실제 프로젝트만** 최대 2~3개 보여줍니다.

Home의 SuperBify 데이터는 `/superbify` 데이터 소스를 재사용합니다.

별도 하드코딩 복제 금지.

공개 프로젝트가 0개라면 Home도 동일한 Empty State 정책을 사용합니다.

## 10. 콘텐츠 정확성

- 실제로 없는 Extension 이름을 채워 넣지 않습니다.
- 다운로드 수/Star/사용자 수를 만들지 않습니다.
- 공개 전에는 `BUILDING` 등 정확한 상태를 사용합니다.
- 첫 프로젝트가 아직 확정되지 않았다면 목록 Empty State를 디자인합니다.

Empty State:

> 첫 프로젝트를 만들고 있습니다. 실제로 쓸 수 있을 때 공개합니다.

## 11. v1 Launch Policy

SuperBify는 v1 오픈 시점에 **최소 프로젝트 개수를 요구하지 않습니다.**

### 공개 프로젝트 0개

List와 Home Preview 모두 공식 Empty State를 사용합니다.

> 첫 프로젝트를 만들고 있습니다. 실제로 쓸 수 있을 때 공개합니다.

- 가짜 이름 금지
- 가짜 Version 금지
- 임의 `BUILDING` 항목 생성 금지
- 다운로드/Repository 버튼 금지

### 공개 프로젝트 1개 이상

실제 데이터만 표시합니다.

Home Preview는 최대 2~3개라는 **상한**일 뿐 최소 개수가 아닙니다.

### Seed 추가 기준

Seed는 실제 프로젝트의 다음 항목이 확인된 뒤에만 추가합니다.

- 실제 프로젝트명
- 실제 목적/요약
- 실제 Type
- 실제 Status
- 실제 Target
- 실제 Updated Date

확인되지 않은 필드는 빈 값 또는 미노출로 처리하며 AI가 추측해 채우지 않습니다.
