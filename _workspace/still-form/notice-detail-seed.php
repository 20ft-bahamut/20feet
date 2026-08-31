<?php

/**
 * Still Form store notice — extra demo posts (detail/pagination QA seed).
 *
 * Run from repo root:
 *   php artisan tinker _workspace/still-form/notice-detail-seed.php
 *
 * Board: store-notice (id=4). Same pipeline as the original notice seed:
 * sirsoft-board PostService::createPost (user_id=1 관리자, ip included),
 * created_at backdated afterwards (post fillable does not include created_at).
 *
 * Titles (9) — neutral store-service copy, no fabricated customers/prizes:
 *   재입고 안내, 공휴일 임시 휴무 안내, 회원 감사 이벤트 안내, 배송 지연 안내,
 *   리뷰 이벤트 당첨자 발표, 신규 카테고리 출시 안내, 시스템 점검 안내,
 *   뉴스레터 오픈 안내, 구매 인증 사진 촬영 팁
 */

use Modules\Sirsoft\Board\Services\PostService;

$postService = app(PostService::class);

// [created_at, title, html body]
$posts = [
    ['2026-07-30 10:00:00', '재입고 안내',
        '<p>품절로 안내드렸던 상품이 순차적으로 재입고되었습니다.</p><p>재입고 수량은 한정되어 있어 조기 소진될 수 있으며, 상품 상세 페이지의 재입고 알림을 설정해 두시면 입력 즉시 안내를 받아보실 수 있습니다.</p>'],
    ['2026-07-15 09:30:00', '공휴일 임시 휴무 안내',
        '<p>공휴일에는 스토어 상담과 배송 준비, 교환·반품 접수 처리가 임시 휴무됩니다.</p><p>휴무 기간 중 저장된 주문과 문의는 다음 영업일에 순차적으로 확인하여 처리됩니다. 상담은 영업일 기준 1 영업일 내에 답변드립니다.</p>'],
    ['2026-06-28 11:00:00', '회원 감사 이벤트 안내',
        '<p>가입해 주신 회원님들께 감사한 마음을 담아 감사 이벤트를 준비했습니다.</p><ul><li>기간: 이벤트 시작일부터 별도 종료 공지까지</li><li>대상: 이벤트 기간 중 구매하신 회원 전체</li><li>혜택: 구매 확정 리뷰 작성 시 적립 혜택</li></ul><p>자세한 참여 방법은 상품 구매 후 발송되는 구매 안내 문서에서 확인하실 수 있습니다.</p>'],
    ['2026-06-10 14:20:00', '배송 지연 안내',
        '<p>배송 물량 집중으로 일부 지역의 출고와 도착이 평소보다 지연되고 있습니다.</p><p>이미 접수된 주문은 순차적으로 발송되며, 배송 현황은 주문 완료 페이지와 발송 알림에서 확인하실 수 있습니다. 넓은 양해 부탁드립니다.</p>'],
    ['2026-05-26 10:40:00', '리뷰 이벤트 당첨자 발표',
        '<p>지난 리뷰 이벤트에 참여해 주신 모든 분들께 감사드립니다.</p><p>당첨자분들께는 구매 후기에 등록하신 연락 채널로 개별 안내를 발송했습니다. 이벤트 상품은 안내 확인 후 2 영업일 내에 발송됩니다.</p>'],
    ['2026-05-08 09:00:00', '신규 카테고리 출시 안내',
        '<p>새로운 카테고리가 스토어에 추가되었습니다.</p><p>기존 상품과 함께 소개한 새 카테고리는 메인 화면과 Shop 카테고리 메뉴에서 가장 먼저 확인하실 수 있습니다. 카테고리 소개는 상품을 추가하는 순서대로 채워집니다.</p>'],
    ['2026-04-21 22:00:00', '시스템 점검 안내',
        '<p>서비스 안정화를 위한 정기 점검이 진행됩니다.</p><p><strong>점검 시간 동안에는 주문, 장바구니, 회원 정보 변경이 일시적으로 중단됩니다.</strong> 접수된 주문 데이터는 모두 안전하게 보존되며, 점검 종료 후 정상 이용이 가능합니다.</p>'],
    ['2026-04-02 08:50:00', '뉴스레터 오픈 안내',
        '<p>Still Form의 뉴스레터가 열렸습니다.</p><p>입고 소식과 스토어 공지를 가장 먼저 담아 보내드립니다. 회원 정보에서 수신 여부를 언제든 변경하실 수 있습니다.</p>'],
    ['2026-03-15 13:10:00', '구매 인증 사진 촬영 팁',
        '<p>상품을 더 오래 곁들이기 위한 보관 및 촬영 팁을 공유합니다.</p><ul><li>직사광선이 닿지 않는 곳에 보관하면 색과 질감이 오래 유지됩니다.</li><li>자연광 아래에서 찍으면 상품 본연의 색이 살아납니다.</li><li>리뷰 사진은 상품과 함께 사용하는 일상의 한 자리를 담아주세요.</li></ul>'],
];

// 관리자 계정 (기존 notice seed와 동일 작성자)
$adminUserId = \Illuminate\Support\Facades\DB::table('users')->where('name', '관리자')->orderBy('id')->value('id')
    ?? 1;

$created = [];
$skipped = [];

foreach ($posts as [$createdAt, $title, $content]) {
    $exists = \Illuminate\Support\Facades\DB::table('board_posts')
        ->where('board_id', 4)
        ->where('title', $title)
        ->whereNull('deleted_at')
        ->exists();

    if ($exists) {
        $skipped[] = $title;
        continue;
    }

    $post = $postService->createPost('store-notice', [
        'title' => $title,
        'content' => $content,
        'content_mode' => 'html',
        'status' => 'published',
        'user_id' => $adminUserId,
        'author_name' => '관리자',
        'ip_address' => '127.0.0.1',
        'is_notice' => false,
        'is_secret' => false,
        'trigger_type' => 'admin',
        'options' => [],
    ], [], [], ['skip_notification' => true]);

    // created_at 을 과거 월별로 분산 (board_posts.created_at 은 fillable 에 없어 직접 갱신)
    \Illuminate\Support\Facades\DB::table('board_posts')
        ->where('id', $post->id)
        ->update([
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
            'view_count' => 0,
        ]);

    $created[] = $post->id . ':' . $title;
}

echo json_encode([
    'created' => $created,
    'skipped_existing' => $skipped,
    'total_in_board' => \Illuminate\Support\Facades\DB::table('board_posts')
        ->where('board_id', 4)->whereNull('deleted_at')->count(),
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;