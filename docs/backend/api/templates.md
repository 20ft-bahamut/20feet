# Templates API 레퍼런스

> **소유**: 코어 · **생성**: `php artisan api:docgen` (실측 기반). @generated 블록은 재생성 시 갱신되며, 사람이 작성한 설명은 보존됩니다.

---

## TL;DR (5초 요약)

```text
1. 이 문서는 실제 API 호출로 실측한 Templates 엔드포인트 레퍼런스입니다
2. 각 엔드포인트: 메서드/URI/권한 + 요청 파라미터 표 + 요청 예시(curl) + 실측 응답 필드 표 + 응답 예시(envelope)
3. 응답 필드의 예시값·응답 예시 JSON 은 실제 호출 응답에서 관측된 값입니다
4. 갱신: 코드 변경 후 php artisan api:docgen 재실행
5. 설명(TODO) 칸은 사람이 채웁니다
```

---


### GET /api/admin/templates
<!-- @generated:start:api.admin.templates.index -->
- **라우트명**: `api.admin.templates.index`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@index`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| type | query | string | 아니오 | `user`, `admin` | 유형 필터 (해당 유형의 항목만 조회) |
| search | query | string | 아니오 | max 255 | 검색어 (지정한 검색 대상 필드에서 부분 일치) |
| filters | query | array | 아니오 | max 10 | 추가 필터 조건 맵 (필드별 조건) |
| status | query | string | 아니오 | `installed`, `not_installed`, `active`, `inactive` | 상태 필터 (해당 상태의 항목만 조회) |
| per_page | query | integer | 아니오 | min 1, max 100 | 페이지당 항목 수 |
| page | query | integer | 아니오 | min 1 | 조회할 페이지 번호 (1부터 시작) |
| include_hidden | query | boolean | 아니오 | — | manifest `hidden=true`로 숨김 처리된 확장까지 목록에 포함할지 여부 (기본 미포함) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.template.index_validation_rules`).

**요청 예시**

```http
GET /api/admin/templates?type=user&search=%EC%98%88%EC%8B%9C%EA%B0%92&filters=%EC%98%88%EC%8B%9C%EA%B0%92&status=installed&per_page=1&page=1&include_hidden=1 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

_목록 응답: `data.data[]` 배열 항목의 필드 + `data.pagination`._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| identifier | string | `sirsoft-admin_basic` | 템플릿 고유 식별자 (vendor-name 형식, 예: sirsoft-admin_basic) |
| vendor | string | `sirsoft` | 벤더/개발자명 (예: sirsoft) |
| name | string | `Admin Basic` | 템플릿 이름 (다국어 JSON) |
| version | string | `1.0.4` | 템플릿 버전 (예: 1.0.0) |
| type | string | `admin` | 템플릿 타입 (admin: 관리자용, user: 사용자용) |
| status | string | `active` | 상태 (active: 활성화, inactive: 비활성화, installing: 설치 중, uninstalling: 제거 중, updating: 업데이트 중) |
| description | string | `그누보드7 기본 관리자 템플릿` | 템플릿 설명 (다국어 JSON) |
| dependencies | object | `{"modules":[],"plugins":[]}` | 의존하는 확장 맵 (manifest 파생 — {modules, plugins}) |
| dependencies_met | boolean | `true` | 의존하는 모듈/플러그인이 모두 설치·활성 상태로 충족되었는지 여부 (activate 선행 검사 파생) |
| update_available | boolean | `false` | 최신 버전 대비 업데이트 가능 여부 |
| update_source | null | `null` | 업데이트 감지 출처 (github, bundled 등) |
| latest_version | string | `1.0.4` | 감지된 최신 배포 버전 |
| file_version | string | `1.0.4` | 설치된 파일의 manifest 버전 |
| github_url | string | `https://github.com/gnuboard/g7-templa…` | GitHub 저장소 URL |
| github_changelog_url | string | `https://github.com/gnuboard/g7-templa…` | GitHub 변경 내역 URL |
| is_pending | boolean | `false` | _pending 대기소에 있어 설치 대기 중인지 여부 |
| is_bundled | boolean | `false` | 코어에 선탑재된 번들 확장인지 여부 |
| deactivated_reason | null | `null` | 비활성화 사유: manual(사용자 수동) \| incompatible_core(코어 버전 호환성) \| null(active) |
| deactivated_at | null | `null` | deactivated 일시 |
| incompatible_required_version | null | `null` | 요구 코어 버전 미충족 시 필요한 버전 (호환되면 null) |
| abilities | object | `{"can_install":true,"can_activate":true,"can_uninstall":t…` | 현재 사용자가 이 리소스에 수행 가능한 작업 불리언 맵 (can_update, can_delete 등 — 권한 맵 기반) |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "템플릿 정보를 성공적으로 가져왔습니다.",
    "data": {
        "data": [
            {
                "identifier": "sirsoft-admin_basic",
                "vendor": "sirsoft",
                "name": "Admin Basic",
                "version": "1.0.4",
                "type": "admin",
                "status": "active",
                "description": "그누보드7 기본 관리자 템플릿",
                "dependencies": {
                    "modules": [],
                    "plugins": []
                },
                "dependencies_met": true,
                "update_available": false,
                "update_source": null,
                "latest_version": "1.0.4",
                "file_version": "1.0.4",
                "github_url": "https://github.com/gnuboard/g7-template-sirsoft-admin_basic",
                "github_changelog_url": "https://github.com/gnuboard/g7-template-sirsoft-admin_basic/releases",
                "is_pending": false,
                "is_bundled": false,
                "deactivated_reason": null,
                "deactivated_at": null,
                "incompatible_required_version": null,
                "abilities": {
                    "can_install": true,
                    "can_activate": true,
                    "can_uninstall": true,
                    "can_edit_layouts": true
                }
            },
            {
                "identifier": "sirsoft-basic",
                "vendor": "sirsoft",
                "name": "Basic",
                "version": "1.0.4",
                "type": "user",
                "status": "active",
                "description": "그누보드7 기본 사용자 템플릿",
                "dependencies": {
                    "modules": [
                        {
                            "identifier": "sirsoft-board",
                            "name": "게시판",
                            "type": "module"
                        },
                        {
                            "identifier": "sirsoft-ecommerce",
                            "name": "이커머스",
                            "type": "module"
                        },
                        {
                            "identifier": "sirsoft-page",
                            "name": "페이지",
                            "type": "module"
                        }
                    ],
                    "plugins": [
                        {
                            "identifier": "sirsoft-daum_postcode",
                            "name": "Daum 우편번호",
                            "type": "plugin"
                        }
                    ]
                },
                "dependencies_met": true,
                "update_available": false,
                "update_source": null,
                "latest_version": "1.0.4",
                "file_version": "1.0.4",
                "github_url": "https://github.com/gnuboard/g7-template-sirsoft-basic",
                "github_changelog_url": "https://github.com/gnuboard/g7-template-sirsoft-basic/releases",
                "is_pending": false,
                "is_bundled": false,
                "deactivated_reason": null,
                "deactivated_at": null,
                "incompatible_required_version": null,
                "abilities": {
                    "can_install": true,
                    "can_activate": true,
                    "can_uninstall": true,
                    "can_edit_layouts": true
                }
            }
        ],
        "pagination": {
            "total": 2,
            "current_page": 1,
            "last_page": 1,
            "per_page": 25
        },
        "meta": {
            "total_templates": 2,
            "active_templates": 2,
            "admin_templates": 1,
            "user_templates": 1,
            "installed_templates": 2
        },
        "abilities": {
            "can_install": true,
            "can_activate": true,
            "can_uninstall": true
        }
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |

<!-- @generated:end -->

**설명** 설치/미설치 템플릿을 모두 포함해 목록을 조회합니다(TemplateService::getPaginatedTemplates). `search`(이름·식별자·설명·벤더 OR 검색), `filters`(AND 조건), `status`, `type`, `include_hidden` 필터와 페이지네이션을 지원하며, 응답에는 현재 사용자의 install/activate/uninstall 수행 가능 여부(`abilities`)가 함께 담깁니다. `core.templates.read` 권한이 필요합니다.


### POST /api/admin/templates/activate
<!-- @generated:start:api.admin.templates.activate -->
- **라우트명**: `api.admin.templates.activate`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@activate`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.activate`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| template_name | body | string | 예 | max 255 | template 이름 (식별자) |
| force | body | boolean | 아니오 | — | 강제 실행 여부 (안전 확인/선행 검사 우회) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.template.activate_validation_rules`).

**요청 예시**

```http
POST /api/admin/templates/activate HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "template_name": "예시 이름",
    "force": true
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.activate`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |

<!-- @generated:end -->

**설명** 설치된 템플릿을 활성화합니다. 필요한 의존 모듈/플러그인이 충족되지 않으면 409(warning)로 누락 목록을 반환하며, `force=true`로 강제 활성화할 수 있습니다. 활성화 성공 시 재활성화로 되살아나는 번들 언어팩 목록(`pending_language_packs`)을 함께 반환합니다. `core.templates.activate` 권한이 필요합니다.


### POST /api/admin/templates/check-updates
<!-- @generated:start:api.admin.templates.check-updates -->
- **라우트명**: `api.admin.templates.check-updates`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@checkUpdates`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.install`

**요청 파라미터**

_요청 파라미터 없음._

**요청 예시**

```http
POST /api/admin/templates/check-updates HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.install`)이 없는 경우 |

<!-- @generated:end -->

**설명** 설치된 모든 템플릿의 배포 최신 버전을 조회해 업데이트 가능 여부를 확인합니다(TemplateService::checkForUpdates). 별도 요청 파라미터는 없으며, 목록 화면의 업데이트 배지 갱신에 사용됩니다. `core.templates.install` 권한이 필요합니다.


### POST /api/admin/templates/deactivate
<!-- @generated:start:api.admin.templates.deactivate -->
- **라우트명**: `api.admin.templates.deactivate`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@deactivate`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.activate`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| template_name | body | string | 예 | max 255 | template 이름 (식별자) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.template.deactivate_validation_rules`).

**요청 예시**

```http
POST /api/admin/templates/deactivate HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "template_name": "예시 이름"
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.activate`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |

<!-- @generated:end -->

**설명** 활성 상태의 템플릿을 비활성화합니다(TemplateService::deactivateTemplate). `core.templates.activate` 권한이 필요합니다.


### POST /api/admin/templates/install
<!-- @generated:start:api.admin.templates.install -->
- **라우트명**: `api.admin.templates.install`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@install`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.install`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| template_name | body | string | 예 | max 255 | template 이름 (식별자) |
| dependencies | body | array | 아니오 | — | 함께 설치할 의존 확장 목록 (install-preview 응답 기반 사용자 선택분, 각 원소 type: module\|plugin, identifier) |
| language_packs | body | array | 아니오 | — | 함께 설치할 동반 번들 언어팩 식별자 배열 (설치 성공 후 best-effort 설치) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.template.install_validation_rules`).

**요청 예시**

```http
POST /api/admin/templates/install HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "template_name": "예시 이름",
    "dependencies": [
        "예시값"
    ],
    "language_packs": [
        "예시값"
    ]
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.install`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |

<!-- @generated:end -->

**설명** `_bundled`/`_pending` 대기소의 템플릿을 활성 디렉토리로 설치합니다. 요청 시 함께 선택한 의존 확장을 먼저 설치(cascade 1단계)하고, 실패 시 중단합니다. 설치 성공 후 동반 번들 언어팩을 best-effort로 설치하며 실패 목록을 `language_pack_failures`로 반환합니다(cascade 2단계). `core.templates.install` 권한이 필요합니다.


### POST /api/admin/templates/install-from-file
<!-- @generated:start:api.admin.templates.install-from-file -->
- **라우트명**: `api.admin.templates.install-from-file`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@installFromFile`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.install`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| file | body | file | 예 | max 51200 | 업로드 파일 |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.template.install_from_file_validation_rules`).

