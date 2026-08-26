# External AI Review Guide

이 문서 세트를 다른 AI에게 검수시킬 때 아래 기준을 사용합니다.

## Review Request

당신은 구현자가 아니라 **독립 리뷰어**입니다.

특히 `15_ACCEPTANCE.md`의 Final Quality Gate는 구현 AI의 셀프 채점으로 승인할 수 없습니다. 실제 구현 결과가 제공된 경우, 당신 또는 사용자가 독립적으로 최종 PASS/FAIL을 판단해야 합니다.

`20ftdocs` 전체를 읽고 다음 관점에서 검수하세요.

### 1. IA

- 중복 페이지가 있는가?
- 비어 있는 메뉴를 억지로 만들었는가?
- 고객이 20ft를 이해하고 문의하기까지 흐름이 자연스러운가?
- Services를 제거하고 Portfolio 중심으로 간 결정이 일관적인가?

### 2. Brand

- A SMALL SPACE / JUST FOR FUN / Digital Garage가 서로 충돌하지 않는가?
- 과거 공간의 이야기가 현재 Software Studio를 방해하지 않는가?
- 과장된 개발자 감성이나 스타트업 감성이 남아 있는가?

### 3. Content

- 실제로 하지 않는 일을 한다고 쓰는 부분이 있는가?
- 가짜 숫자/프로젝트/링크를 요구하는 부분이 있는가?
- 문장이 중복되는가?
- 고객 입장에서 의미 없는 자기소개가 과도한가?

### 4. Design System

- 컬러/폰트/그리드 사용 규칙이 구현 가능한가?
- 이전 실패 디자인을 다시 만들 가능성이 있는 모호한 지시가 있는가?
- 과한 대형 타이포/빈 공간/technical table을 막는 규칙이 충분한가?

### 5. Portfolio

- Services 역할을 제대로 대체하는가?
- 프로젝트가 적을 때도 어색하지 않은가?
- Detail 구조가 외주 영업에 도움이 되는가?

### 6. SuperBify

- 단순 홍보 페이지가 아니라 프로젝트 관리/게시 허브로 확장 가능한가?
- status/version/release 정책이 명확한가?

### 7. G7

- filesystem/DB drift를 방지하는 workflow가 충분한가?
- Git rollback point가 강제되는가?
- Core 수정 금지 원칙이 명확한가?

### 8. Acceptance

- 구현 AI가 “대충 완료”라고 빠져나갈 구멍이 있는가?
- 실제 browser verification을 요구하는가?

## Output Format

### Critical
실행 전에 반드시 수정해야 하는 문제.

### Major
품질에 큰 영향을 주는 문제.

### Minor
선택적으로 개선 가능한 문제.

### Missing
필수인데 문서에 빠진 내용.

### Contradictions
문서끼리 충돌하는 내용.

### Recommended Changes
파일명 / 섹션 / 변경안.

마지막에:

**READY TO IMPLEMENT: YES / NO**

를 명시하세요.

NO라면 blocker를 최대 5개로 정리하세요.
