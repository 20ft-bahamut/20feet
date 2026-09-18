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

모듈 골격 단계입니다. 권한·메뉴 선언과 라우트 파일 위치까지 등록되어 있고,
콘텐츠 API·관리자 레이아웃·시더는 이후 작업에서 추가됩니다.

## 설치

G7 관리자 화면의 모듈 목록에서 설치·활성화합니다. `modules/_bundled/` 아래에
있으므로 별도 배포 패키지 없이 설치할 수 있습니다.

## 라이선스

MIT — `LICENSE` 참조.