**요청 예시**

```http
POST /api/admin/templates/install-from-file HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: multipart/form-data; boundary=----G7ExampleBoundary

------G7ExampleBoundary
Content-Disposition: form-data; name="file"; filename="example.pdf"
Content-Type: application/octet-stream

(바이너리 파일 내용)
------G7ExampleBoundary--
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.install`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |

<!-- @generated:end -->

**설명** 업로드된 ZIP 파일에서 템플릿을 설치합니다(TemplateService::installFromZipFile). 최대 50MB(51200KB)까지 허용합니다. `core.templates.install` 권한이 필요합니다.


### POST /api/admin/templates/install-from-github
<!-- @generated:start:api.admin.templates.install-from-github -->
- **라우트명**: `api.admin.templates.install-from-github`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@installFromGithub`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.install`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| github_url | body | string | 예 | — | GitHub 저장소 URL |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.template.install_from_github_validation_rules`).

**요청 예시**

```http
POST /api/admin/templates/install-from-github HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "github_url": "https://example.com"
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.install`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |

<!-- @generated:end -->

**설명** 지정한 GitHub 저장소 URL에서 템플릿을 내려받아 설치합니다(TemplateService::installFromGithub). `core.templates.install` 권한이 필요합니다.


### DELETE /api/admin/templates/layout-attachments/{attachment}
<!-- @generated:start:api.admin.templates.layout-attachments.destroy -->
- **라우트명**: `api.admin.templates.layout-attachments.destroy`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateLayoutAttachmentController@destroy`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| attachment | path | string | 예 | — | 대상 attachment의 식별자 |

**요청 예시**

```http
DELETE /api/admin/templates/layout-attachments/{attachment} HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃 편집 중 업로드된 첨부(배경 이미지 등)를 삭제합니다. 스토리지의 실제 파일과 DB 행을 함께 삭제합니다(TemplateLayoutAttachmentService::delete). `core.templates.layouts.edit` 권한이 필요합니다.


### POST /api/admin/templates/manifest-preview
<!-- @generated:start:api.admin.templates.manifest-preview -->
- **라우트명**: `api.admin.templates.manifest-preview`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@manifestPreview`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.install`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| file | body | file | 예 | max 51200 | 업로드 파일 |

**요청 예시**

```http
POST /api/admin/templates/manifest-preview HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: multipart/form-data; boundary=----G7ExampleBoundary

------G7ExampleBoundary
Content-Disposition: form-data; name="file"; filename="example.pdf"
Content-Type: application/octet-stream

(바이너리 파일 내용)
------G7ExampleBoundary--
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.install`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |

<!-- @generated:end -->

**설명** 업로드된 ZIP을 실제 설치하지 않고 manifest와 검증 결과만 추출해 반환합니다(TemplateService::previewManifest). 설치 전 확인 다이얼로그에서 사용합니다. `core.templates.install` 권한이 필요합니다.


### POST /api/admin/templates/refresh-layouts
<!-- @generated:start:api.admin.templates.refresh-layouts -->
- **라우트명**: `api.admin.templates.refresh-layouts`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@refreshLayouts`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.activate`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| template_name | body | string | 예 | max 255 | template 이름 (식별자) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.template.refresh_layouts_validation_rules`).

**요청 예시**

```http
POST /api/admin/templates/refresh-layouts HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "template_name": "예시 이름"
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.activate`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |

<!-- @generated:end -->

**설명** 템플릿의 레이아웃을 파일에서 다시 읽어 DB에 갱신합니다(TemplateService::refreshTemplateLayouts). 파일로 직접 수정한 레이아웃을 반영할 때 사용합니다. `core.templates.activate` 권한이 필요합니다.


### DELETE /api/admin/templates/uninstall
<!-- @generated:start:api.admin.templates.uninstall -->
- **라우트명**: `api.admin.templates.uninstall`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@uninstall`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.uninstall`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| template_name | query | string | 예 | max 255 | template 이름 (식별자) |
| delete_data | query | boolean | 아니오 | — | 제거 시 템플릿 관련 데이터(레이아웃/설정 등)까지 함께 삭제할지 여부 (기본 false = 파일만 제거) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.template.uninstall_validation_rules`).

**요청 예시**

```http
DELETE /api/admin/templates/uninstall?template_name=%EC%98%88%EC%8B%9C%20%EC%9D%B4%EB%A6%84&delete_data=1 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.uninstall`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |

<!-- @generated:end -->

**설명** 활성 디렉토리의 템플릿을 제거합니다(`_bundled` 원본은 보존). `delete_data=true`인 경우 관련 데이터까지 함께 삭제합니다(TemplateService::uninstallTemplate). `core.templates.uninstall` 권한이 필요합니다.


### GET /api/admin/templates/{identifier}/changelog
<!-- @generated:start:api.admin.templates.changelog -->
- **라우트명**: `api.admin.templates.changelog`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@changelog`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| source | query | string | 아니오 | `active`, `bundled`, `github` | CHANGELOG 조회 출처 (active: 설치본, bundled: 코어 번들 원본, github: 원격 저장소) |
| from_version | query | string | 아니오 | — | 시작 버전 (범위 하한) |
| to_version | query | string | 아니오 | — | 대상 버전 (범위 상한) |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/changelog?source=active&from_version=%EC%98%88%EC%8B%9C%EA%B0%92&to_version=%EC%98%88%EC%8B%9C%EA%B0%92 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

