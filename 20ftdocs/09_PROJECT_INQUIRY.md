# Project Inquiry Specification

## 1. URL

`/inquiry`

## 2. Navigation Label

**프로젝트 문의**

## 3. 목적

고객이 완성된 요구사항 문서를 가지고 있지 않아도 문의할 수 있어야 합니다.

문의 유형은 내부 분류용이며 Services 상품처럼 보이면 안 됩니다.

## 4. Hero

Eyebrow: `PROJECT INQUIRY`

Heading: **만들고 싶은 것을 이야기해주세요.**

Lead:

> 요구사항이 완전히 정리되어 있지 않아도 괜찮습니다.  
> 현재 상황과 만들고 싶은 결과를 알려주시면 필요한 범위를 함께 정리합니다.

## 5. Form Fields

### project_type

Label: `프로젝트 유형`

선택:

- 홈페이지
- 쇼핑몰 / 커머스
- 웹서비스 / SaaS
- Gnuboard 7
- 기존 시스템 개선
- 내부 업무 시스템
- 기타

Required.

### company_name

Label: `회사 / 브랜드명`

Optional.

### name

Label: `담당자명`

Required.

### email

Required.

### phone

초기 권장: Optional.

### current_url

Label: `현재 사이트 URL`

Optional.

### budget_range

Label: `예산 범위`

초기 권장 선택지:

- 아직 정하지 않음
- 300만원 미만
- 300~500만원
- 500~1,000만원
- 1,000~3,000만원
- 3,000만원 이상
- 협의 필요

실제 영업 정책에 따라 공개 전 검토 가능.

### desired_schedule

Label: `희망 일정`

Optional.

### description

Label: `프로젝트 설명`

Helper:

> 현재 문제, 만들고 싶은 기능, 참고하고 있는 사이트 등을 자유롭게 적어주세요.

Required.

### reference_url

Label: `참고 URL`

Optional.

### attachment

Optional. 백엔드가 파일 업로드를 안전하게 지원하지 않으면 v1에서 제거.

## 6. Privacy

개인정보를 수집하는 실제 form을 공개하기 전:

- 실제 사업자 정보
- 수집 항목
- 이용 목적
- 보유 기간
- 문의 대응 정책

에 맞는 개인정보 처리방침/동의 문구를 확정해야 합니다.

법적 문구를 AI가 임의로 사실처럼 확정하지 않습니다.

## 7. Backend Rule

### Backend가 있으면

- 실제 validation
- CSRF
- server-side sanitation
- rate limit / abuse protection
- success/failure state
- admin notification/storage

### Backend가 없으면

**동작하는 것처럼 보이는 fake submit 금지.**

대안:

- 문의 준비 중 안내
- 검증된 이메일 연결
- 실제 사용 가능한 다른 contact method

중 하나를 명확하게 사용.

## 8. UX

- 한 페이지 form
- 불필요한 step wizard 금지
- 오류는 필드 근처 표시
- 작성 내용 유실 방지
- 모바일 keyboard type 적절히 지정
- submit 중 중복 클릭 방지
- 성공 시 다음 행동 명확히 안내
