<?php

namespace Modules\Twentyft\Content\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;
use Modules\Sirsoft\Board\Services\BoardPermissionService;
use Modules\Sirsoft\Board\Services\BoardService;
use Modules\Twentyft\Content\Models\PostMeta;

/**
 * 20ft Content 엔진용 기본 게시판 및 샘플 데이터 시더
 *
 * - portfolio / superbify / project-inquiry 게시판이 없으면 BoardService 로 생성합니다.
 * - 이미 존재하는 게시판은 BoardPermissionService 로 동적 권한을 보장합니다.
 * - 게시글이 없는 경우에만 최소한의 샘플 데이터를 생성합니다.
 */
class TwentyftContentSeeder extends Seeder
{
    /**
     * 20ft Website 운영 게시판 정의
     */
    private const BOARDS = [
        'portfolio' => [
            'name' => ['ko' => 'Portfolio', 'en' => 'Portfolio'],
            'slug' => 'portfolio',
            'description' => ['ko' => '20ft Portfolio 프로젝트', 'en' => '20ft Portfolio projects'],
            'type' => 'card',
            'is_active' => true,
            'secret_mode' => 'disabled',
            'use_comment' => false,
            'use_reply' => false,
            'use_report' => false,
            'use_file_upload' => true,
            'max_file_size' => 10,
            'max_file_count' => 10,
            'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'show_view_count' => true,
            'per_page' => 12,
            'new_display_hours' => 0,
            'order_by' => 'created_at',
            'order_direction' => 'DESC',
            'notify_author' => false,
            'notify_admin_on_post' => true,
        ],
        'superbify' => [
            'name' => ['ko' => 'SuperBify', 'en' => 'SuperBify'],
            'slug' => 'superbify',
            'description' => ['ko' => 'SuperBify 제품', 'en' => 'SuperBify products'],
            'type' => 'card',
            'is_active' => true,
            'secret_mode' => 'disabled',
            'use_comment' => false,
            'use_reply' => false,
            'use_report' => false,
            'use_file_upload' => true,
            'max_file_size' => 10,
            'max_file_count' => 10,
            'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'show_view_count' => true,
            'per_page' => 12,
            'new_display_hours' => 0,
            'order_by' => 'created_at',
            'order_direction' => 'DESC',
            'notify_author' => false,
            'notify_admin_on_post' => true,
        ],
        'project-inquiry' => [
            'name' => ['ko' => '프로젝트 문의', 'en' => 'Project Inquiry'],
            'slug' => 'project-inquiry',
            'description' => ['ko' => '20ft 프로젝트 문의', 'en' => '20ft project inquiries'],
            'type' => 'basic',
            'is_active' => true,
            'secret_mode' => 'always',
            'use_comment' => true,
            'use_reply' => true,
            'max_reply_depth' => 1,
            'max_comment_depth' => 3,
            'use_report' => false,
            'use_file_upload' => true,
            'max_file_size' => 10,
            'max_file_count' => 5,
            'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'zip'],
            'show_view_count' => false,
            'per_page' => 20,
            'new_display_hours' => 0,
            'order_by' => 'created_at',
            'order_direction' => 'DESC',
            'notify_author' => true,
            'notify_admin_on_post' => true,
            'permissions' => [
                'posts_write' => ['roles' => ['admin', 'user', 'guest']],
                'attachments_upload' => ['roles' => ['admin', 'user', 'guest']],
            ],
        ],
    ];

    /**
     * 샘플 Portfolio 데이터
     *
     * 카피는 사용자 승인 전까지 최소한의 식별용 값만 사용합니다.
     */
    private const PORTFOLIO_SAMPLES = [
        [
            'slug' => 'sample-project-alpha',
            'title' => ['ko' => '[TEST] Sample Project Alpha', 'en' => '[TEST] Sample Project Alpha'],
            'content' => ['ko' => 'Portfolio 샘플 프로젝트 입니다.', 'en' => 'Portfolio sample project.'],
            'meta' => [
                'type' => 'web',
                'status' => 'published',
                'client_name' => '20ft Internal',
                'summary' => ['ko' => '샘플 요약', 'en' => 'Sample summary'],
                'year' => '2026',
                'tech_stack' => ['Next.js', 'Laravel', 'Tailwind CSS'],
                'related_url' => null,
                'cover_image_url' => null,
                'gallery_image_urls' => [],
            ],
        ],
    ];