_단건 응답: `data` 객체의 필드._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| changelog | array | `[{"version":"1.0.4","date":"2026-07-17","categories":[{"n…` | 변경 이력 텍스트 (원격/파일 CHANGELOG 본문) |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "template.fetch_success",
    "data": {
        "changelog": [
            {
                "version": "1.0.4",
                "date": "2026-07-17",
                "categories": [
                    {
                        "name": "Added",
                        "items": [
                            "회원 상세에 계정 잠금 상태 표시와 잠금 해제 버튼을 추가했습니다. 로그인 실패가 누적돼 잠긴 계정, 특히 무기한 잠긴 계정을 관리자가 이 화면에서 바로 풀 수 있습니다. (#81 @jiwonpapa 님께서 제보해주셨습니다.)",
                            "환경설정 > 보안에 비밀번호 최소 길이·특수문자 필수 항목을 추가하고, 로그인 시도 제한 항목에 IP 단위 제한 계산 방식 안내를 덧붙였습니다. (#81 @jiwonpapa 님께서 제보해주셨습니다.)",
                            "일반 설정에 에셋 파일 서빙 방식 항목을 추가했습니다. 정적 파일 최적화 규칙(nginx `location ~* \\.(js|css|json|...)$` 블록 등)이 확장자 주소를 가로채 화면이 뜨지 않을 때 확장자 없는 주소로 전환할 수 있습니다. \"자동 감지\" 버튼을 누르면 판정 결과가 항목 아래에 인라인으로 표시되며, 확장자를 가로채는 환경이면 원인이 … (생략)",
                            "... (총 12건 중 3건 표시)"
                        ]
                    },
                    {
                        "name": "Changed",
                        "items": [
                            "SEO 설정의 \"지금 생성\" 버튼이 sitemap 생성을 예약하고 바로 응답합니다. 사이트 규모가 커도 화면이 멈추지 않으며, 생성 중에는 버튼이 비활성화되고 진행 상황이 화면에 표시됩니다.",
                            "총 건수를 정확히 셀 수 없을 만큼 기록이 많은 관리자 목록에서도 페이지 이동 버튼이 사라지지 않습니다. 마지막 페이지로 바로 뛰는 버튼만 이때 감춰집니다.",
                            "목록의 총 건수 정확도 표시를 사용하기 위해 이 템플릿은 이제 코어 7.0.6 이상이 필요합니다."
                        ]
                    },
                    {
                        "name": "Fixed",
                        "items": [
                            "활동 로그 목록에서 이전·다음 버튼이 모두 눌리지 않아 첫 페이지에 갇히던 문제를 수정했습니다.",
                            "활동 로그의 총 건수가 끝까지 세지 못한 값인데도 정확한 숫자처럼 표시되던 문제를 수정했습니다. 이제 그 경우 「N건 이상」으로 표시되며, 글 번호도 「-」로 표시됩니다.",
                            "모듈·플러그인·템플릿 관리 화면에서 '업데이트 확인'을 눌러 업데이트가 발견돼도 항상 \"모두 최신 상태입니다\"라고 안내되던 문제를 수정했습니다.",
                            "... (총 28건 중 3건 표시)"
                        ]
                    },
                    "... (총 5건 중 3건 표시)"
                ]
            },
            {
                "version": "1.0.3",
                "date": "2026-07-14",
                "categories": [
                    {
                        "name": "Fixed",
                        "items": [
                            "권한 관리 화면의 새로고침 버튼이 다른 관리자 화면의 새로고침 버튼과 모양이 달랐던 문제를 수정했습니다.",
                            "환경설정 화면의 탭 줄과 게시판 설정 화면의 상단 고정 영역이 화면 여백과 어긋나 가로로 밀려 보일 수 있던 문제를 정리했습니다."
                        ]
                    }
                ]
            },
            {
                "version": "1.0.2",
                "date": "2026-07-09",
                "categories": [
                    {
                        "name": "Added",
                        "items": [
                            "환경설정 > 보안 화면에 \"내부 네트워크 주소 호출 허용\" 항목이 추가되었습니다. 예약 작업의 주소 호출이나 외부 API 연동에서 사내 서버 주소를 사용해야 할 때 켜면 됩니다. 기본값은 꺼짐입니다.",
                            "레이아웃 편집기에서 관리자 기본 레이아웃을 편집할 때 \"모바일 메뉴 펼침\" 상태를 선택할 수 있습니다 — 모바일 메뉴 안의 언어·통화·배송국가 버튼을 캔버스에서 바로 편집할 수 있습니다."
                        ]
                    },
                    {
                        "name": "Changed",
                        "items": [
                            "모바일에서 언어·통화·배송국가 선택을 관리자 메뉴 안으로 옮기고, 사용자 화면과 동일하게 가로로 나열된 버튼 형태로 통일했습니다. 상단 헤더에는 테마 전환과 알림만 남습니다.",
                            "모바일 메뉴 안의 언어와 통화·배송국가가 각각 접었다 펼치는 항목으로 바뀌어, 메뉴를 열었을 때 곧바로 관리자 메뉴가 보입니다. 접혀 있을 때도 현재 선택된 언어와 통화·배송국가가 표시되므로 펼치지 않아도 확인할 수 있으며, 두 항목은 서로 독립적으로 여닫힙니다."
                        ]
                    },
                    {
                        "name": "Fixed",
                        "items": [
                            "모바일에서 상단 헤더의 통화 선택 버튼이 화면 밖으로 잘려 보이던 문제를 수정했습니다. 화면이 좁을수록 심해져 320px 기기에서는 대부분이 가려졌습니다.",
                            "관리자 메뉴에서 언어를 선택해도 언어가 바뀌지 않던 문제를 수정했습니다. 로그인·비밀번호 찾기·비밀번호 재설정 화면의 언어 선택도 함께 정리했습니다.",
                            "좁은 화면에서 팝업 창이 화면 좌우에 빈틈 없이 붙어 보이던 문제를 수정했습니다 — 이제 양옆에 여백이 생깁니다.",
                            "... (총 5건 중 3건 표시)"
                        ]
                    }
                ]
            },
            "... (총 56건 중 3건 표시)"
        ]
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 특정 템플릿의 변경 내역(CHANGELOG)을 조회합니다. `source`(active/bundled/github)로 출처를, `from_version`/`to_version`으로 버전 범위를 지정할 수 있습니다(TemplateService::getTemplateChangelog). `core.templates.read` 권한이 필요합니다.


### GET /api/admin/templates/{identifier}/editor-assets
<!-- @generated:start:api.admin.templates.editor-assets -->
- **라우트명**: `api.admin.templates.editor-assets`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@getEditorAssets`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor-assets HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

_단건 응답: `data` 객체의 필드._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| identifier | string | `sirsoft-admin_basic` | 템플릿 고유 식별자 (vendor-name 형식, 예: sirsoft-admin_basic) |
| js | array | `["\/api\/templates\/assets\/sirsoft-admin_basic?file=js%2…` | <!-- TODO: 설명 --> |
| css | array | `["\/api\/admin\/templates\/sirsoft-admin_basic\/editor\/c…` | <!-- TODO: 설명 --> |
| manifest_present | boolean | `true` | <!-- TODO: 설명 --> |
| manifest_source | string | `active` | <!-- TODO: 설명 --> |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "편집기 자산 정보를 조회했습니다.",
    "data": {
        "identifier": "sirsoft-admin_basic",
        "js": [
            "/api/templates/assets/sirsoft-admin_basic?file=js%2Fcomponents.iife.js"
        ],
        "css": [
            "/api/admin/templates/sirsoft-admin_basic/editor/component-styles"
        ],
        "manifest_present": true,
        "manifest_source": "active"
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃 편집기 부팅용 자산 매니페스트(컴포넌트 IIFE JS / CSS URL)를 반환합니다. 비활성 템플릿도 편집할 수 있도록 활성 디렉토리 → `_bundled` 폴백으로 빌드 산출물을 탐색하며, 빌드가 없으면 빈 목록으로 폴백합니다. `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{identifier}/editor/broadcast-catalog
<!-- @generated:start:api.admin.templates.editor-broadcast-catalog.extensionless -->
- **라우트명**: `api.admin.templates.editor-broadcast-catalog.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\BroadcastCatalogController@index`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/broadcast-catalog HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

_단건 응답: `data` 객체의 필드._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| identifier | string | `sirsoft-admin_basic` | 템플릿 고유 식별자 (vendor-name 형식, 예: sirsoft-admin_basic) |
| channels | array | `[{"name":"core.admin.dashboard","source":{"kind":"core"}}…` | <!-- TODO: 설명 --> |
| events | array | `[]` | <!-- TODO: 설명 --> |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "성공적으로 처리되었습니다.",
    "data": {
        "identifier": "sirsoft-admin_basic",
        "channels": [
            {
                "name": "core.admin.dashboard",
                "source": {
                    "kind": "core"
                }
            },
            {
                "name": "core.user.notifications.{uuid}",
                "source": {
                    "kind": "core"
                }
            }
        ],
        "events": []
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/admin/templates/{identifier}/editor/broadcast-catalog.json
<!-- @generated:start:api.admin.templates.editor-broadcast-catalog -->
- **라우트명**: `api.admin.templates.editor-broadcast-catalog`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\BroadcastCatalogController@index`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/broadcast-catalog.json HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: http-404 — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: http-404 — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 데이터소스 websocket 후보용으로 등록된 브로드캐스트 채널/이벤트 카탈로그를 반환합니다(BroadcastCatalogService::collect). 편집기 전용 가드 하에서만 노출되며(admin 전역 broadcast 회피), `identifier`는 라우트 일관성용이고 카탈로그는 설치본 전역 기준입니다. `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{identifier}/editor/component-styles
<!-- @generated:start:api.admin.templates.editor-css.extensionless -->
- **라우트명**: `api.admin.templates.editor-css.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@serveEditorCss`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/component-styles HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: http-200 — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: http-200 — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/admin/templates/{identifier}/editor/component-styles.css
<!-- @generated:start:api.admin.templates.editor-css -->
- **라우트명**: `api.admin.templates.editor-css`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@serveEditorCss`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/component-styles.css HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: http-404 — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: http-404 — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃 편집기 프리뷰 전용 CSS를 서빙합니다. 편집기 진입 시에만 components.css의 다크 조상 셀렉터를 프리뷰 마커로 치환하고(editor-spec `darkMode.previewIsolation` 규칙), 필요 시 `@layer` 래퍼를 평탄화해 라이트/다크 프리뷰를 격리합니다. 변환 결과는 캐시 버전+파일 mtime 키로 캐시하며, CSS 부재 시 빈 응답으로 폴백합니다. `core.templates.layouts.edit` 권한이 필요합니다.

URI 가 `editor/components.css` 가 아니라 `editor/component-styles.css` 인 이유는 [자산 URL 이중 모드](README.md#자산-url-이중-모드) 때문입니다. 확장자를 뗀 형태(`editor/components`)가 `editor/components.json` 의 확장자 없는 형태와 충돌하므로 CSS 쪽 URI 를 분리했습니다. 확장자 없는 형태는 `editor/component-styles` 입니다.


### GET /api/admin/templates/{identifier}/editor/components
<!-- @generated:start:api.admin.templates.editor-components.extensionless -->
- **라우트명**: `api.admin.templates.editor-components.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@serveComponents`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/components HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

_단건 응답: `data` 객체의 필드._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| $schema | string | `https://json-schema.org/draft/2020-12…` | <!-- TODO: 설명 --> |
| templateId | string | `sirsoft-admin_basic` | <!-- TODO: 설명 --> |
| version | string | `1.0.0` | 템플릿 버전 (예: 1.0.0) |
| components | object | `{"basic":[{"name":"Button","type":"basic","description":"…` | <!-- TODO: 설명 --> |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "템플릿 설정 정보를 조회했습니다.",
    "data": {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "templateId": "sirsoft-admin_basic",
        "version": "1.0.0",
        "...": "(1개 키 생략, 총 4개)"
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/admin/templates/{identifier}/editor/components.json
<!-- @generated:start:api.admin.templates.editor-components -->
- **라우트명**: `api.admin.templates.editor-components`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@serveComponents`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/components.json HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: http-404 — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: http-404 — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 편집기용 components.json(컴포넌트 정의)을 서빙합니다. 비활성 템플릿도 편집 가능하도록 활성 디렉토리 → `_bundled` 폴백으로 파일을 읽어 반환합니다. `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{identifier}/editor/editor-spec
<!-- @generated:start:api.admin.templates.editor-spec.extensionless -->
- **라우트명**: `api.admin.templates.editor-spec.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@serveEditorSpec`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/editor-spec HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

_단건 응답: `data` 객체의 필드._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| identifier | string | `sirsoft-admin_basic` | 템플릿 고유 식별자 (vendor-name 형식, 예: sirsoft-admin_basic) |
| spec | object | `{"$schema":"https:\/\/json-schema.org\/draft\/2020-12\/sc…` | 스펙 정의 객체 (편집기/컴포넌트 선언 스키마 등) |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "편집기 스펙을 조회했습니다.",
    "data": {
        "identifier": "sirsoft-admin_basic",
        "spec": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "templateId": "sirsoft-admin_basic",
            "version": "1.0.0",
            "description": "레이아웃 편집기 스펙 — Phase 3 (nesting + componentPalette 블록).  controls/componentCapabilities/actionRecipes 등은 Phase 4/5 에서 추가.",
            "styleSystem": "tailwind",
            "...": "(14개 키 생략, 총 19개)"
        }
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/admin/templates/{identifier}/editor/editor-spec.json
<!-- @generated:start:api.admin.templates.editor-spec -->
- **라우트명**: `api.admin.templates.editor-spec`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@serveEditorSpec`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/editor-spec.json HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: http-404 — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: http-404 — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 편집기 스펙(editor-spec.json)을 서빙합니다. 분할 스펙은 manifest + `$include` 블록을 합본한 단일 spec으로 반환하며(활성 디렉토리 기준), sampleData/sampleGlobal/states 등 전 블록이 포함됩니다. 파일 미존재 시 `spec=null`로 폴백합니다. `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{identifier}/editor/lang/{locale}
<!-- @generated:start:api.admin.templates.editor-lang.extensionless -->
- **라우트명**: `api.admin.templates.editor-lang.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@serveLanguage`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| locale | path | string | 예 | — | 로케일 코드 (표시 언어/지역) |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/lang/{locale} HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/admin/templates/{identifier}/editor/lang/{locale}.json
<!-- @generated:start:api.admin.templates.editor-lang -->
- **라우트명**: `api.admin.templates.editor-lang`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@serveLanguage`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| locale | path | string | 예 | — | 로케일 코드 (표시 언어/지역) |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/lang/{locale}.json HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 편집기용 다국어 데이터(lang/{locale}.json)를 서빙합니다. 활성 상태 검증 없이 활성 디렉토리 → `_bundled` 폴백으로 읽으며, 파일 부재 시 빈 객체로 폴백합니다. `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{identifier}/editor/permission-candidates
<!-- @generated:start:api.admin.templates.editor-permission-candidates.extensionless -->
- **라우트명**: `api.admin.templates.editor-permission-candidates.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@servePermissionCandidates`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/permission-candidates HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

_단건 응답: `data` 객체의 필드._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| identifier | string | `sirsoft-admin_basic` | 템플릿 고유 식별자 (vendor-name 형식, 예: sirsoft-admin_basic) |
| permissions | array | `[{"key":"sirsoft-ecommerce.user-products.read","name":"상품…` | 권한 목록 (각 원소 id/identifier/name — permissions 관계 또는 역할 경유 파생) |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "템플릿 설정 정보를 조회했습니다.",
    "data": {
        "identifier": "sirsoft-admin_basic",
        "permissions": [
            {
                "key": "sirsoft-ecommerce.user-products.read",
                "name": "상품 조회"
            },
            {
                "key": "sirsoft-ecommerce.user-orders.create",
                "name": "주문하기"
            },
            {
                "key": "sirsoft-ecommerce.user-orders.cancel",
                "name": "주문 취소"
            },
            {
                "key": "sirsoft-ecommerce.user-orders.confirm",
                "name": "구매확정"
            },
            {
                "key": "sirsoft-ecommerce.user-reviews.write",
                "name": "리뷰 작성"
            },
            "... (총 275건 중 5건 표시)"
        ]
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/admin/templates/{identifier}/editor/permission-candidates.json
<!-- @generated:start:api.admin.templates.editor-permission-candidates -->
- **라우트명**: `api.admin.templates.editor-permission-candidates`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@servePermissionCandidates`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/permission-candidates.json HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: http-404 — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: http-404 — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃 편집기의 표시 권한 지정용으로 코어+활성 확장의 전체 권한을 `{key, name}` 목록으로 반환합니다(PermissionService::getPermissionCandidates). 편집기 진입 가드 하에서만 노출되어, 권한 카탈로그가 모든 admin 페이지에 상시 노출되던 방식보다 범위가 편집기로 한정됩니다. `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{identifier}/editor/routes
<!-- @generated:start:api.admin.templates.editor-routes.extensionless -->
- **라우트명**: `api.admin.templates.editor-routes.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@serveRoutes`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/routes HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

_단건 응답: `data` 객체의 필드._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| version | string | `1.0.0` | 템플릿 버전 (예: 1.0.0) |
| routes | array | `[{"path":"*\/admin","redirect":"\/admin\/dashboard","auth…` | <!-- TODO: 설명 --> |
| base_layouts | array | `[{"layout_name":"_admin_base","label":null}]` | <!-- TODO: 설명 --> |
| modals | array | `[{"modal_id":"identity-challenge-modal","host_layout":"_a…` | <!-- TODO: 설명 --> |
| layout_versions | array | `[]` | <!-- TODO: 설명 --> |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "템플릿 라우트 정보를 조회했습니다.",
    "data": {
        "version": "1.0.0",
        "routes": [
            {
                "path": "*/admin",
                "redirect": "/admin/dashboard",
                "auth_required": true,
                "meta": {
                    "title": "관리자"
                },
                "source": {
                    "kind": "template",
                    "identifier": null
                }
            },
            {
                "path": "*/admin/login",
                "layout": "admin_login",
                "auth_required": false,
                "meta": {
                    "title": "관리자 로그인"
                },
                "source": {
                    "kind": "template",
                    "identifier": null
                }
            },
            {
                "path": "*/admin/forgot-password",
                "layout": "admin_forgot_password",
                "auth_required": false,
                "meta": {
                    "title": "$t:auth.forgot_password.title"
                },
                "source": {
                    "kind": "template",
                    "identifier": null
                }
            },
            {
                "path": "*/admin/reset-password",
                "layout": "admin_reset_password",
                "auth_required": false,
                "meta": {
                    "title": "$t:auth.reset_password.title"
                },
                "source": {
                    "kind": "template",
                    "identifier": null
                }
            },
            {
                "path": "*/admin/dashboard",
                "layout": "admin_dashboard",
                "auth_required": true,
                "meta": {
                    "title": "관리자 대시보드"
                },
                "source": {
                    "kind": "template",
                    "identifier": null
                }
            },
            "... (총 85건 중 5건 표시)"
        ],
        "base_layouts": [
            {
                "layout_name": "_admin_base",
                "label": null
            }
        ],
        "modals": [
            {
                "modal_id": "identity-challenge-modal",
                "host_layout": "_admin_base",
                "label": "$t:admin.modal_label.identity_challenge_modal"
            },
            {
                "modal_id": "license_modal",
                "host_layout": "_admin_base",
                "label": "$t:admin.modal_label.license_modal"
            },
            {
                "modal_id": "changelog_modal",
                "host_layout": "_admin_base",
                "label": "$t:admin.modal_label.changelog_modal"
            },
            {
                "modal_id": "notification_delete_all_confirm_modal",
                "host_layout": "_admin_base",
                "label": "$t:admin.modal_label.notification_delete_all_confirm_modal"
            },
            {
                "modal_id": "delete_confirm_modal",
                "host_layout": "admin_activity_log_list",
                "label": "$t:admin.modal_label.activity_log_list.delete_confirm_modal"
            },
            "... (총 205건 중 5건 표시)"
        ],
        "layout_versions": []
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/admin/templates/{identifier}/editor/routes.json
<!-- @generated:start:api.admin.templates.editor-routes -->
- **라우트명**: `api.admin.templates.editor-routes`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateAssetController@serveRoutes`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/routes.json HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: http-404 — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: http-404 — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 편집기 라우트 트리용 routes.json을 서빙합니다. 각 라우트에 `source`(kind/identifier) 태깅과 모듈/플러그인 라우트 병합을 적용해(TemplateService::getEditorRoutesDataWithModules) 클라이언트가 출처별로 그룹핑할 수 있게 하며, 활성/비활성 무관 + `_bundled` 폴백으로 동작합니다. `core.templates.layouts.edit` 권한이 필요합니다.


### POST /api/admin/templates/{identifier}/editor/seo-bot-preview
<!-- @generated:start:api.admin.templates.editor-seo-bot-preview -->
- **라우트명**: `api.admin.templates.editor-seo-bot-preview`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\SeoBotPreviewController@show`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| layout | body | array | 예 | — | 편집 중인(dirty) 레이아웃 JSON 전체 (봇 HTML 렌더 대상) |
| route_params | body | array | 아니오 | — | 렌더 시 주입할 라우트 path 파라미터 맵 (예: 게시글 id 등 URL 동적 세그먼트) |
| url | body | string | 아니오 | — | 미리보기 기준 URL |
| locale | body | string | 아니오 | — | 로케일 코드 (표시 언어/지역) |
| module_id | body | string | 아니오 | — | module 식별자 |
| plugin_id | body | string | 아니오 | — | plugin 식별자 |
| seed_context | body | array | 아니오 | — | 렌더 컨텍스트 시드 데이터 (편집기 샘플 데이터 — 데이터소스/전역/로컬 값 대체) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.seo_bot_preview.show_validation_rules`).

**요청 예시**

```http
POST /api/admin/templates/sirsoft-admin_basic/editor/seo-bot-preview HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "layout": [
        "예시값"
    ],
    "route_params": [
        "예시값"
    ],
    "url": "https://example.com",
    "locale": "ko",
    "module_id": "예시값",
    "plugin_id": "예시값",
    "seed_context": [
        "예시값"
    ]
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 편집기 [검색엔진] 탭의 봇 HTML 실시간 미리보기를 반환합니다. dirty 레이아웃 + 편집기 샘플 데이터로 운영과 동일한 렌더 경로를 거쳐(SEO 캐시 우회) 완성 HTML을 만들며, `meta.seo.enabled=false`이거나 미렌더 시 `enabled=false`로 미노출을 안내합니다. `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{identifier}/editor/seo-candidates
<!-- @generated:start:api.admin.templates.editor-seo-candidates.extensionless -->
- **라우트명**: `api.admin.templates.editor-seo-candidates.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\SeoCandidateController@index`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| extensions | query | string | 아니오 | — | <!-- TODO: 용도 --> |
| page_type | query | string | 아니오 | — | <!-- TODO: 용도 --> |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.seo_candidate.index_validation_rules`).

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/seo-candidates?extensions=%EC%98%88%EC%8B%9C%EA%B0%92&page_type=%EC%98%88%EC%8B%9C%EA%B0%92 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

_단건 응답: `data` 객체의 필드._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| identifier | string | `sirsoft-admin_basic` | 템플릿 고유 식별자 (vendor-name 형식, 예: sirsoft-admin_basic) |
| page_types | array | `[{"value":"boards","owner":{"type":"module","id":"sirsoft…` | <!-- TODO: 설명 --> |
| toggle_settings | array | `[{"ref":"$module_settings:sirsoft-board:seo.seo_boards","…` | <!-- TODO: 설명 --> |
| vars | array | `[]` | <!-- TODO: 설명 --> |
| extensions | array | `[{"type":"module","id":"gnuboard7-hello_module","label":"…` | <!-- TODO: 설명 --> |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "성공적으로 처리되었습니다.",
    "data": {
        "identifier": "sirsoft-admin_basic",
        "page_types": [
            {
                "value": "boards",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-board"
                }
            },
            {
                "value": "board",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-board"
                }
            },
            {
                "value": "post",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-board"
                }
            },
            {
                "value": "product",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-ecommerce"
                }
            },
            {
                "value": "category",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-ecommerce"
                }
            },
            {
                "value": "search",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-ecommerce"
                }
            },
            {
                "value": "shop_index",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-ecommerce"
                }
            }
        ],
        "toggle_settings": [
            {
                "ref": "$module_settings:sirsoft-board:seo.seo_boards",
                "key": "seo_boards",
                "label": "seo_boards",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-board"
                }
            },
            {
                "ref": "$module_settings:sirsoft-board:seo.seo_board",
                "key": "seo_board",
                "label": "seo_board",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-board"
                }
            },
            {
                "ref": "$module_settings:sirsoft-board:seo.seo_post_detail",
                "key": "seo_post_detail",
                "label": "seo_post_detail",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-board"
                }
            },
            {
                "ref": "$module_settings:sirsoft-ecommerce:seo.seo_category",
                "key": "seo_category",
                "label": "seo_category",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-ecommerce"
                }
            },
            {
                "ref": "$module_settings:sirsoft-ecommerce:seo.seo_search_result",
                "key": "seo_search_result",
                "label": "seo_search_result",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-ecommerce"
                }
            },
            {
                "ref": "$module_settings:sirsoft-ecommerce:seo.seo_product_detail",
                "key": "seo_product_detail",
                "label": "seo_product_detail",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-ecommerce"
                }
            },
            {
                "ref": "$module_settings:sirsoft-ecommerce:seo.seo_shop_index",
                "key": "seo_shop_index",
                "label": "seo_shop_index",
                "owner": {
                    "type": "module",
                    "id": "sirsoft-ecommerce"
                }
            }
        ],
        "vars": [],
        "extensions": [
            {
                "type": "module",
                "id": "gnuboard7-hello_module",
                "label": "Hello 모듈"
            },
            {
                "type": "module",
                "id": "sirsoft-board",
                "label": "게시판"
            },
            {
                "type": "module",
                "id": "sirsoft-ecommerce",
                "label": "이커머스"
            },
            {
                "type": "module",
                "id": "sirsoft-page",
                "label": "페이지"
            },
            {
                "type": "plugin",
                "id": "sirsoft-ckeditor5",
                "label": "CKEditor 5 WYSIWYG 에디터"
            },
            {
                "type": "plugin",
                "id": "sirsoft-daum_postcode",
                "label": "Daum 우편번호"
            },
            {
                "type": "plugin",
                "id": "sirsoft-gdpr",
                "label": "GDPR (일반 데이터 보호 규정)"
            },
            {
                "type": "plugin",
                "id": "sirsoft-marketing",
                "label": "마케팅 동의"
            },
            {
                "type": "plugin",
                "id": "sirsoft-pay_kginicis",
                "label": "KG 이니시스"
            },
            {
                "type": "plugin",
                "id": "sirsoft-pay_nhnkcp",
                "label": "NHN KCP"
            },
            {
                "type": "plugin",
                "id": "sirsoft-pay_nicepayments",
                "label": "나이스페이먼츠"
            },
            {
                "type": "plugin",
                "id": "sirsoft-verification_kginicis",
                "label": "KG이니시스 본인인증"
            }
        ]
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/admin/templates/{identifier}/editor/seo-candidates.json
<!-- @generated:start:api.admin.templates.editor-seo-candidates -->
- **라우트명**: `api.admin.templates.editor-seo-candidates`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\SeoCandidateController@index`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| extensions | query | string | 아니오 | — | 편집 중 레이아웃 문맥의 확장 목록 (JSON `[{type, id}]` 문자열 또는 배열 — SEO 후보 범위 결정용) |
| page_type | query | string | 아니오 | — | 편집 중 레이아웃의 페이지 유형 (page_type별 SEO 후보/토글 설정 필터) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.seo_candidate.index_validation_rules`).

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/editor/seo-candidates.json?extensions=%EC%98%88%EC%8B%9C%EA%B0%92&page_type=%EC%98%88%EC%8B%9C%EA%B0%92 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: http-404 — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: http-404 — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 편집기 [검색엔진] 탭의 SEO 후보(page_type/toggle_setting/유효 vars)를 한 번에 공급합니다(SeoCandidateService::collect). `extensions`(JSON `[{type,id}]`)와 `page_type` query로 편집 중 레이아웃 문맥을 전달하며, 후보 미존재 시 빈 목록 → 자유 텍스트 폴백입니다. `core.templates.layouts.edit` 권한이 필요합니다.


