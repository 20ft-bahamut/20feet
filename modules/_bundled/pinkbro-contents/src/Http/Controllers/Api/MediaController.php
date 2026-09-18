<?php

namespace Modules\Pinkbro\Contents\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Modules\Pinkbro\Contents\Http\Resources\MediaSlotResource;
use Modules\Pinkbro\Contents\Services\MediaSlotService;

/**
 * 미디어 슬롯 공개 API.
 *
 * 슬롯 키 → 서빙 URL 해석은 전부 MediaSlotService 가 한다 —
 * 컨트롤러는 그 결과를 단일 래핑(`{data: {...}}`)으로 감싸기만 한다.
 * 무인증 공개 읽기이며, 슬롯 목록을 다시 정의하지 않는다.
 */
class MediaController extends Controller
{
    public function __construct(private readonly MediaSlotService $slots) {}

    /**
     * 레지스트리 16개 슬롯 전량 — 빈 슬롯은 `{url: null, alt: null}`.
     */
    public function slots(): MediaSlotResource
    {
        return new MediaSlotResource($this->slots->resolveAll());
    }
}
