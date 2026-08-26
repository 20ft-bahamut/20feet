# G7 Template Rules

이 문서는 기존 20ft 템플릿 작업 중 실제로 확인된 운영 위험을 방지하기 위한 규칙입니다.

## 1. 핵심 원칙

G7 Template은 단순히 filesystem 파일만 보는 구조가 아닐 수 있습니다.

기존 진단에서 확인된 중요한 사실:

- Runtime layout은 DB의 template layout content를 사용할 수 있음
- filesystem `layouts/*.json` 변경이 자동으로 Runtime에 반영된다고 가정하면 안 됨
- template update 과정에서 filesystem이 DB layout을 덮어쓸 수 있음
- 성공한 update backup이 영구 rollback point로 남는다고 가정하면 안 됨
- active extension directory가 Git ignore 대상일 수 있음

따라서 **Git + filesystem + DB runtime의 세 상태를 명시적으로 관리**해야 합니다.

## 2. 개발 SSoT

신규 구축에서는 **Git으로 추적되는 filesystem source를 개발 SSoT로 삼는 것**을 기본 정책으로 합니다.

실제 repository의 G7 convention을 확인해 `_bundled/{identifier}`가 배포 source인지, active template과 어떤 관계인지 먼저 확정합니다.

문서와 실제 코드가 다르면 실제 G7 구현을 우선합니다.

## 3. Runtime 반영 전 필수

1. source 변경 완료
2. build/typecheck/json validation
3. active/bundled parity
4. Git diff 검토
5. Git commit
6. 현재 DB layout snapshot
7. 공식 G7 update command 확인
8. Runtime 반영
9. API 확인
10. 브라우저 확인

## 4. Force Update

`template:update --force` 또는 유사 overwrite 명령은 아래 조건을 모두 만족할 때만 사용합니다.

- source가 의도한 최신 상태임
- Git commit 존재
- DB snapshot 존재
- active/bundled mismatch 없음
- 실제 command semantics 확인
- 덮어써질 대상 이해

“화면이 안 바뀐다”는 이유만으로 force update를 반복하지 않습니다.

## 5. Layout Editor

Layout Editor에서 DB에 직접 저장한 내용이 filesystem보다 최신해질 수 있는 구조라면:

- Editor save 직후 filesystem export/동기화 경로를 확정하거나
- 개발 중 Editor를 사용하지 않거나
- 별도의 versioning workflow를 마련

해야 합니다.

DB-only 최신 디자인 금지.

## 6. Git

금지:

- `git add .` 습관적 사용
- unrelated file commit
- `git reset --hard`
- `git clean`
- active ignored directory만 믿고 개발

각 milestone별 commit 예:

- scaffold
- design system
- home
- portfolio
- superbify
- about/inquiry
- runtime stabilization

## 7. Runtime Verification

Runtime update 후 파일을 믿지 말고 실제 API와 브라우저를 봅니다.

검증:

- active template identifier
- layout API response
- component fingerprint
- asset 200
- CSS/JS load
- font load
- missing translations
- console errors

## 8. Core Modification

G7 Core 수정 금지.

필요한 기능이 Core에 없다면:

- Template
- Module
- Plugin/Extension
- 별도 SuperBify candidate

중 적절한 확장점으로 해결합니다.

## 9. Pain Log

G7 자체의 개선점은 구현에 섞어 우회 수정하지 않고 별도 기록합니다.

예:

- filesystem ↔ DB layout drift
- active template Git ignore
- update overwrite 위험
- version/backup 정책
- build source ambiguity