### POST /api/admin/templates/{identifier}/editor/seo-og-preview
<!-- @generated:start:api.admin.templates.editor-seo-og-preview -->
- **라우트명**: `api.admin.templates.editor-seo-og-preview`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\SeoOgPreviewController@show`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| seo | body | array | 예 | — | 편집 중인(dirty) meta.seo 설정 전체 (base 병합본 — og/twitter cascade 계산 대상) |
| own_seo | body | array | 아니오 | — | 이 레이아웃이 직접 선언한 meta.seo (base 병합 전) — 병합본에만 있는 키를 base 상속으로 판정하는 근거 |
| seed_context | body | array | 아니오 | — | 렌더 컨텍스트 시드 데이터 (편집기 샘플 데이터 — 미리보기 값 계산용) |
| route_params | body | array | 아니오 | — | 렌더 시 주입할 라우트 path 파라미터 맵 (URL 동적 세그먼트) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.seo_og_preview.show_validation_rules`).

**요청 예시**

```http
POST /api/admin/templates/sirsoft-admin_basic/editor/seo-og-preview HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "seo": [
        "예시값"
    ],
    "own_seo": [
        "예시값"
    ],
    "seed_context": [
        "예시값"
    ],
    "route_params": [
        "예시값"
    ]
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 편집기 [검색엔진] 탭의 OG/Twitter/구조화 데이터 미리보기를 반환합니다. dirty `meta.seo` + 샘플로 og/twitter cascade를 실제 계산하고 필터 전/후 diff로 각 키의 출처·잠김을 산출합니다(SeoOgPreviewService::preview). `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{identifier}/layout-attachments
<!-- @generated:start:api.admin.templates.layout-attachments.index -->
- **라우트명**: `api.admin.templates.layout-attachments.index`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateLayoutAttachmentController@index`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| layout_name | query | string | 아니오 | max 150 | layout 이름 (식별자) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.template_layout_attachment.list_validation_rules`).

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/layout-attachments?layout_name=%EC%98%88%EC%8B%9C%20%EC%9D%B4%EB%A6%84 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)



