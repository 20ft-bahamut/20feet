<?php

namespace Modules\Pinkbro\Contents\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Http\Requests\Admin\ContentStoreRequest;
use Modules\Pinkbro\Contents\Http\Requests\Admin\ContentUpdateRequest;
use Modules\Pinkbro\Contents\Http\Resources\Admin\AdminContentResource;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Sirsoft\Board\Enums\PostStatus;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;
use Modules\Sirsoft\Board\Services\PostService;

/**
 * 관리자 콘텐츠 CRUD API — service / package / case / faq (SPEC §4.5).
 *
 * 저장 엔진은 공개 API 와 같은 게시판 4종 + `pinkbro_meta` 다. 게시판 slug 는
 * 시더(BOARDS)가 만든 이름 그대로이며 여기서 새 게시판을 만들지 않는다.
 *
 * 응답 모양은 공개 API 와 다르다: 목록만 이중 중첩(`{data: {data: [...], meta: {...}}}`)
 * 이고 단건·생성·수정은 단일 래핑(`{data: {...}}`)이다 — 관리자 레이아웃의
 * data_sources 계약이다.
 *
 * 컨트롤러는 얇다: 검증은 FormRequest, 게시글 쓰기는 `PostService`(공식 경로 —
 * 훅·캐시 무효화 포함), 메타 쓰기는 `ContentMetaService`. 게시글과 메타는 항상
 * 한 트랜잭션이다 — 절반만 적용되는 수정을 만들지 않는다.
 *
 * `slug` 는 `board_posts` 컬럼이 아니라 메타 행(`key='slug'`)에 저장된다 (SPEC §4.5).
 * 그래서 생성·수정 모두 게시글 컬럼에 slug 를 쓰지 않는다.
 */
class AdminContentController extends Controller
{
    /**
     * 도메인 → 게시판 slug + 게시글 컬럼 값 출처.
     *
     * `title` 은 게시글 제목 컬럼에 넣을 도메인 키, `body` 는 본문 컬럼에 넣을 키다 —
     * 시더가 만든 게시글과 같은 규칙이다 (faq 만 질문/답변).
     *
     * @var array<string, array{board: string, title: string, body: string}>
     */
    private const DOMAINS = [
        'service' => ['board' => 'pinkbro_service', 'title' => 'title', 'body' => 'summary'],
        'package' => ['board' => 'pinkbro_package', 'title' => 'title', 'body' => 'summary'],
        'case' => ['board' => 'pinkbro_case', 'title' => 'title', 'body' => 'summary'],
        'faq' => ['board' => 'pinkbro_faq', 'title' => 'question', 'body' => 'answer'],
    ];

    public function __construct(private readonly ContentMetaService $meta) {}

    /**
     * 도메인 목록 — 게시판 전체를 `sort` 오름차순으로 (공개 여부 구분 없음).
     *
     * 게시판이 없으면(모듈 미시딩) 빈 목록으로 200 을 유지한다 — 공개 API 와 같은 규칙.
     */
    public function index(string $domain): JsonResponse
    {
        $board = $this->board($this->config($domain)['board']);

        $items = $board === null
            ? []
            : $this->items($board, MetaDomain::from($domain));

        return response()->json([
            'data' => [
                'data' => AdminContentResource::collection($items),
                'meta' => ['total' => count($items)],
            ],
        ]);
    }

    /**
     * 단건 — 게시글 1건 + 도메인 메타 전체.
     */
    public function show(string $domain, int $id): JsonResponse
    {
        $config = $this->config($domain);
        $board = $this->boardOr404($config['board']);
        $post = $this->postOr404($board, $id);

        return AdminContentResource::make(
            $this->payload($post, (int) $board->id, MetaDomain::from($domain))
        )->response();
    }

    /**
     * 생성 — 게시글 1건 + 도메인 메타 일괄 저장.
     */
    public function store(ContentStoreRequest $request, string $domain): JsonResponse
    {
        $config = $this->config($domain);
        $metaDomain = MetaDomain::from($domain);
        $data = $request->validated();
        $ip = $request->ip();

        $post = DB::transaction(function () use ($config, $metaDomain, $data, $ip): Post {
            // 공식 쓰기 경로 — 훅·게시글 수 동기화·캐시 무효화가 함께 처리된다.
            $post = app(PostService::class)->createPost($config['board'], [
                'title' => $data[$config['title']],
                'content' => (string) ($data[$config['body']] ?? ''),
                'content_mode' => 'text',
                'ip_address' => $ip,
                'is_notice' => false,
                'is_secret' => false,
                'status' => PostStatus::Published->value,
            ]);

            $this->meta->setMany((int) $post->board_id, $post->id, $metaDomain, $data);

            return $post;
        });

        return AdminContentResource::make(
            $this->payload($post, (int) $post->board_id, $metaDomain)
        )->response()->setStatusCode(201);
    }

