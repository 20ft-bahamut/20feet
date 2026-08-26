# Acceptance Criteria

다른 AI에게 검수를 요청할 때도 이 문서를 기준으로 PASS/FAIL을 판단합니다.

# A. IA

- [ ] Top nav가 `Portfolio / SuperBify / About / 프로젝트 문의`인가
- [ ] Services 메뉴가 없는가
- [ ] Contact와 Project Inquiry가 중복되지 않는가
- [ ] Works 대신 Portfolio 용어를 사용하는가
- [ ] SuperBify가 프로젝트 허브로 설계되어 있는가

# B. Home

- [ ] 본문은 Hero / Portfolio / SuperBify / About / Inquiry-Motto 5개 영역 중심인가
- [ ] Hero에서 20ft가 Software Studio임을 즉시 알 수 있는가
- [ ] Hero에서 `WEB / COMMERCE / SOFTWARE / GNUBOARD 7` 수행범위를 실제로 읽을 수 있는가
- [ ] Footer에서도 동일 capability line을 작은 정보 레벨로 확인할 수 있는가
- [ ] `A SMALL SPACE. INFINITE POSSIBILITIES.`가 브랜드 핵심으로 사용되는가
- [ ] Portfolio가 Home의 핵심 증거 영역인가
- [ ] SuperBify가 Home 전체를 과도하게 차지하지 않는가
- [ ] `JUST FOR FUN`과 Final CTA가 하나의 흐름으로 결합되어 있는가
- [ ] Build Log가 Home의 거대한 섹션으로 존재하지 않는가

# C. Brand

- [ ] Indigo/Ivory가 첫인상인가
- [ ] Gold가 detail로만 사용되는가
- [ ] Signal Red가 핵심 CTA 등에 제한되는가
- [ ] 공식 SVG 로고만 사용하는가
- [ ] Cafe/Caravan 사진이 없는가
- [ ] AI Startup 느낌이 없는가
- [ ] 일반 SI 템플릿처럼 보이지 않는가

# D. Typography/Layout

- [ ] Paperlogy Display + SUIT Body 정책을 지키는가
- [ ] Hero 외 섹션마다 거대한 영어 헤드라인을 반복하지 않는가
- [ ] `100vh` 일반 섹션이 없는가
- [ ] 의미 없는 큰 빈 공간이 없는가
- [ ] 모든 콘텐츠를 표/테두리로 만들지 않았는가
- [ ] Mono label이 보조 역할에 그치는가
- [ ] Container와 full-bleed surface 역할이 명확한가

# E. Portfolio

- [ ] 실제 프로젝트만 공개하는가
- [ ] 가짜 고객/성과가 없는가
- [ ] 프로젝트 상세 구조가 존재하는가
- [ ] What We Did가 실제 역할만 표시하는가
- [ ] Home featured와 Portfolio가 같은 data source인가
- [ ] private project는 public에 노출되지 않는가
- [ ] PurePol 등 공개 범위가 미확정된 후보는 기본 private이며 구현 AI가 임의 공개하지 않았는가
- [ ] 초기 Portfolio가 적다는 이유로 미확정/가짜 프로젝트를 채우지 않았는가

# F. SuperBify

- [ ] List + Detail 구조인가
- [ ] Status enum이 정확한가
- [ ] Released가 아닌 프로젝트에 다운로드 UI를 만들지 않는가
- [ ] version/link가 없을 때 fake value를 만들지 않는가
- [ ] Home preview와 동일 data source를 쓰는가
- [ ] 게시판 관리 구조로 확장하기 쉬운가
- [ ] 공개 프로젝트가 0개일 때 공식 Empty State가 정상 렌더링되는가
- [ ] 공개 프로젝트 수를 채우기 위해 가짜 Seed를 만들지 않았는가

# G. About

- [ ] 20ft 이름의 기원을 짧게 설명하는가
- [ ] 과거 실패담이 핵심이 아닌가
- [ ] 현재 Software Studio 정체성으로 연결되는가
- [ ] 20+ years web development 경험이 신뢰 요소로 들어가는가
- [ ] 이력서 전체 나열처럼 보이지 않는가
- [ ] JUST FOR FUN 의미가 자연스럽게 설명되는가

# H. Inquiry

- [ ] 프로젝트 유형이 정형 서비스 판매처럼 보이지 않는가
- [ ] 실제 backend가 없는데 fake submit을 제공하지 않는가
- [ ] validation/error/success state가 있는가
- [ ] 개인정보 정책이 실제 정보에 연결되는가
- [ ] 모바일 입력 UX가 정상인가

# I. G7 Safety

- [ ] G7 Core 수정 0인가
- [ ] filesystem source가 Git에 추적되는가
- [ ] Runtime update 전 Git commit이 있는가
- [ ] DB snapshot이 있는가
- [ ] active/bundled parity가 확인되는가
- [ ] Runtime API가 신규 layout을 반환하는가
- [ ] DB-only 최신 디자인이 없는가

# J. Runtime QA

- [ ] `/`
- [ ] `/portfolio`
- [ ] `/portfolio/{slug}`
- [ ] `/superbify`
- [ ] `/superbify/{slug}`
- [ ] `/about`
- [ ] `/inquiry`
- [ ] error routes

- [ ] 375
- [ ] 390
- [ ] 768
- [ ] 1280
- [ ] 1440

- [ ] console critical error 0
- [ ] asset 404 0
- [ ] missing translation 0
- [ ] horizontal overflow 0
- [ ] keyboard focus 정상

# K. Final Quality Gate

이 섹션은 **구현 AI의 셀프 채점만으로 최종 PASS할 수 없습니다.**

- 구현 AI는 자체 점검 결과를 제출할 수 있습니다.
- 최종 PASS/FAIL은 사용자 또는 구현에 참여하지 않은 별도의 독립 리뷰어가 실제 브라우저 결과를 보고 판단합니다.
- 독립 검수가 완료되지 않았다면 구현 AI의 최종 상태는 `IMPLEMENTATION COMPLETE / REVIEW PENDING`으로 보고합니다.

다음 질문에 모두 YES여야 합니다.

1. 회사명을 가려도 흔한 SI/SaaS 템플릿과 다른가?
2. 디자인을 보기 전에 콘텐츠 구조가 이해되는가?
3. “20ft가 무슨 일을 하는지” Portfolio로 확인 가능한가?
4. SuperBify가 실제로 계속 프로젝트를 추가할 수 있는 구조인가?
5. About이 브랜드와 사람을 동시에 신뢰하게 만드는가?
6. 문의가 명확한가?
7. 장식보다 정보가 앞서는가?
8. 과장 없이도 자신감이 느껴지는가?

하나라도 NO면 최종 승인 상태가 아닙니다.

최종 승인 표기:

- `IMPLEMENTATION COMPLETE / REVIEW PENDING`
- `FINAL REVIEW / PASS`
- `FINAL REVIEW / FAIL`
