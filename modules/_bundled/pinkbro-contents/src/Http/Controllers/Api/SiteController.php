<?php

namespace Modules\Pinkbro\Contents\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Http\Resources\CopyResource;
use Modules\Pinkbro\Contents\Http\Resources\SiteResource;
use Modules\Pinkbro\Contents\Services\ContentMetaService;

/**
 * 사이트 레벨 공개 API — 브랜드/연락처(site), 섹션 문구(copy), 동시작업 할인(discount).
 *
 * 세 엔드포인트 모두 전역 메타(board_id/post_id = null)를 읽어 단일 래핑
 * (`{data: {...}}`)으로 돌려주는 무인증 공개 읽기다. 문구를 만들지 않는다.
 *
 * discount 는 별도 리소스 파일 없이 컨트롤러에서 같은 단일 래핑을 만든다
 * (이 태스크의 파일 목록에 DiscountResource 가 없다) — 저장된 키를 그대로 통과시킨다.
 */
class SiteController extends Controller
{
    public function __construct(private readonly ContentMetaService $meta) {}

    /**
     * 브랜드/연락처 — SITE 도메인 전역 메타.
     */
    public function site(): SiteResource
    {
        return new SiteResource($this->meta->allFor(null, null, MetaDomain::SITE));
    }

    /**
     * 섹션 문구 — COPY 도메인 전역 메타.
     */
    public function copy(): CopyResource
    {
        return new CopyResource($this->meta->allFor(null, null, MetaDomain::COPY));
    }

    /**
     * 동시작업 할인 단계 — DISCOUNT 도메인 전역 메타(`steps` 3단계).
     */
    public function discount(): JsonResponse
    {
        return response()->json([
            'data' => $this->meta->allFor(null, null, MetaDomain::DISCOUNT),
        ]);
    }
}