    /**
     * 수정 — 보내온 키만 갱신한다 (부분 갱신).
     */
    public function update(ContentUpdateRequest $request, string $domain, int $id): JsonResponse
    {
        $config = $this->config($domain);
        $metaDomain = MetaDomain::from($domain);
        $data = $request->validated();

        $board = $this->boardOr404($config['board']);
        $post = $this->postOr404($board, $id);

        $postData = [];

        if (array_key_exists($config['title'], $data)) {
            $postData['title'] = $data[$config['title']];
        }

        if (array_key_exists($config['body'], $data)) {
            $postData['content'] = (string) $data[$config['body']];
        }

        DB::transaction(function () use ($config, $board, $post, $metaDomain, $postData, $data): void {
            if ($postData !== []) {
                app(PostService::class)->updatePost($config['board'], $post->id, $postData);
            }

            $this->meta->setMany((int) $board->id, $post->id, $metaDomain, $data);
        });

        return AdminContentResource::make(
            $this->payload($post->refresh(), (int) $board->id, $metaDomain)
        )->response();
    }

    /**
     * 삭제 — 게시글(소프트 삭제)과 그 게시글의 도메인 메타를 함께 지운다.
     *
     * 다른 도메인·다른 게시글의 메타 행은 건드리지 않는다.
     */
    public function destroy(string $domain, int $id): JsonResponse
    {
        $config = $this->config($domain);
        $metaDomain = MetaDomain::from($domain);

        $board = $this->boardOr404($config['board']);
        $post = $this->postOr404($board, $id);

        DB::transaction(function () use ($config, $board, $post, $metaDomain): void {
            app(PostService::class)->deletePost($config['board'], $post->id);
            $this->meta->deleteFor((int) $board->id, $post->id, $metaDomain);
        });

        return response()->json(null, 204);
    }

    /**
     * 도메인 설정 — 알 수 없는 도메인은 404 다 (500 이 아니다).
     *
     * @return array{board: string, title: string, body: string}
     */
    private function config(string $domain): array
    {
        abort_unless(isset(self::DOMAINS[$domain]), 404);

        return self::DOMAINS[$domain];
    }

    private function board(string $slug): ?Board
    {
        return Board::query()->where('slug', $slug)->first();
    }

    private function boardOr404(string $slug): Board
    {
        return $this->board($slug) ?? abort(404);
    }

    /**
     * 게시판 스코프 게시글 — 다른 게시판의 글과 삭제된 글은 404 다.
     */
    private function postOr404(Board $board, int $id): Post
    {
        return Post::query()
            ->where('board_id', $board->id)
            ->where('id', $id)
            ->where('status', '!=', PostStatus::Deleted->value)
            ->first() ?? abort(404);
    }

    /**
     * 게시판 하나의 게시글 + 도메인 메타를 `sort` 오름차순으로 돌려준다.
     *
     * 합치기 규칙은 공개 API 와 같다: 메타가 값 출처고, 제목만 메타에 없을 수 있어
     * 게시글 컬럼으로 자리를 채운다.
     *
     * @return array<int, array{id: int, domain: string, meta: array<string, mixed>}>
     */
    private function items(Board $board, MetaDomain $domain): array
    {
        $posts = Post::query()
            ->where('board_id', $board->id)
            ->where('status', '!=', PostStatus::Deleted->value)
            ->get();

        $items = [];

        foreach ($posts as $post) {
            $items[] = $this->payload($post, (int) $board->id, $domain);
        }

        usort(
            $items,
            fn (array $a, array $b): int => [$a['meta']['sort'], $a['id']] <=> [$b['meta']['sort'], $b['id']]
        );

        return $items;
    }

    /**
     * 리소스에 넘길 배열 — 게시글 식별자 + 도메인 메타.
     *
     * 키 집합은 리소스가 고정한다. 여기서는 값만 채운다.
     *
     * @return array{id: int, domain: string, meta: array<string, mixed>}
     */
    private function payload(Post $post, int $boardId, MetaDomain $domain): array
    {
        $meta = $this->meta->allFor($boardId, $post->id, $domain);

        $meta['title'] ??= $post->title;
        $meta['sort'] = (int) ($meta['sort'] ?? 0);

        return ['id' => (int) $post->id, 'domain' => $domain->value, 'meta' => $meta];
    }
}