<!-- 실측 응답에 필드 없음(빈 목록 등) — 데이터가 있는 상태로 재실측하거나 사람이 작성. -->

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "첨부 파일 목록을 조회했습니다.",
    "data": []
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 해당 템플릿의 레이아웃 첨부(배경 이미지 등) 목록을 조회합니다(ImagePickerControl의 이미지 재선택용). `layout_name` query로 특정 레이아웃의 첨부만 필터할 수 있습니다(TemplateLayoutAttachmentService::list). `core.templates.layouts.edit` 권한이 필요합니다.


### POST /api/admin/templates/{identifier}/layout-attachments
<!-- @generated:start:api.admin.templates.layout-attachments.store -->
- **라우트명**: `api.admin.templates.layout-attachments.store`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\AdminTemplateLayoutAttachmentController@store`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| file | body | file | 예 | max 10240 | 업로드 파일 |
| layout_name | body | string | 아니오 | max 150 | layout 이름 (식별자) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.template_layout_attachment.upload_validation_rules`).

**요청 예시**

```http
POST /api/admin/templates/sirsoft-admin_basic/layout-attachments HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: multipart/form-data; boundary=----G7ExampleBoundary

------G7ExampleBoundary
Content-Disposition: form-data; name="file"; filename="example.pdf"
Content-Type: application/octet-stream

(바이너리 파일 내용)
------G7ExampleBoundary
Content-Disposition: form-data; name="layout_name"

예시 이름
------G7ExampleBoundary--
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃 편집 중 첨부 파일을 업로드합니다. 스토리지 저장 후 DB 행을 생성하고 접근 URL을 반환합니다(TemplateLayoutAttachmentService::upload). 최대 10MB(10240KB)까지 허용합니다. `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{identifier}/license
<!-- @generated:start:api.admin.templates.license -->
- **라우트명**: `api.admin.templates.license`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@license`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/sirsoft-admin_basic/license HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

_단건 응답: `data` 객체의 필드._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| content | string | `프로그램 명칭 : 그누보드7용 Admin Basic 템플릿 (sir…` | 본문 내용 |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "템플릿 정보를 성공적으로 가져왔습니다.",
    "data": {
        "content": "프로그램 명칭 : 그누보드7용 Admin Basic 템플릿 (sirsoft-admin_basic)\n\n저작자 : (주)에스아이알소프트\n\n----- MIT 라이선스 (한국어 번역) --------------------------------------------------------\n\nMIT 라이선스\n\nCopyright (c) 2026 (주)에스아이알소프트\n\n이 소프트웨어와 관련 문서 파일(이하 \"소프트웨어\")의 복사본을 취득하는 모든 사람에게\n소프트웨어를 제한 없이 사용, 복사, 수정, 병합, 출판, 배포, 서브라이선스 허여 및/또는\n판매할 수 있는 권리를 무상으로 부여합니다. 다만, 소프트웨어를 제공받은 사람은 다음\n조건을 따라야 합니다:\n\n위 저작권 고지와 본 허가 고지는 소프트웨어의 모든 복사본 또는 상당 부분에 포함되어야\n합니다.\n\n소프트웨어는 \"있는 그대로\" 제공되며, 명시적이든 묵시적이든 어떠한 종류의 보증도 하지\n않습니다. 여기에는 상품성, 특정 목적에의 적합성 및 비침해에 대한 보증이 포함되나 이에\n국한되지 않습니다. 어떠한 경우에도 저작자 또는 저작권자는 소프트웨어나 소프트웨어의\n사용 또는 기타 거래로 인해 발생하는 계약, 불법행위 또는 기타 청구, 손해 또는 기타\n책임에 대해 책임을 지지 않습니다.\n\n----- MIT License (English Original) --------------------------------------------------------\n\nThe MIT License (MIT)\n\nCopyright (c) 2026 SIRSOFT\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n"
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 템플릿의 라이선스 파일(LICENSE) 내용을 반환합니다(LicenseService::getExtensionLicense). 식별자는 소문자/숫자/`_`/`-` 형식만 허용하며, 파일이 없으면 404를 반환합니다. `core.templates.read` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}
<!-- @generated:start:api.admin.templates.show -->
- **라우트명**: `api.admin.templates.show`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@show`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |

**요청 예시**

```http
GET /api/admin/templates/{templateName} HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 특정 템플릿의 상세 정보를 조회합니다(TemplateService::getTemplateInfo). 목록보다 상세한 필드(toDetailArray)와 함께 지원 언어팩 정보를 주입해 반환하며, 템플릿이 없으면 404를 반환합니다. `core.templates.read` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}/check-modified-layouts
<!-- @generated:start:api.admin.templates.check-modified-layouts -->
- **라우트명**: `api.admin.templates.check-modified-layouts`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@checkModifiedLayouts`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |

**요청 예시**

```http
GET /api/admin/templates/{templateName}/check-modified-layouts HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 404 | Not Found | 해당 식별자의 템플릿이 설치되어 있지 않은 경우 (레이아웃 0건과 구분됨) |

<!-- @generated:end -->

**설명** 업데이트 전 사용자가 수정한 레이아웃이 있는지 확인합니다(TemplateService::checkModifiedLayouts). 업데이트 시 레이아웃 전략(overwrite/keep) 선택의 참고 자료로 사용합니다. `core.templates.read` 권한이 필요합니다.


### DELETE /api/admin/templates/{templateName}/custom-translations
<!-- @generated:start:api.admin.templates.custom-translations.bulk-destroy -->
- **라우트명**: `api.admin.templates.custom-translations.bulk-destroy`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateCustomTranslationController@bulkDestroy`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| ids | query | array | 예 | min 1 | 대상 리소스 식별자 배열 (대량 작업 대상) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.custom_translation.bulk_destroy_validation_rules`).

**요청 예시**

```http
DELETE /api/admin/templates/{templateName}/custom-translations?ids=%EC%98%88%EC%8B%9C%EA%B0%92 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 관리 모달의 '선택 삭제'/'미사용 전체 삭제'로 커스텀 다국어 키를 일괄 삭제합니다. 요청 `ids` 중 해당 템플릿 소속 키만 추려 삭제해(교차 템플릿 삭제 차단) 삭제 건수를 반환합니다. `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}/custom-translations
<!-- @generated:start:api.admin.templates.custom-translations.index -->
- **라우트명**: `api.admin.templates.custom-translations.index`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateCustomTranslationController@index`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| layout_name | query | string | 아니오 | max 150 | layout 이름 (식별자) |
| status | query | string | 아니오 | `active`, `orphaned` | 상태 필터 (해당 상태의 항목만 조회) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.custom_translation.index_validation_rules`).

**요청 예시**

```http
GET /api/admin/templates/{templateName}/custom-translations?layout_name=%EC%98%88%EC%8B%9C%20%EC%9D%B4%EB%A6%84&status=active HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃 편집기의 인라인 편집/번역 탭에서 사용하는 커스텀 다국어 키 목록을 조회합니다. `layout_name`으로 특정 레이아웃을, `status`(active/orphaned)로 사용 여부를 필터할 수 있습니다(TemplateCustomTranslationService::getList). `core.templates.layouts.edit` 권한이 필요합니다.


### POST /api/admin/templates/{templateName}/custom-translations
<!-- @generated:start:api.admin.templates.custom-translations.store -->
- **라우트명**: `api.admin.templates.custom-translations.store`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateCustomTranslationController@store`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| layout_name | body | string | 예 | max 150 | layout 이름 (식별자) |
| locale | body | string | 예 | max 35 | 로케일 코드 (표시 언어/지역) |
| value | body | string | 예 | — | 값 |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.custom_translation.store_validation_rules`).

**요청 예시**

```http
POST /api/admin/templates/{templateName}/custom-translations HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "layout_name": "예시 이름",
    "locale": "ko",
    "value": "예시값"
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 인라인 편집 확정 시 커스텀 다국어 키를 생성합니다. `layout_name`/`locale`/`value`를 받아 트랜잭션으로 키를 만들고 생성자를 기록합니다(TemplateCustomTranslationService::createKey). `core.templates.layouts.edit` 권한이 필요합니다.


### DELETE /api/admin/templates/{templateName}/custom-translations/{id}
<!-- @generated:start:api.admin.templates.custom-translations.destroy -->
- **라우트명**: `api.admin.templates.custom-translations.destroy`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateCustomTranslationController@destroy`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| id | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
DELETE /api/admin/templates/{templateName}/custom-translations/1 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 커스텀 다국어 키 1건을 삭제합니다. 대상 키가 경로의 템플릿 소속인지 교차검증한 뒤 삭제합니다(TemplateCustomTranslationService::deleteKey). `core.templates.layouts.edit` 권한이 필요합니다.


### PUT /api/admin/templates/{templateName}/custom-translations/{id}
<!-- @generated:start:api.admin.templates.custom-translations.update -->
- **라우트명**: `api.admin.templates.custom-translations.update`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateCustomTranslationController@update`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| id | path | string | 예 | — | 대상 리소스의 식별자 |
| values | body | array | 예 | — | 값 배열 |
| expected_lock_version | body | integer | 예 | min 0 | 낙관적 잠금 버전 (동시 편집 충돌 감지) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.custom_translation.update_validation_rules`).

**요청 예시**

```http
PUT /api/admin/templates/{templateName}/custom-translations/1 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "values": [
        "예시값"
    ],
    "expected_lock_version": 1
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 번역 탭의 일괄 편집으로 커스텀 다국어 키의 로케일별 값을 수정합니다. `expected_lock_version` 기반 낙관적 잠금을 적용해 동시 수정 충돌 시 409(current/your version)를 반환합니다(TemplateCustomTranslationService::updateValues). `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}/install-preview
<!-- @generated:start:api.admin.templates.install-preview -->
- **라우트명**: `api.admin.templates.install-preview`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@installPreview`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.install`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |

**요청 예시**

```http
GET /api/admin/templates/{templateName}/install-preview HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.install`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 템플릿 설치 cascade 프리뷰를 반환합니다. 의존 확장 목록과 동반 가능한 번들 언어팩을 미리 계산해(ExtensionInstallPreviewBuilder::build) 설치 확인 화면에서 사용합니다. `core.templates.install` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}/layout-extensions
<!-- @generated:start:api.admin.templates.layout-extensions.index -->
- **라우트명**: `api.admin.templates.layout-extensions.index`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutExtensionController@index`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |

**요청 예시**

```http
GET /api/admin/templates/{templateName}/layout-extensions HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 특정 템플릿에 모듈/플러그인이 주입한 레이아웃 확장 목록을 출처별로 그룹핑해 조회합니다. 각 확장에는 호스트 레이아웃 목록(`host_layouts`)이 부착되어, 캔버스 로드 없이 화면별 연결 확장을 정적 구성할 수 있습니다(LayoutExtensionService::getExtensionsByTemplateId). 응답에는 라우트 트리가 실제로 그리는 필드만 담기고 **확장 레이아웃 본문(`content`)은 제외됩니다** — 목록은 페이지네이션 없이 전 확장을 반환하므로 본문을 함께 실으면 전 행의 JSON 전문이 전송됩니다. 본문은 단건 조회(`GET /api/admin/templates/{template}/layout-extensions/{extension}`)가 공급합니다. `core.templates.read` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}/layout-extensions/{extensionId}
<!-- @generated:start:api.admin.templates.layout-extensions.show -->
- **라우트명**: `api.admin.templates.layout-extensions.show`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutExtensionController@show`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| extensionId | path | string | 예 | — | 대상 extension의 식별자 |

**요청 예시**

```http
GET /api/admin/templates/{templateName}/layout-extensions/{extensionId} HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 특정 레이아웃 확장 1건의 상세를 조회합니다. 확장이 경로의 템플릿 소속인지 교차검증하며, 편집 모드 캔버스가 호스트 병합 렌더에 쓰는 호스트 레이아웃 후보(`host_layouts`)를 함께 반환합니다. `core.templates.read` 권한이 필요합니다.


