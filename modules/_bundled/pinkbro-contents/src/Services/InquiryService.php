<?php

namespace Modules\Pinkbro\Contents\Services;

use Illuminate\Support\Facades\DB;
use Modules\Pinkbro\Contents\Enums\InquiryStatus;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Sirsoft\Board\Enums\PostStatus;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;
use Modules\Sirsoft\Board\Services\PostService;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;

/**
 * 문의 접수 — 비회원 문의를 문의 게시판의 비밀글로 저장한다.
 *
 * HTTP 요청 객체를 알지 못한다 — 검증된 배열과 IP 문자열만 받는다.
 *
 * 저장은 게시판의 공식 쓰기 경로(`PostService::createPost`)를 지난다. 그래야
 * before/after_create 훅이 발화하고, 게시판 `notify_admin_on_post` 플래그가
 * 관리자 알림을 걸 수 있다 — 이 모듈에는 알림 코드가 없다.
 *
 * 게시글과 메타는 한 트랜잭션으로 묶는다: 둘 중 하나만 남으면 문의가 깨진다.
 */
class InquiryService
{
    /**
     * 문의 게시판 slug — 시더 BOARDS 키 그대로다. 여기서 새 이름을 만들지 않는다.
     */
    public const BOARD_SLUG = 'pinkbro_inquiry';

    public function __construct(
        private readonly ContentMetaService $meta,
        private readonly PostService $posts,
    ) {}

    /**
     * 문의 1건을 저장하고 응답용 식별자를 돌려준다.
     *
     * @param  array<string, mixed>  $validated  FormRequest 를 통과한 값
     * @param  string  $ipAddress  요청 IP (board_posts.ip_address 는 필수 컬럼)
     * @return array{post_id: int, inquiry_id: string}
     *
     * @throws ServiceUnavailableHttpException 게시판이 없을 때 (설치·시딩 전)
     */
    public function store(array $validated, string $ipAddress): array
    {
        // 게시판이 없으면 createPost 가 ModelNotFoundException 을 던져 500 이 된다.
        // 503 으로 번역한다 — "아직 준비되지 않음"이지 서버 오류가 아니다.
        $board = Board::query()->where('slug', self::BOARD_SLUG)->first();

        if ($board === null) {
            throw new ServiceUnavailableHttpException(null, 'Inquiry board is not ready.');
        }

        // 비밀글 + 게시 상태. `secret_mode: always` 는 게시판 설정이며
        // 게시글의 is_secret 을 대신 세우지 않는다 — 명시적으로 넘긴다.
        //
        // 게시글 생성과 메타 저장은 한 트랜잭션이다. createPost 가 내부에서
        // DB::beginTransaction()/commit() 를 직접 부르지만, 바깥 트랜잭션이 열려
        // 있으면 Laravel 은 그 짝을 SAVEPOINT(trans2)로 낮춘다 — 실제 커밋은
        // 바깥에서 한 번만 일어난다. 그래서 메타 저장이 실패하면 "연락처가 담긴
        // 비밀글만 남고 메타가 비는" 부분 저장이 되지 않는다.
        $post = DB::transaction(function () use ($board, $validated, $ipAddress): Post {
            $post = $this->posts->createPost(self::BOARD_SLUG, [
                'title' => $this->buildTitle($validated),
                'content' => $validated['message'] ?? '',
                'content_mode' => 'text',
                'author_name' => $validated['contact'],
                'ip_address' => $ipAddress,
                'is_secret' => true,
                'status' => PostStatus::Published->value,
            ]);

            $this->meta->setMany($board->id, $post->id, MetaDomain::INQUIRY, [
                'business_type' => $validated['business_type'],
                // 목록 선택은 순서가 있는 배열이다 — list 로 정규화해 저장한다.
                'services' => array_values($validated['services']),
                'store_size' => $validated['store_size'] ?? null,
                'contact' => $validated['contact'],
                'message' => $validated['message'] ?? null,
                'status' => InquiryStatus::NEW->value,
            ]);

            return $post;
        });

        return [
            'post_id' => $post->id,
            'inquiry_id' => self::inquiryId($post->id),
        ];
    }

    /**
     * 외부에 돌려주는 문의 식별자 — 원문 게시글 id 를 노출하지 않는 해시.
     */
    public static function inquiryId(int $postId): string
    {
        return hash('xxh64', (string) $postId);
    }

    /**
     * 관리자 목록에서 읽을 제목 — `[업종] 연락처 - YYYY-MM-DD`.
     *
     * @param  array<string, mixed>  $validated
     */
    private function buildTitle(array $validated): string
    {
        return sprintf(
            '[%s] %s - %s',
            $validated['business_type'],
            $validated['contact'],
            now()->format('Y-m-d'),
        );
    }
}
