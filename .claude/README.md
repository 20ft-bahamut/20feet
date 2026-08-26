# 20ft Claude Code Harness

이 디렉터리는 `20feet/` 프로젝트 루트에서 사용한다.

## 역할

- `agents/`: 조사 / 설계 / 구현 / QA / Runtime 확인을 별도 컨텍스트로 분리한다.
- `skills/`: 작업 순서와 오케스트레이션을 정의한다.
- `reference/doc-map.md`: 필요한 20ft/G7 문서만 골라 읽게 하는 Context Router다.
- `settings.json`: 민감 파일 읽기 제한만 둔다.

## 중요

Source Guard Hook은 사용하지 않는다.
`.claude/hooks/` 디렉터리는 없어야 한다.

G7 Core 보호는 다음 방식으로 관리한다.
- `CLAUDE.md` 규칙
- 구현 경로 명시
- 작업 전 `git status --short`
- 작업 후 `git diff`
- 독립 QA

## 기본 명령

```text
/twentyft-template home
/twentyft-template portfolio
/twentyft-template superbify
/twentyft-template inquiry
/twentyft-product-research <범위>
/twentyft-gnuboard-research <질문>
/twentyft-review <범위>
/twentyft-runtime-sync
```

## Source of Truth

- 제품/디자인: `20ftdocs/**` + `20ftdocs/19_CURRENT_DECISIONS.md`
- G7 기술: `AGENTS.md` + 관련 `docs/**` + 실제 소스 + 공식 `_bundled` 샘플
- 20ft Template Source: `templates/_bundled/twentyft-studio/**`
