# 20ft Claude Code Prompt Recipes

이 파일은 사용자 복사용이며 자동 컨텍스트로 읽을 필요가 없다.

## 첫 작업 — Scaffold / Architecture

```text
CLAUDE.md를 가장 먼저 확인하고 모든 작업에서 최상위 규칙으로 적용해.
그 다음 /twentyft-template scaffold 를 실행해.
현재 IA는 HOME / Portfolio / SuperBify / Project Inquiry이고 독립 About은 만들지 않는다.
20ftdocs 원문 전체를 한꺼번에 읽지 말고 .claude/reference/doc-map.md를 사용해서 필요한 문서만 조사 에이전트에 위임해.
G7 기술 규칙은 기존 AGENTS.md, 관련 docs/**, 현재 공식 _bundled 샘플과 실제 코드를 근거로 확인해.
G7 Core와 기존 공식 module/plugin/template은 절대 수정하지 말고, 구현 소스는 templates/_bundled/twentyft-studio/**에만 만들어.
먼저 제품/디자인 근거와 G7 기술 근거를 분리해서 조사하고 Architecture Gate를 통과한 뒤 구현해.
Runtime install/activate/update는 하지 마.
```

## Home

```text
CLAUDE.md를 먼저 확인하고 /twentyft-template home 을 실행해.
Home은 Hero → Selected Portfolio → SuperBify → About 20ft → JUST FOR FUN + Project Inquiry → Footer 순서를 기준으로 해.
Portfolio는 실제 공개 작업 2~3개와 사용자가 제공할 실제 Screenshot을 중심으로 하고 가짜 프로젝트/스크린샷/수치를 만들지 마.
```

## Portfolio

```text
CLAUDE.md를 먼저 확인하고 /twentyft-template portfolio 를 실행해.
Portfolio list/detail은 20ftdocs의 Data Model과 공개정책을 따르고 Home Featured와 같은 SSoT를 재사용해.
```

## SuperBify

```text
CLAUDE.md를 먼저 확인하고 /twentyft-template superbify 를 실행해.
SuperBify는 G7 Module / Plugin / Template을 실제로 배포하고 사용할 수 있게 하는 기술 제품 허브로 구현해.
존재하지 않는 버전, 가격, 다운로드, GitHub/SIR 링크를 만들지 마.
```

## Inquiry

```text
CLAUDE.md를 먼저 확인하고 /twentyft-template inquiry 를 실행해.
Project Inquiry는 기존 G7 기능으로 먼저 해결 가능한지 검토하고, 단순 문의를 위해 신규 Module을 만들지 마.
실제 backend가 없다면 fake submit을 구현하지 마.
```

## QA

```text
CLAUDE.md를 먼저 확인하고 /twentyft-review 전체 를 실행해.
코드 수정 없이 현재 변경을 독립 검증하고, 구현 PASS와 사용자 Visual Review가 필요한 항목을 분리해.
```
