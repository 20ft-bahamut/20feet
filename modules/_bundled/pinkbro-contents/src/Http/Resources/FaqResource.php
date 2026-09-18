<?php

namespace Modules\Pinkbro\Contents\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * FAQ 공개 DTO — 게시글 메타(FAQ 도메인).
 *
 * 키 집합은 계약(SPEC §4.5 faq 행)이 고정한다 — 저장값이 없으면 null 로 자리를 지킨다.
 * 질문/답변 모두 저장값 그대로이며 이 리소스는 문구를 만들지 않는다.
 */
class FaqResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'question' => $this->resource['question'] ?? null,
            'answer' => $this->resource['answer'] ?? null,
        ];
    }
}
