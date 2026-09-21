<?php

namespace Modules\Pinkbro\Contents\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Http\Requests\Admin\CopyUpdateRequest;
use Modules\Pinkbro\Contents\Http\Requests\Admin\DiscountUpdateRequest;
use Modules\Pinkbro\Contents\Http\Requests\Admin\SiteUpdateRequest;
use Modules\Pinkbro\Contents\Http\Resources\CopyResource;
use Modules\Pinkbro\Contents\Http\Resources\SiteResource;
use Modules\Pinkbro\Contents\Services\ContentMetaService;

/**
 * 관리자 사이트 설정 API — site / copy / discount (SPEC §4.5 의 "사이트 레벨" 3도메인).
 *
 * 세 도메인 모두 게시판·게시글에 매이지 않은 **전역 메타**다: `board_id` 와
 * `post_id` 가 둘 다 null 이고, 공개 읽기(`SiteController`)가 읽는 바로 그 행을
 * 여기서 쓴다. 관리자 읽기는 공개 읽기와 같은 리소스를 재사용한다 — 응답 모양이
 * 갈라지면 관리자 폼과 공개 화면이 다른 계약을 갖게 된다.
 *
 * PUT 은 **부분 갱신**이다. `validated()` 가 보낸 키만 돌려주므로 보내지 않은 키의
 * 메타 행은 손대지 않는다. 예외는 `discount.steps` 하나뿐이고, 그 값은 배열 전체
 * 교체다 (`setMany` 는 키 단위 upsert 이므로 `steps` 키 하나가 통째로 바뀐다).
 *
 * 목록 밖의 키는 FormRequest 규칙에 없어 `validated()` 에서 조용히 빠진다 —
 * 422 가 아니다 (관리자 폼이 다른 도메인 필드를 함께 보내도 안전하다).
 *
 * 컨트롤러는 얇다: 검증은 FormRequest, 쓰기는 `ContentMetaService`. 여러 키를 한
 * 요청에 쓰므로 `DB::transaction` 으로 묶는다 — 절반만 반영되는 수정을 만들지 않는다.
 */
class AdminSiteController extends Controller
{
    public function __construct(private readonly ContentMetaService $meta) {}

    /**
     * 브랜드/연락처 — SITE 도메인 전역 메타.
     */
    public function site(): SiteResource
    {
        return new SiteResource($this->values(MetaDomain::SITE));
    }

    /**
     * 연락처 수정 — 보낸 키만 갱신하고 갱신 후 도메인 전체를 돌려준다.
     */
    public function updateSite(SiteUpdateRequest $request): SiteResource
    {
        return new SiteResource($this->persist(MetaDomain::SITE, $request->validated()));
    }

    /**
     * 섹션 문구 — COPY 도메인 전역 메타.
     */
    public function copy(): CopyResource
    {
        return new CopyResource($this->values(MetaDomain::COPY));
    }

    /**
     * 문구 수정 — 보낸 키만 갱신한다 (문구 82키 중 일부만 보내도 된다).
     */
    public function updateCopy(CopyUpdateRequest $request): CopyResource
    {
        return new CopyResource($this->persist(MetaDomain::COPY, $request->validated()));
    }

    /**
     * 동시작업 할인 단계 — DISCOUNT 도메인 전역 메타(`steps` 3단계).
     */
    public function discount(): JsonResponse
    {
        return response()->json(['data' => $this->values(MetaDomain::DISCOUNT)]);
    }

    /**
     * 할인 수정 — `steps` 배열 전체를 교체한다.
     *
     * 공개 읽기와 같은 단일 래핑(`{data: {...}}`)이다.
     */
    public function updateDiscount(DiscountUpdateRequest $request): JsonResponse
    {
        return response()->json(['data' => $this->persist(MetaDomain::DISCOUNT, $request->validated())]);
    }

    /**
     * 전역 메타 현재값 — 세 도메인 모두 board_id / post_id 가 null 이다.
     *
     * @return array<string, mixed>
     */
    private function values(MetaDomain $domain): array
    {
        return $this->meta->allFor(null, null, $domain);
    }

    /**
     * 보낸 키만 저장하고, 저장 후의 도메인 전체를 돌려준다.
     *
     * 한 요청이 여러 키를 쓰므로 전부 반영되거나 전부 반영되지 않아야 한다.
     * 빈 배열(보낸 키 없음)이면 아무것도 쓰지 않고 현재값만 돌려준다.
     *
     * @param  array<string, mixed>  $pairs
     * @return array<string, mixed>
     */
    private function persist(MetaDomain $domain, array $pairs): array
    {
        if ($pairs !== []) {
            DB::transaction(fn () => $this->meta->setMany(null, null, $domain, $pairs));
        }

        return $this->values($domain);
    }
}
