# pinkbro-contents

PinkBro CleanCare 랜딩 사이트의 콘텐츠·문의·미디어 슬롯을 관리하는 G7 모듈입니다.

- 식별자: `pinkbro-contents`
- 네임스페이스: `Modules\Pinkbro\Contents`
- 의존 모듈: `sirsoft-board` (>= 1.0.0)

## 역할

G7 게시판(`sirsoft-board`)을 대체하지 않습니다. 게시판 위에 메타데이터와
관리자 화면, 공개 API 브릿지를 얹는 역할만 담당합니다.

| 영역 | 내용 |
|---|---|
| 콘텐츠 | 서비스·패키지·사례·FAQ 메타 관리 |
| 문의 | 문의 접수와 처리 상태 관리 |
| 미디어 | 이미지 슬롯 연결·해제 |
| 사이트 설정 | 연락처·브랜드 문구 |

## 구조

```
module.json                                  모듈 메타데이터
composer.json                                PSR-4 매핑
module.php                                   권한·시더·메뉴·훅 등록
src/
  Providers/PinkbroContentsServiceProvider.php
  routes/api.php                             공개 + 관리자 API 라우트
  lang/{ko,en}/                              모듈 다국어 (PHP)
resources/
  routes/admin.json                          관리자 라우트 정의
  lang/{ko,en}.json                          관리자 SPA 다국어
upgrades/                                    업그레이드 스텝
```

## 상태

콘텐츠 기반까지 구현했습니다. 권한·메뉴 선언, 메타 저장소(`pinkbro_meta`),
미디어 슬롯 레지스트리, 그리고 게시판 6종과 콘텐츠를 주입하는 시더
(`database/seeders/PinkbroContentsSeeder.php`, `module.php::getSeeders()`)가 동작합니다.
공개 API 컨트롤러·관리자 레이아웃은 이후 작업에서 추가됩니다.

시더가 주입하는 내용:

- 게시판 6종 — `pinkbro_service` / `pinkbro_package` / `pinkbro_case` /
  `pinkbro_faq` / `pinkbro_inquiry` / `pinkbro_media`
- 서비스 6종 · 패키지 3종 · 작업사례 4종 · FAQ 8종 (게시글 + `pinkbro_meta`)
- 사이트 레벨 메타 — `site` · `copy` · `discount`

카피는 `_workspace/pinkbro/reference/content/*.json` 원문 그대로이며,
시더는 그 파일을 런타임에 읽지 않습니다(배포 사이트에 존재하지 않음).

## 설치

G7 관리자 화면의 모듈 목록에서 설치·활성화합니다. `modules/_bundled/` 아래에
있으므로 별도 배포 패키지 없이 설치할 수 있습니다.

## 라이선스

MIT — `LICENSE` 참조.
