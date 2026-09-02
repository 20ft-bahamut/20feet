# REGISTER FEATURE PARITY MATRIX — Still Form (superbify-commerce_minimal)

- Oracle: `templates/_bundled/sirsoft-basic/layouts/auth/register.json` + `partials/auth/_register_form.json` + `_modal_terms.json` / `_modal_privacy.json`
- Backend contract: `app/Http/Requests/Auth/RegisterRequest.php`, `app/Services/AuthService.php`, `app/Rules/PasswordPolicy.php`, `routes/api.php:264`
- Confirmed against live G7 source + runtime (`http://127.0.0.1:8000`), 2026-09-02.

| 기능 | DEFAULT | STILL FORM (audit 시점) | ACTION |
|---|---|---|---|
| 이메일 입력 (required, email) | YES | YES | keep |
| 비밀번호 (required, min 8 서버 PasswordPolicy) | YES (client live rule minLength:8) | YES (minLength attr) | keep + 정책 hint |
| 비밀번호 확인 (confirmed, client+server) | YES | YES | keep |
| 이름 (server REQUIRED) | YES, `*` 표시 | YES required, 단 placeholder "(선택)" + `*` 누락 | FIX 라벨 |
| 닉네임 (optional, max:50) | YES | YES | keep |
| 휴대폰번호 mobile (optional, regex) | YES | 누락 | RESTORE |
| 전화번호 phone (optional, regex) | YES | 누락 | RESTORE |
| 언어 language (select, $locales) | YES | 누락 | RESTORE |
| 확장 필드 앵커 `register_extension_fields` | YES | YES | keep |
| 이용약관 동의 checkbox (`agree_terms` value=1, required, server `accepted`) | YES | YES | keep |
| 이용약관 내용 보기 (refetchDataSource termsContent + openModal termsModal, CMS `/api/modules/sirsoft-page/pages/terms`) | YES modal | 링크만 (/shop/terms) | RESTORE modal, 링크 병존 |
| 개인정보 동의 checkbox (`agree_privacy`, server `accepted`) | YES | YES | keep |
| 개인정보 내용 보기 (privacyContent + privacyModal) | YES modal | 링크만 | RESTORE modal, 링크 병존 |
| 선택 약관 / 마케팅 동의 | NO (BASIC test가 부재 강제) | NO | 추가 금지 |
| 이메일 중복확인 별도 버튼/API | NO (submit-time unique) | NO | 신설 금지 |
| 닉네임 중복확인 | NO | NO | 신설 금지 |
| 비밀번호 정책 표시 | placeholder count=8 + live rule | placeholder만 | hint 복원 (기본 8자 = PasswordPolicy DEFAULT_MIN_LENGTH) |
| 이메일 형식 검증 (client+server) | YES | YES | keep |
| CAPTCHA | core에 없음 | 없음 | 신설 금지 |
| 이메일 인증 | 별도 flow 없음 (IDV `verification_token` query 전달만) | verification_token 전달 유지 | keep |
| CSRF | engine apiCall 계약 | 동일 | keep |
| 가입 성공 Redirect | toast + navigate /login (자동 로그인 없음) | 동일 | keep |
| 가입 후 자동 로그인 | NO | NO | keep |
| Social Register | 컴포넌트만 존재, default register 레이아웃 미사용 | 없음 | 가짜 버튼 신설 금지 |
| 로딩 표시 | blur 오버레이 + 스피너 | 버튼 텍스트 전환 | presentation 차이 허용 |
| non-field 에러 목록 (identity/verification_token) | YES (필드 화이트리스트 제외) | YES — 필터 목록에 mobile/phone/language 누락 | FIX 필터 |
| guest_only / 로그인 리다이렉트 가드 | YES | YES | keep |

## Agreement Source (확정)

- 이용약관: `pages` 테이블 slug `terms` — seed `modules/_bundled/sirsoft-page/database/seeders/PageSeeder.php:86`, API `GET /api/modules/sirsoft-page/pages/terms` (runtime 200, 실제 내용 확인).
- 개인정보: 동일 메커니즘 slug `privacy` (`PageSeeder.php:94`).
- Register UI는 이 API를 dataSource로 fetch해 모달에 표시 (BASIC과 동일 계약). 하드코딩 금지 준수.
- 스토어 정책 페이지 `/shop/terms`·`/shop/privacy` (config/business-info.json, PolicyPage)는 footer 링크 대상으로 유지 — 중복 페이지 신설 아님, 기존 구조 존치.

## Server-side agreement validation

- `RegisterRequest.php:39-40` — `agree_terms: accepted`, `agree_privacy: accepted` → 체크 없는 직접 API 호출 시 422. (Core 변경 없음, 그대로 재사용.)