### PUT /api/admin/templates/{templateName}/layout-extensions/{extensionId}
<!-- @generated:start:api.admin.templates.layout-extensions.update -->
- **라우트명**: `api.admin.templates.layout-extensions.update`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutExtensionController@update`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| extensionId | path | string | 예 | — | 대상 extension의 식별자 |
| expected_lock_version | body | integer | 예 | min 0 | 낙관적 잠금 버전 (동시 편집 충돌 감지) |
| content | body | array | 예 | — | 본문 내용 |
| priority | body | integer | 아니오 | min 0, max 9999 | 우선순위 (작을수록 우선) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.layout_extension.update_content_validation_rules`).

**요청 예시**

```http
PUT /api/admin/templates/{templateName}/layout-extensions/{extensionId} HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "expected_lock_version": 1,
    "content": [
        "예시 내용입니다."
    ],
    "priority": 1
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃 확장의 content를 수정합니다. `expected_lock_version` 기반 낙관적 잠금으로 동시 수정 시 409를 반환하며, `content`는 최상위 키(extension_point/components 등) 누락을 막기 위해 검증된 하위 규칙이 아닌 원본 배열을 그대로 저장합니다. `priority`도 함께 갱신할 수 있습니다. `core.templates.layouts.edit` 권한이 필요합니다.


### POST /api/admin/templates/{templateName}/layout-extensions/{extensionId}/preview
<!-- @generated:start:api.admin.templates.layout-extensions.preview.store -->
- **라우트명**: `api.admin.templates.layout-extensions.preview.store`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutExtensionController@storePreview`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| extensionId | path | string | 예 | — | 대상 extension의 식별자 |
| content | body | array | 예 | — | 본문 내용 |
| preview_layout | body | string | 아니오 | max 255 | 미리보기에 사용할 대표 레이아웃명 (extension_point 타입 시 필수, overlay 타입은 target_layout 자체가 대표라 생략 가능) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.layout_extension.store_preview_validation_rules`).

**요청 예시**

```http
POST /api/admin/templates/{templateName}/layout-extensions/{extensionId}/preview HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "content": [
        "예시 내용입니다."
    ],
    "preview_layout": "예시값"
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 편집 중인 레이아웃 확장 content를 임시 저장하고 대표 레이아웃에 적용한 미리보기 URL/토큰을 반환합니다. overlay 타입은 target_name이, extension_point 타입은 `preview_layout` 파라미터가 대표 레이아웃이 되며, 미지정 시 422를 반환합니다(LayoutPreviewService::createExtensionPreview). `core.templates.read` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}/layout-extensions/{extensionId}/versions
<!-- @generated:start:api.admin.templates.layout-extensions.versions.index -->
- **라우트명**: `api.admin.templates.layout-extensions.versions.index`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutExtensionController@versions`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| extensionId | path | string | 예 | — | 대상 extension의 식별자 |
| limit | query | integer | 아니오 | min 1, max 500 | 반환할 최대 항목 수 |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.layout_version.list_validation_rules`).

**요청 예시**

```http
GET /api/admin/templates/{templateName}/layout-extensions/{extensionId}/versions?limit=1 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃 확장의 버전 이력을 최신순으로 조회합니다(LayoutExtensionService::getExtensionVersions). 한 번에 돌려주는 개수는 `limit` 으로 정하며 기본 100건, 최대 500건입니다 — 전체를 무제한으로 돌려주지 않습니다. 상한을 넘는 과거 버전은 단건 조회로 접근합니다. `core.templates.read` 권한이 필요합니다. 응답에는 목록 표시용 필드만 담기고 본문(`content`)은 제외됩니다.


### POST /api/admin/templates/{templateName}/layout-extensions/{extensionId}/versions/{versionId}/restore
<!-- @generated:start:api.admin.templates.layout-extensions.versions.restore -->
- **라우트명**: `api.admin.templates.layout-extensions.versions.restore`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutExtensionController@restoreVersion`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| extensionId | path | string | 예 | — | 대상 extension의 식별자 |
| versionId | path | string | 예 | — | 대상 version의 식별자 |

**요청 예시**

```http
POST /api/admin/templates/{templateName}/layout-extensions/{extensionId}/versions/{versionId}/restore HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃 확장을 지정한 버전으로 복원합니다. 복원은 새 버전으로 기록되며 복원 후 새 버전 정보를 반환합니다(LayoutExtensionService::restoreExtensionVersion). `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}/layout-extensions/{extensionId}/versions/{version}
<!-- @generated:start:api.admin.templates.layout-extensions.versions.show -->
- **라우트명**: `api.admin.templates.layout-extensions.versions.show`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutExtensionController@showVersion`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| extensionId | path | string | 예 | — | 대상 extension의 식별자 |
| version | path | string | 예 | — | 대상 버전 (버전 문자열) |

**요청 예시**

```http
GET /api/admin/templates/{templateName}/layout-extensions/{extensionId}/versions/{version} HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃 확장의 특정 버전 content를 조회합니다(버전 비교/diff용, LayoutExtensionService::getExtensionVersion). `core.templates.read` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}/layouts
<!-- @generated:start:api.admin.templates.layouts.index -->
- **라우트명**: `api.admin.templates.layouts.index`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutController@index`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |

**요청 예시**

```http
GET /api/admin/templates/{templateName}/layouts HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부, 배열의 각 항목)

| 필드 | 타입 | 설명 |
| --- | --- | --- |
| id | integer | 레이아웃 ID |
| template_id | integer | 소속 템플릿 ID |
| name | string | 레이아웃 이름 (예: `_admin_base`, `admin_user_list`) |
| description | string | 레이아웃 설명. 본문의 `meta.description` 에서 파생한다. 그 값은 레이아웃을 **소유한 템플릿**의 사전 키(`$t:user.base_layout_description` 등)일 수 있으므로 서버가 해당 템플릿 사전(활성 로케일)으로 해석해 내보낸다. 사전에 키가 없거나 `{{...}}` 표현식이어서 해석할 수 없으면 레이아웃 **이름**으로 폴백한다 — 번역 토큰이나 표현식 원문이 화면에 노출되지 않는다. 목록·상세 응답이 같은 규칙을 쓴다 |
| route_path | string\|null | 이 레이아웃을 사용하는 라우트 path (routes.json 기준). 매핑이 없으면 null |
| size | integer | 본문 크기(바이트) |
| size_formatted | string | 사람이 읽는 크기 표기 (예: `176.9 KB`) |
| has_update | boolean | 템플릿 파일 대비 갱신 여부 (현재 항상 false) |
| lock_version | integer | 낙관적 잠금 버전. 편집 저장 시 `expected_lock_version` 으로 전달 |
| created_at | string | 생성 일시 |
| updated_at | string | 최종 수정 일시 |

목록 응답에는 본문(`content`)과 본문에서 파생되는 구조(`components` · `data_sources` · `metadata` · `endpoint`)가 **포함되지 않습니다**. 파일 목록 화면은 위 필드만 사용하고, 편집 대상 본문은 상세 엔드포인트(`GET .../layouts/{name}`)가 제공합니다. 목록에 본문을 함께 실으면 레이아웃 수에 비례해 응답이 커져(실측: 102개 기준 18MB) 브라우저 메모리를 압박합니다.

**응답 예시**

```json
{
  "success": true,
  "message": "요청이 성공했습니다.",
  "data": [
    {
      "id": 1,
      "template_id": 1,
      "name": "_admin_base",
      "description": "관리자 기본 레이아웃",
      "route_path": null,
      "size": 181146,
      "size_formatted": "176.9 KB",
      "has_update": false,
      "lock_version": 3,
      "created_at": "2026-07-28T09:35:50.000000Z",
      "updated_at": "2026-07-28T09:35:50.000000Z"
    },
    {
      "id": 2,
      "template_id": 1,
      "name": "admin_user_list",
      "description": "사용자 관리",
      "route_path": "*/admin/users",
      "size": 42130,
      "size_formatted": "41.1 KB",
      "has_update": false,
      "lock_version": 0,
      "created_at": "2026-07-28T09:35:50.000000Z",
      "updated_at": "2026-07-28T09:35:50.000000Z"
    }
  ]
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 특정 템플릿의 모든 레이아웃 목록을 조회합니다. 각 레이아웃에 이름 → 라우트 path 매핑을 부착해, 코드 편집기가 파일 선택 시 `?route=` URL 동기화나 위지윅에서 넘어온 라우트로 파일을 복원할 수 있게 합니다(LayoutService::getLayoutListByTemplateId). 응답에는 파일트리가 실제로 그리는 필드(이름·설명·라우트 path·크기·수정일시·업데이트 여부)만 담기고, **레이아웃 본문(`content`)과 파싱된 블록(`components`·`data_sources`·`metadata`)은 제외됩니다** — 목록은 페이지네이션 없이 템플릿의 전 레이아웃을 반환하므로 본문을 함께 실으면 편집기 진입만으로 모든 레이아웃 JSON 전문이 전송됩니다. 설명·크기는 조회 계층이 본문에서 파생값만 뽑아 넘기며 본문 자체는 응답에 남지 않습니다. 본문은 단건 조회(`GET /api/admin/templates/{template}/layouts/{layout}`)가 공급합니다. `core.templates.read` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}/layouts/{name}
<!-- @generated:start:api.admin.templates.layouts.show -->
- **라우트명**: `api.admin.templates.layouts.show`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutController@show`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| name | path | string | 예 | — | 대상의 이름/명칭 |

**요청 예시**

```http
GET /api/admin/templates/{templateName}/layouts/{name} HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 특정 레이아웃 1건의 상세(content 포함)를 조회합니다(LayoutService::getLayoutByName). 레이아웃이 없으면 404를 반환합니다. `core.templates.read` 권한이 필요합니다.


### PUT /api/admin/templates/{templateName}/layouts/{name}
<!-- @generated:start:api.admin.templates.layouts.update -->
- **라우트명**: `api.admin.templates.layouts.update`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutController@update`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| name | path | string | 예 | — | 대상의 이름/명칭 |
| expected_lock_version | body | integer | 예 | min 0 | 낙관적 잠금 버전 (동시 편집 충돌 감지) |
| content | body | array | 예 | — | 본문 내용 |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.layout.update_content_validation_rules`).

**요청 예시**

```http
PUT /api/admin/templates/{templateName}/layouts/{name} HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "expected_lock_version": 1,
    "content": [
        "예시 내용입니다."
    ]
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃 content를 수정합니다. `expected_lock_version` 기반 낙관적 잠금을 적용해 동시 수정 충돌 시 409(current/your version)를 반환합니다(LayoutService::updateLayout). `core.templates.layouts.edit` 권한이 필요합니다.


