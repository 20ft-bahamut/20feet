<?php

namespace Modules\Pinkbro\Contents\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Modules\Pinkbro\Contents\Http\Requests\InquiryStoreRequest;
use Modules\Pinkbro\Contents\Services\InquiryService;

/**
 * 문의 접수 공개 API — 비회원 쓰기.
 *
 * 검증은 FormRequest, 저장은 서비스가 맡는다. 컨트롤러는 응답 모양만 만든다.
 * 게시판이 없으면 서비스가 503 을 던진다 — 여기서 삼키지 않는다.
 */
class InquiryController extends Controller
{
    public function __construct(private readonly InquiryService $inquiries) {}

    /**
     * 문의 등록 — 201 `{data: {inquiry_id}}`.
     */
    public function store(InquiryStoreRequest $request): JsonResponse
    {
        $result = $this->inquiries->store($request->validated(), (string) $request->ip());

        return response()->json([
            'data' => [
                'inquiry_id' => $result['inquiry_id'],
            ],
        ], 201);
    }
}
