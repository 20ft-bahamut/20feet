<?php

namespace Modules\Sirsoft\Page\Http\Controllers\User;

use App\Enums\PermissionType;
use App\Http\Controllers\Api\Base\PublicBaseController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Sirsoft\Page\Services\PageAttachmentService;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * 공개 페이지 첨부파일 컨트롤러
 *
 * 첨부파일 서빙(다운로드/미리보기)을 처리합니다. 썸네일 <img>·다운로드는 브라우저 직접
 * GET 이라 토큰을 실을 수 없으므로 공개 hash 라우트로 단일화합니다.
 * - 미리보기(썸네일): 발행 첨부는 누구나, 미발행 첨부는 pages.read 관리자만 (download 와 동일 게이트)
 * - 다운로드: 발행 첨부는 누구나, 미발행 첨부는 pages.read 관리자만 (파일 보호)
 *
 * preview 와 download 는 동일한 발행상태 게이트를 공유한다 — 한쪽만 열려 있으면
 * 미발행 콘텐츠가 무인가로 새는 경로가 남는다(preview↔download 정합).
 */
class PublicPageAttachmentController extends PublicBaseController
{
    public function __construct(
        private PageAttachmentService $attachmentService,
    ) {}

    /**
     * 첨부파일을 다운로드합니다 (해시 기반).
     *
     * 발행된 페이지의 첨부는 누구나, 미발행 페이지의 첨부는 페이지 조회 권한
     * (sirsoft-page.pages.read) 관리자만 다운로드할 수 있습니다.
     *
     * @param  Request  $request  HTTP 요청 객체 (다운로드 권한 판정용)
     * @param  string  $hash  첨부파일 해시 (12자)
     * @return StreamedResponse|JsonResponse 파일 스트리밍 응답 또는 오류
     */
    // audit:allow controller-base-request-injection reason: GET 파일 서빙. 인증 사용자만 read-only 참조($request->user())해 미발행 첨부 다운로드 권한을 판정. 검증할 body 없음(hash 는 라우트 파라미터)
    public function download(Request $request, string $hash): StreamedResponse|JsonResponse
    {
        $attachment = $this->attachmentService->getByHash($hash);
        if (! $attachment) {
            return $this->notFound('sirsoft-page::messages.attachment.not_found');
        }

        // 미발행 페이지의 첨부는 페이지 조회 권한 관리자만 다운로드 가능
        $published = $attachment->page && $attachment->page->published;
        $canReadUnpublished = $request->user()?->hasPermission(
            'sirsoft-page.pages.read',
            PermissionType::Admin
        ) ?? false;

        if (! $published && ! $canReadUnpublished) {
            return $this->notFound('sirsoft-page::messages.attachment.not_found');
        }

        $response = $this->attachmentService->download($attachment);

        return $response ?: $this->error('sirsoft-page::messages.attachment.file_not_found', 404);
    }

    /**
     * 이미지 첨부파일을 미리봅니다 (해시 기반, inline).
     *
     * 발행된 페이지의 썸네일은 누구나, 미발행 페이지의 썸네일은 페이지 조회 권한
     * (sirsoft-page.pages.read) 관리자만 미리볼 수 있습니다(download 와 동일 게이트).
     * 편집 중인 초안(미발행)의 <img> 썸네일은 편집 권한을 가진 관리자가 보므로
     * 정상 노출되며, 무인가 사용자에게만 미발행 썸네일이 차단됩니다.
     *
     * @param  Request  $request  HTTP 요청 객체 (미리보기 권한 판정용)
     * @param  string  $hash  첨부파일 해시 (12자)
     * @return StreamedResponse|JsonResponse 파일 스트리밍 응답 또는 오류
     */
    // audit:allow controller-base-request-injection reason: GET 이미지 서빙. 인증 사용자만 read-only 참조($request->user())해 미발행 첨부 미리보기 권한을 판정. 검증할 body 없음(hash 는 라우트 파라미터)
    public function preview(Request $request, string $hash): StreamedResponse|JsonResponse
    {
        $attachment = $this->attachmentService->getByHash($hash);
        if (! $attachment) {
            return $this->notFound('sirsoft-page::messages.attachment.not_found');
        }

        // 미발행 페이지의 첨부는 페이지 조회 권한 관리자만 미리보기 가능 (download 와 동일 게이트)
        $published = $attachment->page && $attachment->page->published;
        $canReadUnpublished = $request->user()?->hasPermission(
            'sirsoft-page.pages.read',
            PermissionType::Admin
        ) ?? false;

        if (! $published && ! $canReadUnpublished) {
            return $this->notFound('sirsoft-page::messages.attachment.not_found');
        }

        $response = $this->attachmentService->preview($attachment);

        return $response ?: $this->error('sirsoft-page::messages.attachment.file_not_found', 404);
    }
}
