<?php

namespace Modules\Twentyft\Content\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Services\BoardPermissionService;
use Modules\Sirsoft\Board\Services\BoardService;

/**
 * 20ft Content 엔진용 기본 게시판 시더
 *
 * - portfolio / superbify / project-inquiry 게시판이 없으면 BoardService 로 생성합니다.
 * - 이미 존재하는 게시판은 BoardPermissionService 로 동적 권한을 보장합니다.
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
     * 시더 실행
     */
    public function run(): void
    {
        $this->command->info('20ft Content 기본 게시판 시딩 시작...');

        foreach (self::BOARDS as $config) {
            $this->ensureBoard($config);
        }

        $this->command->info('20ft Content 기본 게시판 시딩 완료.');
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
}
