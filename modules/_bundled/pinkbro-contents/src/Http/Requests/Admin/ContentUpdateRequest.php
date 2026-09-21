<?php

namespace Modules\Pinkbro\Contents\Http\Requests\Admin;

/**
 * 관리자 콘텐츠 수정 검증 — 도메인 4종 공용.
 *
 * 생성 요청과 같은 필드 표를 쓰되 부분 갱신이다: 모든 키가 `sometimes` 이므로
 * 보내지 않은 키는 검증도 저장도 하지 않는다 (`validated()` 에 등장하지 않는다).
 * 그 결과가 "메타 행을 지우지 않는 수정" 이다 — 값을 null 로 보내면 지워진다.
 *
 * 와일드카드 하위 키(`air_types.*.kind` 등)는 두 모드에서 같은 규칙을 유지한다 —
 * `air_types` 를 보냈다면 그 원소는 계약(SPEC §4.5)을 온전히 갖춰야 한다.
 */
class ContentUpdateRequest extends ContentStoreRequest
{
    /** 부분 갱신 모드 — 필수 키도 sometimes 가 된다. */
    protected bool $partial = true;
}