### POST /api/admin/templates/{templateName}/layouts/{name}/preview
<!-- @generated:start:api.admin.templates.layouts.preview.store -->
- **라우트명**: `api.admin.templates.layouts.preview.store`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutController@storePreview`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| name | path | string | 예 | — | 대상의 이름/명칭 |
| content | body | array | 예 | — | 본문 내용 |

**요청 예시**

```http
POST /api/admin/templates/{templateName}/layouts/{name}/preview HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "content": [
        "예시 내용입니다."
    ]
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 편집 중인 레이아웃 content를 임시 저장하고 미리보기 URL/토큰을 반환합니다(LayoutPreviewService::createPreview). 토큰은 만료 시각을 함께 반환합니다. `core.templates.read` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}/layouts/{name}/versions
<!-- @generated:start:api.admin.templates.layouts.versions.index -->
- **라우트명**: `api.admin.templates.layouts.versions.index`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutController@versions`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| name | path | string | 예 | — | 대상의 이름/명칭 |
| limit | query | integer | 아니오 | min 1, max 500 | 반환할 최대 항목 수 |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.layout_version.list_validation_rules`).

**요청 예시**

```http
GET /api/admin/templates/{templateName}/layouts/{name}/versions?limit=1 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃의 버전 이력을 최신순으로 조회합니다(LayoutService::getLayoutVersions). 한 번에 돌려주는 개수는 `limit` 으로 정하며 기본 100건, 최대 500건입니다 — 전체를 무제한으로 돌려주지 않습니다. 상한을 넘는 과거 버전은 단건 조회(`GET .../versions/{version}`)로 접근합니다. `core.templates.read` 권한이 필요합니다. 응답에는 목록 표시용 필드만 담기고 본문(`components` 등)은 제외됩니다.


### POST /api/admin/templates/{templateName}/layouts/{name}/versions/{versionId}/restore
<!-- @generated:start:api.admin.templates.layouts.versions.restore -->
- **라우트명**: `api.admin.templates.layouts.versions.restore`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutController@restoreVersion`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.layouts.edit`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| name | path | string | 예 | — | 대상의 이름/명칭 |
| versionId | path | string | 예 | — | 대상 version의 식별자 |

**요청 예시**

```http
POST /api/admin/templates/{templateName}/layouts/{name}/versions/{versionId}/restore HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.layouts.edit`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃을 지정한 버전으로 복원합니다. 복원 결과는 새 버전으로 기록되어 반환됩니다(LayoutService::restoreVersion). `core.templates.layouts.edit` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}/layouts/{name}/versions/{version}
<!-- @generated:start:api.admin.templates.layouts.versions.show -->
- **라우트명**: `api.admin.templates.layouts.versions.show`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\LayoutController@showVersion`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.read`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| name | path | string | 예 | — | 대상의 이름/명칭 |
| version | path | string | 예 | — | 대상 버전 (버전 문자열) |

**요청 예시**

```http
GET /api/admin/templates/{templateName}/layouts/{name}/versions/{version} HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.read`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃의 특정 버전 content를 조회합니다. 버전 비교 diff용으로 slots/extends 등을 포함한 content 원본 전체를 노출합니다(LayoutService::getLayoutVersion). `core.templates.read` 권한이 필요합니다.


### GET /api/admin/templates/{templateName}/uninstall-info
<!-- @generated:start:api.admin.templates.uninstall-info -->
- **라우트명**: `api.admin.templates.uninstall-info`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@uninstallInfo`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.uninstall`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |

**요청 예시**

```http
GET /api/admin/templates/{templateName}/uninstall-info HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.uninstall`)이 없는 경우 |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 템플릿 제거 시 함께 삭제될 데이터 정보를 조회합니다(TemplateService::getTemplateUninstallInfo). 제거 확인 다이얼로그에서 사용하며, 템플릿이 없으면 404를 반환합니다. `core.templates.uninstall` 권한이 필요합니다.


### POST /api/admin/templates/{templateName}/update
<!-- @generated:start:api.admin.templates.update -->
- **라우트명**: `api.admin.templates.update`
- **컨트롤러**: `App\Http\Controllers\Api\Admin\TemplateController@performUpdate`
- **인증/권한**: `auth:sanctum` + `permission:core.templates.install`

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| templateName | path | string | 예 | — | 대상 template의 이름 (식별자) |
| layout_strategy | body | string | 아니오 | `overwrite`, `keep` | 업데이트 시 레이아웃 처리 전략 (overwrite: 새 파일로 전면 교체, keep: 사용자 수정 레이아웃 유지) |
| force | body | boolean | 아니오 | — | 강제 실행 여부 (안전 확인/선행 검사 우회) |

> 이 엔드포인트는 확장이 파라미터를 추가할 수 있습니다 (`core.template.perform_update_validation_rules`).

**요청 예시**

```http
POST /api/admin/templates/{templateName}/update HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer {YOUR_TOKEN}
Content-Type: application/json

{
    "layout_strategy": "overwrite",
    "force": true
}
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: side-effectful-write — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: side-effectful-write — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 401 | Unauthenticated | 유효한 Bearer 토큰이 없거나 만료된 경우 |
| 403 | Forbidden | 요구 권한(`core.templates.install`)이 없는 경우 |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 설치된 템플릿을 최신 버전으로 업데이트합니다. `layout_strategy`(overwrite: 레이아웃 전면 교체 / keep: 사용자 수정 레이아웃 유지)로 레이아웃 처리 방식을 결정하며, `force`로 강제 진행할 수 있습니다(TemplateService::performVersionUpdate). `core.templates.install` 권한이 필요합니다. `keep` 을 지정하면 사용자가 수정한 레이아웃(원본 해시와 현재 내용이 다른 레이아웃)은 갱신 대상에서 제외되어 현재 내용이 그대로 유지되고, 나머지 레이아웃만 파일 기준으로 갱신됩니다. 성공 응답 메시지에는 대상 식별자와 적용된 버전이 채워집니다.


### GET /api/templates/assets/{identifier}
<!-- @generated:start:api.public.templates.assets.extensionless -->
- **라우트명**: `api.public.templates.assets.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Public\PublicTemplateController@serveAsset`
- **인증/권한**: 공개 (인증 불필요)

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| path | query | string | 예 | — | 경로 |

**요청 예시**

```http
GET /api/templates/assets/sirsoft-admin_basic?identifier=example-key&path=%EC%98%88%EC%8B%9C%EA%B0%92 HTTP/1.1
Host: api.example.com
Accept: application/json
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: http-422 — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: http-422 — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/templates/assets/{identifier}/{path}
<!-- @generated:start:api.public.templates.assets -->
- **라우트명**: `api.public.templates.assets`
- **컨트롤러**: `App\Http\Controllers\Api\Public\PublicTemplateController@serveAsset`
- **인증/권한**: 공개 (인증 불필요)

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| path | path | string | 예 | — | 경로 |

**요청 예시**

```http
GET /api/templates/assets/sirsoft-admin_basic/{path}?identifier=example-key HTTP/1.1
Host: api.example.com
Accept: application/json
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 422 | Unprocessable Entity | 요청 파라미터가 검증 규칙을 위반한 경우 (`error.errors` 에 필드별 메시지) |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 템플릿의 정적 자산 파일(JS/CSS/이미지 등)을 서빙하는 공개 엔드포인트입니다. FormRequest에서 경로 보안 검증을 마친 뒤 파일을 조회하며(TemplateService::getAssetFilePath), ETag 및 장기 캐싱 헤더와 함께 반환합니다. 허용되지 않은 파일 유형은 403, 파일 부재 시 404입니다. 인증이 필요 없습니다.


### GET /api/templates/{identifier}/components
<!-- @generated:start:api.public.templates.components.extensionless -->
- **라우트명**: `api.public.templates.components.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Public\PublicTemplateController@serveComponents`
- **인증/권한**: 공개 (인증 불필요)

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/templates/sirsoft-admin_basic/components HTTP/1.1
Host: api.example.com
Accept: application/json
```

**응답 필드** (`data` 내부)



<!-- 실측 응답에 필드 없음(빈 목록 등) — 데이터가 있는 상태로 재실측하거나 사람이 작성. -->

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "templateId": "sirsoft-admin_basic",
    "version": "1.0.0",
    "...": "(1개 키 생략, 총 4개)"
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/templates/{identifier}/components.json
<!-- @generated:start:api.public.templates.components -->
- **라우트명**: `api.public.templates.components`
- **컨트롤러**: `App\Http\Controllers\Api\Public\PublicTemplateController@serveComponents`
- **인증/권한**: 공개 (인증 불필요)

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/templates/sirsoft-admin_basic/components.json HTTP/1.1
Host: api.example.com
Accept: application/json
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: http-404 — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: http-404 — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 템플릿의 컴포넌트 정의(components.json)를 서빙하는 공개 엔드포인트입니다(TemplateService::getComponentsFilePath). 프론트엔드 렌더 엔진 부팅에 사용하며 1시간 캐시됩니다. 인증이 필요 없습니다.


### GET /api/templates/{identifier}/config
<!-- @generated:start:api.public.templates.config.extensionless -->
- **라우트명**: `api.public.templates.config.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Public\PublicTemplateController@serveConfig`
- **인증/권한**: 공개 (인증 불필요)

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/templates/sirsoft-admin_basic/config HTTP/1.1
Host: api.example.com
Accept: application/json
```

**응답 필드** (`data` 내부)

