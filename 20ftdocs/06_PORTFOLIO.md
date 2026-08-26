# Portfolio Specification

## 1. 역할

Portfolio는 20ft 사이트에서 **서비스 소개보다 중요한 핵심 영업 페이지**입니다.

“무슨 일을 해주는 회사인지”를 설명하기보다 실제 작업을 보여줍니다.

## 2. List URL

`/portfolio`

## 3. Detail URL

`/portfolio/{slug}`

## 4. List Header

Eyebrow: `PORTFOLIO`

Heading: **우리가 만든 것들.**

Lead:

> 외주, 자체 프로젝트, 제품과 오픈소스까지.  
> 20ft가 실제로 설계하고 개발한 작업을 정리합니다.

## 5. Category

- WEB
- COMMERCE
- SOFTWARE
- OPEN SOURCE

분류는 Portfolio 탐색을 위한 것이지 Services 메뉴가 아닙니다.

프로젝트가 적은 초기에는 Filter UI 자체를 숨겨도 됩니다.

## 6. Status

- BUILDING
- OPERATING
- RELEASED
- RESEARCH
- ARCHIVED

클라이언트 업무는 상태가 사용자에게 의미 없으면 숨깁니다.

## 7. List Item

필수:

- cover_image
- title
- slug
- summary
- categories
- year

선택:

- status
- featured
- client_label
- external_url

### 디자인

관리자 table 금지.

Cover와 제목이 먼저 보여야 합니다. Metadata는 보조 정보입니다.

## 8. Detail Structure

### 01 Overview

프로젝트 한 줄 정의.

Metadata:

- Category
- Year
- Status
- Role

### 02 Context

왜 이 프로젝트가 필요했는지.

### 03 What We Did

20ft가 실제로 담당한 범위.

예:

- Planning
- Information Architecture
- UI Design
- Frontend
- Backend
- Integration
- Operation Design

실제로 하지 않은 역할은 쓰지 않습니다.

### 04 System / Approach

단순 기술 스택 나열보다 어떻게 구조를 잡았는지 설명.

### 05 Key Screens

실제 공개 가능한 화면.

### 06 Result / Current State

정량 수치가 없으면 억지 성과 숫자를 만들지 않습니다.

### 07 Stack

실제로 사용한 기술만.

### 08 Related Links

공개 가능한 링크만.

## 9. Seed Content Policy

초기 Portfolio가 적어도 문제 없습니다.

**3개의 진짜 프로젝트가 12개의 가짜 프로젝트보다 낫습니다.**

공개 여부가 불확실한 프로젝트는 데이터에 `visibility: private`로 두고 렌더링하지 않습니다.

### 공개 상태 기본 정책

- 프로젝트의 공개 여부, Status, Summary, Screenshot, Client 정보 중 하나라도 확정되지 않았다면 기본값은 `private`입니다.
- 구현 AI가 “아마 공개 가능할 것”이라고 판단해 public으로 바꾸면 안 됩니다.
- 사용자 또는 프로젝트 소유자가 공개 범위를 명시적으로 승인한 뒤에만 `public`로 전환합니다.
- 초기 Portfolio는 1~2개만 공개되어도 정상 상태입니다. 최소 개수를 맞추기 위한 가짜/미확정 프로젝트 노출을 금지합니다.

## 10. 20ft Website Seed

Title: 20ft Website

Summary:

> 20ft의 새로운 Software Studio 브랜드와 웹사이트를 G7 User Template 기반으로 구축하는 자체 프로젝트.

Category: WEB / BRAND / GNUBOARD 7

Year: 2026

Role: Planning / IA / Brand System / Frontend / G7 Template

Status: BUILDING → 실제 오픈 후 OPERATING

## 11. PurePol Publication Policy

PurePol은 초기 Portfolio 후보이지만 **기본 비공개**입니다.

```text
visibility: private
```

다음 항목은 사용자가 공개 범위를 확정하기 전까지 public 콘텐츠를 생성하지 않습니다.

- Status
- 고객/회사 정보
- 사업 세부 정보
- Screenshot
- 수치/성과
- 외부 링크
- 상세 설명

20ftdocs가 PurePol을 언급한다는 이유만으로 공개 승인이 이루어진 것으로 해석하지 않습니다.

## 12. SuperBify Cross-link

SuperBify 자체는 Portfolio에도 하나의 프로젝트로 보여줄 수 있습니다.

하지만 상세 설명은 `/superbify`가 SSoT입니다.
