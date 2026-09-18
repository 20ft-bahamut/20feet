<?php

namespace Modules\Pinkbro\Contents\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Http\Resources\CaseResource;
use Modules\Pinkbro\Contents\Http\Resources\FaqResource;
use Modules\Pinkbro\Contents\Http\Resources\PackageResource;
use Modules\Pinkbro\Contents\Http\Resources\ServiceResource;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Pinkbro\Contents\Services\MediaSlotService;
use Modules\Sirsoft\Board\Enums\PostStatus;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;

/**
 * 콘텐츠 목록 공개 API — services / packages / cases / faq (SPEC §4.7).
 *
 * 네 엔드포인트 모두 시더가 만든 게시판의 공개 게시글 + 도메인 메타를 읽어
 * `sort` 오름차순으로 돌려주는 무인증 공개 읽기다. 문구를 만들지 않는다.
 *
 * 게시판 slug 는 시더가 만든 이름 그대로이며 여기서 다시 정의하지 않는다.
 * 게시판이 없으면(모듈 미설치·미시딩) 빈 목록으로 200 을 유지한다 — 예외가 아니다.
 *
 * `slug` 는 `board_posts` 컬럼이 아니라 메타 행(`key='slug'`)에 있다 (SPEC §4.5).
 * 그래서 게시글 컬럼을 읽지 않고, 게시글마다 `allFor()` 로 메타를 읽어 합친다 —
 * 게시판마다 6/3/4/8 행이라 이 N+1 은 문제되지 않는다.
 */
class ContentController extends Controller
{
    /** 서비스 게시판 slug (시더 BOARDS 키). */
    private const SERVICE_BOARD = 'pinkbro_service';

    /** 패키지 게시판 slug (시더 BOARDS 키). */
    private const PACKAGE_BOARD = 'pinkbro_package';

    /** 작업사례 게시판 slug (시더 BOARDS 키). */
    private const CASE_BOARD = 'pinkbro_case';

    /** FAQ 게시판 slug (시더 BOARDS 키). */
    private const FAQ_BOARD = 'pinkbro_faq';

    public function __construct(
        private readonly ContentMetaService $meta,
        private readonly MediaSlotService $slots,
    ) {}

    /**
     * 서비스 목록 — `sort` 1..6 순. `photo` 는 슬롯 해석 결과.
     */
    public function services(): AnonymousResourceCollection
    {
        $items = $this->items(self::SERVICE_BOARD, MetaDomain::SERVICE);

        foreach ($items as $index => $item) {
            $items[$index]['photo'] = $this->slot($item['photo_slot'] ?? null);
        }

        return ServiceResource::collection($items)
            ->additional(['meta' => ['total' => count($items)]]);
    }

    /**
     * 패키지 목록 — `sort` 1..3 순.
     */
    public function packages(): AnonymousResourceCollection
    {
        return PackageResource::collection($this->items(self::PACKAGE_BOARD, MetaDomain::PACKAGE));
    }

    /**
     * 작업사례 목록 — `sort` 1..4 순. `cover` 는 슬롯 해석 결과.
     */
    public function cases(): AnonymousResourceCollection
    {
        $items = $this->items(self::CASE_BOARD, MetaDomain::CASE);

        foreach ($items as $index => $item) {
            $items[$index]['cover'] = $this->slot($item['cover_slot'] ?? null);
        }

        return CaseResource::collection($items);
    }

    /**
     * FAQ 목록 — `sort` 1..8 순.
     */
    public function faq(): AnonymousResourceCollection
    {
        return FaqResource::collection($this->items(self::FAQ_BOARD, MetaDomain::FAQ));
    }

    /**
     * 게시판 하나의 공개 게시글 + 도메인 메타를 합쳐 `sort` 오름차순으로 돌려준다.
     *
     * 메타가 유일한 값 출처다. 제목만 메타에 없을 수 있어 게시글 컬럼으로 자리를 채운다.
     *
     * @return array<int, array<string, mixed>>
     */
    private function items(string $boardSlug, MetaDomain $domain): array
    {
        $board = Board::query()->where('slug', $boardSlug)->first();

        if (! $board) {
            return [];
        }

        $posts = Post::query()
            ->where('board_id', $board->id)
            ->where('status', PostStatus::Published->value)
            ->get();

        $items = [];

        foreach ($posts as $post) {
            $item = $this->meta->allFor($board->id, $post->id, $domain);

            $item['title'] ??= $post->title;
            $item['sort'] = (int) ($item['sort'] ?? 0);

            $items[] = $item;
        }

        usort($items, fn (array $a, array $b): int => $a['sort'] <=> $b['sort']);

        return $items;
    }

    /**
     * 슬롯 키 하나를 `{url, alt}` 로 해석한다.
     *
     * 슬롯 목록의 유일한 출처는 MediaSlotService 레지스트리다 — 여기서 다시 정의하지 않는다.
     * 키가 없거나 레지스트리에 없는 값이면 `{url: null, alt: null}` 이다.
     *
     * @return array{url: string|null, alt: string|null}
     */
    private function slot(mixed $slot): array
    {
        if (! is_string($slot) || ! in_array($slot, MediaSlotService::slotKeys(), true)) {
            return ['url' => null, 'alt' => null];
        }

        return $this->slots->resolve($slot);
    }
}
