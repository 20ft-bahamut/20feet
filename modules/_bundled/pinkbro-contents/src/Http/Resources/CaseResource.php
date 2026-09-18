<?php

namespace Modules\Pinkbro\Contents\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * 작업사례 공개 DTO — 게시글 메타(CASE 도메인) + 슬롯 해석 결과.
 *
 * 키 집합은 계약(SPEC §4.5 case 행)이 고정한다 — 저장값이 없으면 null 로 자리를 지킨다.
 * `blog_url` 은 저장값 그대로다 (시드 시점에는 빈 문자열 — SPEC §12 사용자 입력 대기).
 * 이 리소스는 자리표시자 URL 을 만들지 않는다.
 * `cover` 는 컨트롤러가 `MediaSlotService::resolve()` 로 해석해 넘긴 `{url, alt}` 이며,
 * 슬롯이 비면 `{url: null, alt: null}` 이다 (누락이 아니라 null).
 */
class CaseResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'title' => $this->resource['title'] ?? null,
            'summary' => $this->resource['summary'] ?? null,
            'blog_url' => $this->resource['blog_url'] ?? null,
            'cover' => $this->resource['cover'] ?? ['url' => null, 'alt' => null],
        ];
    }
}