_단건 응답: `data` 객체의 필드._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| identifier | string | `sirsoft-admin_basic` | 템플릿 고유 식별자 (vendor-name 형식, 예: sirsoft-admin_basic) |
| vendor | string | `sirsoft` | 벤더/개발자명 (예: sirsoft) |
| name | object | `{"ko":"Admin Basic","en":"Admin Basic"}` | 대상의 이름/명칭 (다국어 필드는 로케일별 값 객체) |
| version | string | `1.0.4` | 템플릿 버전 (예: 1.0.0) |
| license | string | `MIT` | <!-- TODO: 설명 --> |
| description | object | `{"ko":"그누보드7 기본 관리자 템플릿","en":"Gnuboard7 default admin te…` | 설명 (다국어 필드는 로케일별 값 객체) |
| type | string | `admin` | 템플릿 타입 (admin: 관리자용, user: 사용자용) |
| locales | array | `["ko","en"]` | 활성 로케일 코드 배열 |
| author | object | `{"name":"sirsoft","email":"contact@sirsoft.com","url":"ht…` | 작성자 사용자 객체 (uuid/name — author 관계 파생) |
| release_date | string | `2026-05-15` | <!-- TODO: 설명 --> |
| g7_version | string | `>=7.0.6` | <!-- TODO: 설명 --> |
| dependencies | object | `{"modules":[],"plugins":[]}` | 의존하는 확장 맵 (manifest 파생 — {modules, plugins}) |
| assets | object | `{"css":["assets\/css\/main.css","assets\/css\/ui-system.c…` | 프론트엔드 에셋 매니페스트 (manifest 파생 — js/css 진입점·로딩 전략) |
| components | object | `{"basic":["a","button","checkbox","div","form","h1","h2",…` | <!-- TODO: 설명 --> |
| preview | object | `{"thumbnail":"preview\/thumbnail.png","screenshots":["pre…` | <!-- TODO: 설명 --> |
| error_config | object | `{"layouts":{"401":"errors\/401","403":"errors\/403","404"…` | <!-- TODO: 설명 --> |
| github_url | string | `https://github.com/gnuboard/g7-templa…` | GitHub 저장소 URL (manifest 파생) |
| github_changelog_url | string | `https://github.com/gnuboard/g7-templa…` | GitHub 변경 이력(CHANGELOG) URL (manifest 파생) |
| externals | array | `[{"id":"fontawesome","type":"style","url":"https:\/\/cdnj…` | <!-- TODO: 설명 --> |
| cache_version | integer | `1785848038` | <!-- TODO: 설명 --> |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "템플릿 설정 정보를 조회했습니다.",
    "data": {
        "identifier": "sirsoft-admin_basic",
        "vendor": "sirsoft",
        "name": {
            "ko": "Admin Basic",
            "en": "Admin Basic"
        },
        "version": "1.0.4",
        "license": "MIT",
        "description": {
            "ko": "그누보드7 기본 관리자 템플릿",
            "en": "Gnuboard7 default admin template"
        },
        "type": "admin",
        "locales": [
            "ko",
            "en"
        ],
        "author": {
            "name": "sirsoft",
            "email": "contact@sirsoft.com",
            "url": "https://sirsoft.com"
        },
        "release_date": "2026-05-15",
        "g7_version": ">=7.0.6",
        "dependencies": {
            "modules": [],
            "plugins": []
        },
        "assets": {
            "css": [
                "assets/css/main.css",
                "assets/css/ui-system.css"
            ],
            "js": [
                "dist/components.js"
            ],
            "fonts": [
                "assets/fonts/"
            ],
            "images": [
                "assets/images/"
            ]
        },
        "components": {
            "basic": [
                "a",
                "button",
                "checkbox",
                "div",
                "form",
                "h1",
                "h2",
                "h3",
                "hr",
                "icon",
                "img",
                "input",
                "label",
                "li",
                "nav",
                "p",
                "section",
                "select",
                "span",
                "svg",
                "table",
                "tbody",
                "td",
                "textarea",
                "th",
                "thead",
                "tr",
                "ul"
            ],
            "composite": [
                "action-menu",
                "admin-footer",
                "admin-header",
                "admin-sidebar",
                "alert-dialog",
                "breadcrumb",
                "card",
                "confirm-dialog",
                "data-grid",
                "dialog",
                "dropdown",
                "empty-state",
                "filter-group",
                "icon-button",
                "loading-spinner",
                "modal",
                "page-header",
                "pagination",
                "product-card",
                "search-bar",
                "stat-card",
                "status-badge",
                "tab-navigation",
                "template-card",
                "toast"
            ],
            "layout": [
                "container",
                "flex",
                "grid",
                "section"
            ]
        },
        "preview": {
            "thumbnail": "preview/thumbnail.png",
            "screenshots": [
                "preview/screenshot1.png",
                "preview/screenshot2.png"
            ]
        },
        "error_config": {
            "layouts": {
                "401": "errors/401",
                "403": "errors/403",
                "404": "errors/404",
                "500": "errors/500",
                "503": "errors/503",
                "maintenance": "errors/maintenance"
            }
        },
        "github_url": "https://github.com/gnuboard/g7-template-sirsoft-admin_basic",
        "github_changelog_url": "https://github.com/gnuboard/g7-template-sirsoft-admin_basic/blob/main/CHANGELOG.md",
        "externals": [
            {
                "id": "fontawesome",
                "type": "style",
                "url": "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
                "preconnect": "https://cdnjs.cloudflare.com"
            },
            {
                "id": "pretendard",
                "type": "webfont",
                "url": "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css",
                "preconnect": "https://cdn.jsdelivr.net",
                "crossorigin": "anonymous"
            },
            {
                "id": "flag-icons",
                "type": "style",
                "url": "https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css"
            }
        ],
        "cache_version": 1785848038
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/templates/{identifier}/config.json
<!-- @generated:start:api.public.templates.config -->
- **라우트명**: `api.public.templates.config`
- **컨트롤러**: `App\Http\Controllers\Api\Public\PublicTemplateController@serveConfig`
- **인증/권한**: 공개 (인증 불필요)

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/templates/sirsoft-admin_basic/config.json HTTP/1.1
Host: api.example.com
Accept: application/json
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: http-404 — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: http-404 — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 활성 템플릿의 설정 파일(template.json, error_config 등 메타데이터)을 서빙하는 공개 엔드포인트입니다. 응답에 확장 캐시 버전(`cache_version`)을 포함해 프론트엔드가 후속 API 호출에 사용하게 하며, 비활성/미존재 템플릿은 404입니다. 1시간 캐시됩니다. 인증이 필요 없습니다.


### GET /api/templates/{identifier}/editor-spec
<!-- @generated:start:api.public.templates.editor_spec -->
- **라우트명**: `api.public.templates.editor_spec`
- **컨트롤러**: `App\Http\Controllers\Api\Public\PublicTemplateController@serveEditorSpec`
- **인증/권한**: 공개 (인증 불필요)

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/templates/sirsoft-admin_basic/editor-spec HTTP/1.1
Host: api.example.com
Accept: application/json
```

**응답 필드** (`data` 내부)

_단건 응답: `data` 객체의 필드._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| identifier | string | `sirsoft-admin_basic` | 템플릿 고유 식별자 (vendor-name 형식, 예: sirsoft-admin_basic) |
| spec | object | `{"$schema":"https:\/\/json-schema.org\/draft\/2020-12\/sc…` | 스펙 정의 객체 (편집기/컴포넌트 선언 스키마 등) |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "편집기 스펙을 조회했습니다.",
    "data": {
        "identifier": "sirsoft-admin_basic",
        "spec": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "templateId": "sirsoft-admin_basic",
            "version": "1.0.0",
            "description": "레이아웃 편집기 스펙 — Phase 3 (nesting + componentPalette 블록).  controls/componentCapabilities/actionRecipes 등은 Phase 4/5 에서 추가.",
            "styleSystem": "tailwind",
            "...": "(14개 키 생략, 총 19개)"
        }
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 템플릿의 편집기 스펙(editor-spec.json)을 서빙하는 공개 엔드포인트입니다. 분할 스펙은 manifest + `$include` 블록을 합본한 단일 spec으로(활성 디렉토리 기준) 반환하며, 파일 미존재 시 `spec=null`로 폴백합니다. 인증이 필요 없습니다.


### GET /api/templates/{identifier}/lang/{locale}
<!-- @generated:start:api.public.templates.language.extensionless -->
- **라우트명**: `api.public.templates.language.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Public\PublicTemplateController@serveLanguage`
- **인증/권한**: 공개 (인증 불필요)

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| locale | path | string | 예 | — | 로케일 코드 (표시 언어/지역) |

**요청 예시**

```http
GET /api/templates/sirsoft-admin_basic/lang/{locale} HTTP/1.1
Host: api.example.com
Accept: application/json
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/templates/{identifier}/lang/{locale}.json
<!-- @generated:start:api.public.templates.language -->
- **라우트명**: `api.public.templates.language`
- **컨트롤러**: `App\Http\Controllers\Api\Public\PublicTemplateController@serveLanguage`
- **인증/권한**: 공개 (인증 불필요)

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| locale | path | string | 예 | — | 로케일 코드 (표시 언어/지역) |

**요청 예시**

```http
GET /api/templates/sirsoft-admin_basic/lang/{locale}.json HTTP/1.1
Host: api.example.com
Accept: application/json
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 활성 템플릿의 다국어 파일(lang/{locale}.json)을 활성화된 모듈의 다국어 데이터와 병합해 서빙하는 공개 엔드포인트입니다(TemplateService::getLanguageDataWithModules). 지원하지 않는 로케일/파일 부재 시 404이며 1시간 캐시됩니다. 인증이 필요 없습니다.


### GET /api/templates/{identifier}/layout-attachments/{attachment}/file
<!-- @generated:start:api.public.templates.layout-attachment-file -->
- **라우트명**: `api.public.templates.layout-attachment-file`
- **컨트롤러**: `App\Http\Controllers\Api\Public\PublicTemplateController@serveFile`
- **인증/권한**: 공개 (인증 불필요)

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |
| attachment | path | string | 예 | — | 대상 attachment의 식별자 |

**요청 예시**

```http
GET /api/templates/sirsoft-admin_basic/layout-attachments/{attachment}/file HTTP/1.1
Host: api.example.com
Accept: application/json
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: unresolved-path-param — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: unresolved-path-param — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 레이아웃 첨부 이미지 파일을 서빙하는 공개 엔드포인트입니다. 발행된 배경 이미지가 일반 방문자에게도 로드되어야 하므로 인증 없이 노출하며, 비공개 attachments 디스크의 파일을 캐싱 헤더와 함께 인라인 스트림합니다. 첨부가 경로의 템플릿 소속이 아니거나 파일이 없으면 404입니다. 인증이 필요 없습니다.


### GET /api/templates/{identifier}/routes
<!-- @generated:start:api.public.templates.routes.extensionless -->
- **라우트명**: `api.public.templates.routes.extensionless`
- **컨트롤러**: `App\Http\Controllers\Api\Public\PublicTemplateController@getRoutes`
- **인증/권한**: 공개 (인증 불필요)

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/templates/sirsoft-admin_basic/routes HTTP/1.1
Host: api.example.com
Accept: application/json
```

**응답 필드** (`data` 내부)

_단건 응답: `data` 객체의 필드._

| 필드 | 타입 | 실측 예시값 | 용도/설명 |
| --- | --- | --- | --- |
| version | string | `1.0.0` | 템플릿 버전 (예: 1.0.0) |
| routes | array | `[{"path":"*\/admin","redirect":"\/admin\/dashboard","auth…` | <!-- TODO: 설명 --> |

**응답 예시**

```http
HTTP/1.1 200
```

```json
{
    "success": true,
    "message": "템플릿 라우트 정보를 조회했습니다.",
    "data": {
        "version": "1.0.0",
        "routes": [
            {
                "path": "*/admin",
                "redirect": "/admin/dashboard",
                "auth_required": true,
                "meta": {
                    "title": "관리자"
                },
                "source": {
                    "kind": "template",
                    "identifier": null
                }
            },
            {
                "path": "*/admin/login",
                "layout": "admin_login",
                "auth_required": false,
                "meta": {
                    "title": "관리자 로그인"
                },
                "source": {
                    "kind": "template",
                    "identifier": null
                }
            },
            {
                "path": "*/admin/forgot-password",
                "layout": "admin_forgot_password",
                "auth_required": false,
                "meta": {
                    "title": "$t:auth.forgot_password.title"
                },
                "source": {
                    "kind": "template",
                    "identifier": null
                }
            },
            {
                "path": "*/admin/reset-password",
                "layout": "admin_reset_password",
                "auth_required": false,
                "meta": {
                    "title": "$t:auth.reset_password.title"
                },
                "source": {
                    "kind": "template",
                    "identifier": null
                }
            },
            {
                "path": "*/admin/dashboard",
                "layout": "admin_dashboard",
                "auth_required": true,
                "meta": {
                    "title": "관리자 대시보드"
                },
                "source": {
                    "kind": "template",
                    "identifier": null
                }
            },
            "... (총 85건 중 5건 표시)"
        ]
    }
}
```

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** <!-- TODO: 이 엔드포인트의 용도·주의사항·예시 시나리오를 작성하세요 -->


### GET /api/templates/{identifier}/routes.json
<!-- @generated:start:api.public.templates.routes -->
- **라우트명**: `api.public.templates.routes`
- **컨트롤러**: `App\Http\Controllers\Api\Public\PublicTemplateController@getRoutes`
- **인증/권한**: 공개 (인증 불필요)

**요청 파라미터**

| 이름 | 위치 | 타입 | 필수 | 허용값 | 용도 |
| --- | --- | --- | --- | --- | --- |
| identifier | path | string | 예 | — | 대상 리소스의 식별자 |

**요청 예시**

```http
GET /api/templates/sirsoft-admin_basic/routes.json HTTP/1.1
Host: api.example.com
Accept: application/json
```

**응답 필드** (`data` 내부)

<!-- 실측 제외: http-404 — 응답 필드는 사람이 작성하세요. -->

**응답 예시**

<!-- 실측 제외: http-404 — 응답 예시는 사람이 작성하세요. -->

**에러 응답**

| 상태코드 | 의미 | 발생 조건 |
| --- | --- | --- |
| 404 | Not Found | path 파라미터에 해당하는 리소스가 없는 경우 |

<!-- @generated:end -->

**설명** 템플릿의 라우트 정의(routes.json)를 활성화된 모듈의 라우트와 병합해 서빙하는 공개 엔드포인트입니다(TemplateService::getRoutesDataWithModules). 프론트엔드 라우팅 부팅에 사용하며 `v` query로 캐시를 무효화하고 1시간 캐시됩니다. 인증이 필요 없습니다.