    /**
     * 샘플 SuperBify 데이터
     */
    private const SUPERBIFY_SAMPLES = [
        [
            'slug' => 'sample-product-alpha',
            'title' => ['ko' => '[TEST] Sample Product Alpha', 'en' => '[TEST] Sample Product Alpha'],
            'content' => ['ko' => 'SuperBify 샘플 제품 입니다.', 'en' => 'SuperBify sample product.'],
            'meta' => [
                'type' => 'saas',
                'status' => 'published',
                'tagline' => ['ko' => '샘플 태그라인', 'en' => 'Sample tagline'],
                'description' => ['ko' => '제품 설명 샘플', 'en' => 'Sample product description'],
                'year' => '2026',
                'cover_image_url' => null,
                'screenshot_image_urls' => [],
            ],
        ],
    ];

    /**
     * 샘플 Inquiry 데이터
     */
    private const INQUIRY_SAMPLES = [
        [
            'title' => ['ko' => '[TEST] 샘플 문의', 'en' => '[TEST] Sample Inquiry'],
            'content' => ['ko' => '샘플 프로젝트 문의입니다.', 'en' => 'Sample project inquiry.'],
            'meta' => [
                'status' => 'new',
                'project_type' => 'web',
                'budget_range' => 'under_10m',
                'contact_name' => 'Tester',
                'contact_email' => 'test@example.com',
                'contact_company' => 'Example Inc.',
                'contact_phone' => '010-0000-0000',
                'privacy_agreed' => true,
            ],
        ],
    ];

    /**
     * 시더 실행
     */
    public function run(): void
    {
        $this->command->info('20ft Content 기본 데이터 시딩 시작...');

        $admin = User::whereHas('roles', function ($query) {
            $query->where('identifier', 'admin');
        })->first();

        if ($admin) {
            Auth::login($admin);
        }

        foreach (self::BOARDS as $config) {
            $this->ensureBoard($config);
        }

        $this->seedSampleContent();

        if ($admin) {
            Auth::logout();
        }

        $this->command->info('20ft Content 기본 데이터 시딩 완료.');
    }

    /**
     * 게시판을 보장합니다.
     */
    private function ensureBoard(array $config): Board
    {
        $existing = Board::where('slug', $config['slug'])->first();

        if ($existing) {
            $this->command->info("  - {$config['slug']} 게시판이 이미 존재합니다. 동적 권한을 보장합니다.");
            app(BoardPermissionService::class)->ensureBoardPermissions($existing);

            return $existing;
        }

        $this->command->info("  - {$config['slug']} 게시판을 생성합니다.");

        $adminIds = User::whereHas('roles', function ($query) {
            $query->where('identifier', 'admin');
        })->pluck('uuid')->toArray();

        $config['board_manager_ids'] = $adminIds;

        return app(BoardService::class)->createBoard($config);
    }

    /**
     * 게시판에 샘플 콘텐츠가 없는 경우 최소 데이터를 추가합니다.
     */
    private function seedSampleContent(): void
    {
        $boards = Board::whereIn('slug', ['portfolio', 'superbify', 'project-inquiry'])
            ->get()
            ->keyBy('slug');

        foreach ($boards as $slug => $board) {
            $exists = Post::where('board_id', $board->id)->whereNull('parent_id')->exists();
            if ($exists) {
                $this->command->info("  - {$slug} 게시판에 이미 게시글이 있습니다. 샘플 추가를 건너뜁니다.");
                continue;
            }

            $samples = match ($slug) {
                'portfolio' => self::PORTFOLIO_SAMPLES,
                'superbify' => self::SUPERBIFY_SAMPLES,
                'project-inquiry' => self::INQUIRY_SAMPLES,
                default => [],
            };

            foreach ($samples as $sample) {
                $this->createPostWithMeta($board, $slug, $sample);
            }

            $this->command->info("  - {$slug} 게시판에 샘플 데이터를 추가했습니다.");
        }
    }

    /**
     * 게시글과 twentyft_post_meta 를 생성합니다.
     */
    private function createPostWithMeta(Board $board, string $domain, array $sample): void
    {
        $now = now();
        $postData = [
            'board_id' => $board->id,
            'user_id' => Auth::id(),
            'title' => $sample['title'],
            'content' => $sample['content'],
            'is_secret' => $domain === 'project-inquiry',
            'is_notice' => false,
            'is_hidden' => false,
            'view_count' => 0,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        $postId = DB::table('board_posts')->insertGetId($postData);

        foreach ($sample['meta'] as $key => $value) {
            PostMeta::create([
                'board_id' => $board->id,
                'post_id' => $postId,
                'domain' => $domain,
                'key' => $key,
                'value' => is_array($value) || is_object($value) ? $value : ['_raw' => $value],
            ]);
        }
    }
}
