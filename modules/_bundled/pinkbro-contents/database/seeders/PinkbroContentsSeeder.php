<?php

namespace Modules\Pinkbro\Contents\Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Pinkbro\Contents\Models\PinkbroMeta;
use Modules\Pinkbro\Contents\Services\ContentMetaService;
use Modules\Sirsoft\Board\Models\Board;
use Modules\Sirsoft\Board\Models\Post;
use Modules\Sirsoft\Board\Services\BoardPermissionService;
use Modules\Sirsoft\Board\Services\BoardService;
use Modules\Sirsoft\Board\Services\PostService;

/**
 * PinkBro CleanCare 콘텐츠 시더 — 게시판 6종 + 콘텐츠 주입.
 *
 * 카피는 `_workspace/pinkbro/reference/content/*.json` 원문 그대로다 (COPY POLICY).
 * 시더는 그 파일들을 런타임에 읽지 않는다 — 배포 사이트에 그 경로가 없으므로
 * 값은 이 소스에 PHP 배열로 옮겨 담았다. 이 중복은 의도된 것이다.
 *
 * 멱등: 게시판은 slug 로, 게시글은 메타 slug(서비스) 또는 제목으로 찾아
 * 이미 있으면 다시 만들지 않는다. 메타는 upsert 라 두 번 실행해도 값이 늘지 않는다.
 */
class PinkbroContentsSeeder extends Seeder
{
    /**
     * 게시판 정의 — 참조 시더(TwentyftContentSeeder)의 config 형태를 그대로 따른다.
     *
     * pinkbro_inquiry 의 permissions 는 문의 접수의 전제다 (비회원 글쓰기).
     * notify_admin_on_post 는 D12 — 새 문의가 들어오면 관리자에게 알림이 간다.
     * 별도 알림 코드는 없다. 이 플래그가 발화 지점이다.
     *
     * pinkbro_media 는 공개 목록에 노출되지 않는 앵커 게시판이다
     * (스케치의 hidden 표식을 실제 컬럼 is_active=false 로 표현).
     */
    private const BOARDS = [
        'pinkbro_service' => [
            'name' => ['ko' => '서비스', 'en' => 'Services'],
            'slug' => 'pinkbro_service',
            // 게시판 설명은 새 문구를 만들지 않는다 (COPY POLICY) — 이름을 그대로 쓴다.
            'description' => ['ko' => '서비스', 'en' => 'Services'],
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
            'notify_admin_on_post' => false,
        ],
        'pinkbro_package' => [
            'name' => ['ko' => '패키지', 'en' => 'Packages'],
            'slug' => 'pinkbro_package',
            'description' => ['ko' => '패키지', 'en' => 'Packages'],
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
            'notify_admin_on_post' => false,
        ],
        'pinkbro_case' => [
            'name' => ['ko' => '작업사례', 'en' => 'Cases'],
            'slug' => 'pinkbro_case',
            'description' => ['ko' => '작업사례', 'en' => 'Cases'],
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
            'notify_admin_on_post' => false,
        ],
        'pinkbro_faq' => [
            'name' => ['ko' => 'FAQ', 'en' => 'FAQ'],
            'slug' => 'pinkbro_faq',
            'description' => ['ko' => 'FAQ', 'en' => 'FAQ'],
            'type' => 'basic',
            'is_active' => true,
            'secret_mode' => 'disabled',
            'use_comment' => false,
            'use_reply' => false,
            'use_report' => false,
            'use_file_upload' => false,
            'max_file_size' => 10,
            'max_file_count' => 5,
            'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'show_view_count' => false,
            'per_page' => 20,
            'new_display_hours' => 0,
            'order_by' => 'created_at',
            'order_direction' => 'DESC',
            'notify_author' => false,
            'notify_admin_on_post' => false,
        ],
        'pinkbro_inquiry' => [
            'name' => ['ko' => '문의', 'en' => 'Inquiries'],
            'slug' => 'pinkbro_inquiry',
            'description' => ['ko' => '문의', 'en' => 'Inquiries'],
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
            // 비회원 문의 접수의 전제 (Task 7 공개 문의 API).
            'permissions' => [
                'posts_write' => ['roles' => ['admin', 'user', 'guest']],
                'attachments_upload' => ['roles' => ['admin', 'user', 'guest']],
            ],
        ],
        'pinkbro_media' => [
            'name' => ['ko' => '미디어', 'en' => 'Media'],
            'slug' => 'pinkbro_media',
            'description' => ['ko' => '미디어', 'en' => 'Media'],
            'type' => 'card',
            // hidden — 공개 게시판 목록에 노출하지 않는 앵커 게시판이다.
            'is_active' => false,
            'secret_mode' => 'disabled',
            'use_comment' => false,
            'use_reply' => false,
            'use_report' => false,
            'use_file_upload' => true,
            'max_file_size' => 10,
            'max_file_count' => 16,
            'allowed_extensions' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            'show_view_count' => false,
            'per_page' => 20,
            'new_display_hours' => 0,
            'order_by' => 'created_at',
            'order_direction' => 'DESC',
            'notify_author' => false,
            'notify_admin_on_post' => false,
        ],
    ];

    /**
     * 서비스 6종 — reference/content/services.json items 원문.
     */
    private const SERVICES = [
        [
            'slug' => 'floor-care',
            'tag' => 'Floor Care',
            'title' => '바닥 기계세척',
            'summary' => '데코타일 기준, 20평 미만, 기본 오염 조건의 기계세척 기준입니다. 매장의 첫인상을 정리하는 핵심 서비스입니다.',
            'criteria' => '면적 초과, 집기 이동이 많은 경우, 왁스 박리·코팅, 본드·접착제·페인트·시멘트·심한 기름때 등 특수오염은 추가비용이 발생할 수 있습니다.',
            'base_price' => '250,000원~',
            'extra_note' => "데코타일 기준\n20평 미만",
            'photo_slot' => 'services_floor',
            'sort' => 1,
        ],
        [
            'slug' => 'glass-care',
            'tag' => 'Glass Care',
            'title' => '유리창 세척',
            'summary' => '1층, 총 가로 10m × 높이 2m 이내 기준입니다. 쇼윈도와 외부 유리는 매장의 인상을 가장 빠르게 바꾸는 구간입니다.',
            'criteria' => '심한 물때·석회, 스티커·시트지·본드·실리콘 제거, 창틀 집중세척, 고소작업 또는 별도 장비 사용은 추가비용이 발생할 수 있습니다. 페어글라스 내부 결로는 세척으로 해결되지 않습니다.',
            'base_price' => '100,000원~',
            'extra_note' => "1층 기준\n가로 10m 이내",
            'photo_slot' => 'services_glass',
            'sort' => 2,
        ],
        [
            'slug' => 'awning-care',
            'tag' => 'Awning Care',
            'title' => '접이식 어닝 세척',
            'summary' => '가로 2m 이내, 접이식 어닝 1개 기준입니다. 카페와 베이커리 외관을 더 선명하게 보여주는 대표 항목입니다.',
            'criteria' => '규격 초과, 다수 어닝, 심한 곰팡이·이끼·기름때, 고소 또는 접근이 어려운 현장은 추가비용이 발생할 수 있습니다. 노후 어닝은 상태에 따라 손상 가능성을 먼저 안내합니다.',
            'base_price' => '150,000원~',
            'extra_note' => "가로 2m 이내\n어닝 1개",
            'photo_slot' => 'services_awning',
            'sort' => 3,
        ],
        [
            'slug' => 'sign-care',
            'tag' => 'Sign Care',
            'title' => '간판 세척',
            'summary' => '1층 전면 평면간판 1개, 가로 4m × 세로 1m 이내 기준입니다. 매장의 정체성을 전달하는 간판을 깔끔하게 정리합니다.',
            'criteria' => '기본 규격 초과, 채널문자·입체간판·돌출간판, 다수 간판, 특수오염, 고소장비 사용은 추가비용이 발생할 수 있습니다. 변색과 탈색은 세척만으로 복원되지 않을 수 있습니다.',
            'base_price' => '150,000원~',
            'extra_note' => "1층 기준\n평면간판 1개",
            'photo_slot' => 'services_sign',
            'sort' => 4,
        ],
        [
            'slug' => 'kitchen-care',
            'tag' => 'Kitchen Care',
            'title' => '상업용 후드 세척',
            'summary' => '일반 규모 상업용 후드의 기본 내부·외부 세척 기준입니다. 주방 위생관리의 핵심 항목으로 반복 관리 수요가 높습니다.',
            'criteria' => '후드 크기와 길이, 필터 수량, 장기간 누적된 심한 기름때, 덕트 내부, 송풍기·팬, 추가 분해작업은 현장 확인 후 추가비용이 발생할 수 있습니다.',
            'base_price' => '250,000원~',
            'extra_note' => "일반 규모 기준\n내부·외부 세척",
            'photo_slot' => 'services_kitchen',
            'sort' => 5,
        ],
        [
            'slug' => 'air-care',
            'tag' => 'Air Care',
            'title' => '에어컨 분해세척',
            'summary' => '분해, 고압세척, 오염 제거, 조립을 기준으로 안내합니다. 냄새와 실내 공기 컨디션을 좌우하는 대표 관리 항목입니다.',
            'criteria' => '특수 또는 대형 모델, 분해 난도가 높은 기종, 오염이 매우 심한 경우, 추가 부품 세척, 작업 접근성이 좋지 않은 경우는 현장 확인 후 추가비용이 발생할 수 있습니다.',
            'base_price' => '80,000원~',
            'extra_note' => "벽걸이 8만 · 스탠드 12만\n1WAY 10만 · 4WAY 15만",
            'photo_slot' => 'services_air',
            'sort' => 6,
            'air_types' => [
                [
                    'kind' => '벽걸이 에어컨',
                    'price_label' => '80,000원',
                    'price_value' => 80000,
                ],
                [
                    'kind' => '스탠드 에어컨',
                    'price_label' => '120,000원',
                    'price_value' => 120000,
                ],
                [
                    'kind' => '천장형 1WAY',
                    'price_label' => '100,000원',
                    'price_value' => 100000,
                ],
                [
                    'kind' => '천장형 4WAY',
                    'price_label' => '150,000원',
                    'price_value' => 150000,
                    'default_selected' => true,
                ],
            ],
        ],
    ];

    /**
     * 패키지 3종 — reference/content/packages.json items 원문.
     */
    private const PACKAGES = [
        [
            'title' => '첫인상 패키지',
            'summary' => '매장의 얼굴이 되는 외관 중심 구성입니다. 손님이 가장 먼저 보는 유리, 간판, 어닝을 한 번에 정리합니다.',
            'includes' => [
                '유리창 세척',
                '간판 세척',
                '접이식 어닝 세척',
            ],
            'base_total' => '400,000원',
            'price' => '380,000원~',
            'discount_rate' => 5,
            'is_featured' => false,
            'sort' => 1,
        ],
        [
            'title' => '위생집중 패키지',
            'summary' => '고객공간과 주방의 체감 위생도를 끌어올리는 구성입니다. 운영환경을 먼저 정리하고 싶은 매장에 적합합니다.',
            'includes' => [
                '바닥 기계세척',
                '상업용 후드 세척',
                '천장형 4WAY 에어컨 분해세척',
            ],
            'base_total' => '650,000원',
            'price' => '617,500원~',
            'discount_rate' => 5,
            'is_featured' => false,
            'sort' => 2,
        ],
        [
            'title' => '프리미엄 패키지',
            'summary' => '매장의 핵심 5개 영역을 한 번에 관리하는 상위 구성입니다. 전체 컨디션을 정리하고 싶은 F&B 매장에 추천합니다.',
            'includes' => [
                '바닥 기계세척',
                '유리창 세척',
                '상업용 후드 세척',
                '천장형 4WAY 에어컨 분해세척',
                '간판 또는 접이식 어닝 세척 택 1',
            ],
            'base_total' => '900,000원',
            'price' => '810,000원~',
            'discount_rate' => 10,
            'is_featured' => true,
            'sort' => 3,
        ],
    ];

    /**
     * 작업사례 4종 — reference/content/cases.json items 원문 + 슬롯 배정.
     */
    private const CASES = [
        [
            'title' => '실제 작업사례 01',
            'summary' => '현장별 작업 과정과 관리 범위를 블로그에서 자세히 확인해 보세요.',
            'blog_url' => '',
            'cover_slot' => 'case_1',
            'sort' => 1,
        ],
        [
            'title' => '실제 작업사례 02',
            'summary' => '실제 매장의 작업 범위와 현장 관리 과정을 블로그에서 확인해 보세요.',
            'blog_url' => '',
            'cover_slot' => 'case_2',
            'sort' => 2,
        ],
        [
            'title' => '실제 작업사례 03',
            'summary' => '작업 전후와 현장 조건을 포함한 상세 내용을 블로그에서 확인해 보세요.',
            'blog_url' => '',
            'cover_slot' => 'case_3',
            'sort' => 3,
        ],
        [
            'title' => '실제 작업사례 04',
            'summary' => '핑크브로클린케어의 실제 현장 관리 사례를 블로그에서 자세히 확인해 보세요.',
            'blog_url' => '',
            'cover_slot' => 'case_4',
            'sort' => 4,
        ],
    ];

    /**
     * FAQ 8종 — reference/content/faq.json items 원문.
     *
     * 답변은 원문(body.html 333~361행)의 인라인 마크업을 그대로 저장한다 — 여덟 답변
     * 모두 첫 문장을 <strong> 으로 감싼다. 강조 경계는 원본과 글자 단위로 일치한다
     * (345행은 "네. 기본가는 … 150,000원~입니다." 까지, 349행은 "아닙니다. …
     * 기준가입니다." 까지). 표시 계층이 경계를 추정하지 않는다.
     */
    private const FAQ = [
        [
            'question' => '상가 바닥 기계세척 비용은 얼마인가요?',
            'answer' => '<strong>바닥 기계세척은 기본 250,000원부터 시작합니다.</strong> 데코타일, 20평 미만, 기본 오염 조건 기준이며 면적, 집기 이동, 특수오염, 코팅·박리 여부 등에 따라 최종 금액이 달라질 수 있습니다.',
            'sort' => 1,
        ],
        [
            'question' => '카페·음식점 유리창 세척 비용은 얼마인가요?',
            'answer' => '<strong>유리창 세척은 기본 100,000원부터 시작합니다.</strong> 1층, 총 가로 10m × 높이 2m 이내, 기본 오염 기준이며 심한 물때·석회, 시트지·본드 제거, 창틀 집중세척, 고소작업은 추가비용이 발생할 수 있습니다.',
            'sort' => 2,
        ],
        [
            'question' => '상업용 후드 세척 비용은 얼마인가요?',
            'answer' => '<strong>상업용 후드 세척은 기본 250,000원부터 시작합니다.</strong> 일반 규모 후드의 기본 기름오염과 기본 내부·외부 세척 기준이며 후드 길이, 필터 수량, 누적 기름때, 덕트·팬·추가 분해 범위에 따라 달라질 수 있습니다.',
            'sort' => 3,
        ],
        [
            'question' => '에어컨 분해세척은 종류별로 가격이 다른가요?',
            'answer' => '<strong>네. 기본가는 벽걸이 80,000원~, 스탠드 120,000원~, 천장형 1WAY 100,000원~, 천장형 4WAY 150,000원~입니다.</strong> 기종, 대수, 분해 난도, 오염 상태와 접근성에 따라 확정 견적이 달라질 수 있습니다.',
            'sort' => 4,
        ],
        [
            'question' => '홈페이지에 표시된 금액이 최종 확정가격인가요?',
            'answer' => '<strong>아닙니다. 홈페이지 금액은 기본 작업 기준가입니다.</strong> 실제 확정 견적은 면적, 수량, 오염도, 작업 구조, 접근성, 고소장비 및 추가 작업 범위를 확인한 뒤 안내합니다.',
            'sort' => 5,
        ],
        [
            'question' => '여러 서비스를 같은 날 함께 맡기면 할인이 있나요?',
            'answer' => '<strong>같은 매장·같은 일정 기준으로 2개 항목 3%, 3~4개 항목 5%, 5개 이상 10% 할인이 적용됩니다.</strong> 할인은 기본 작업금액 합계 기준이며 특수오염, 추가면적, 고소장비, 장비대여 등 추가비용은 제외됩니다.',
            'sort' => 6,
        ],
        [
            'question' => '어느 지역까지 출장 가능한가요?',
            'answer' => '<strong>부산·울산·경남 전 지역을 기본 출장지역으로 안내하고 있습니다.</strong> 현장 위치와 작업 내용에 따라 일정 및 출장 가능 여부를 상담 단계에서 확인해 드립니다.',
            'sort' => 7,
        ],
        [
            'question' => '사진을 보내서 견적 문의하려면 어떻게 하나요?',
            'answer' => '<strong>현장 사진은 카카오채널로 보내주시면 가장 편리합니다.</strong> 휴대폰으로 촬영한 매장 전체와 관리가 필요한 부분 사진을 카카오채널로 보내주세요. 홈페이지에서는 사진 없이 업종, 필요 서비스, 규모, 연락처와 요청사항만 남겨도 문의할 수 있습니다.',
            'sort' => 8,
        ],
    ];

    /**
     * 사이트 레벨 — reference/content/site.json 원문 + 공유 이미지 슬롯.
     */
    private const SITE = [
        'brand_name' => '핑크브로클린케어',
        'brand_name_en' => 'PINKBRO CLEANCARE',
        'tagline' => '깨끗한 공간, 더 나은 오늘',
        'eyebrow' => 'F&B Hygiene Care Specialist',
        'phone' => '010-4348-8158',
        'kakao_channel' => 'http://pf.kakao.com/_gmcuG',
        'region' => '부울경 전 지역 출장',
        'og_image_slot' => 'site_og',
    ];

    /**
     * 섹션 문구 — reference/content/copy.json 원문 전량.
     */
    private const COPY = [
        'hero_headline' => "F&B 매장 전문\n<em>위생 클린케어</em>",
        'hero_lead' => "카페, 음식점, 베이커리, 주점, 프랜차이즈 매장까지.\n<strong>고객공간부터 주방, 공조환경까지 필요한 위생관리를 한 곳에서 제공합니다.</strong>",
        'hero_pills' => [
            '부울경 전 지역 출장',
            '기본가격 공개',
            '현장확인 후 확정견적',
        ],
        // 원문 body.html 32·33행(.hero-actions > a.btn.primary / a.btn.soft).
        'hero_cta_primary' => '간편견적 문의하기',
        'hero_cta_secondary' => '가격 · 예상견적 보기',
        'about_message' => '손님이 처음 보는 외관, 매일 밟는 바닥, 오래 사용하는 에어컨, 반복적으로 사용하는 후드까지. 핑크브로는 F&B 매장에 필요한 관리 포인트를 브랜드 기준으로 정리합니다.',
        'about_perspectives' => [
            [
                'title' => 'F&B 업종에 맞는 핵심 서비스만 선별합니다.',
                'body' => '바닥 기계세척, 유리창, 접이식 어닝, 간판, 상업용 후드, 에어컨 분해세척처럼 실제 F&B 매장에서 체감도가 높은 항목을 중심으로 구성했습니다.',
            ],
            [
                'title' => '기본가격은 먼저 공개하고, 확정 견적은 현장 기준으로 안내합니다.',
                'body' => '고객이 대략적인 예산을 쉽게 가늠할 수 있도록 시작가를 먼저 보여드립니다. 다만 최종 견적은 현장 상태와 작업 범위를 확인한 뒤 확정합니다.',
            ],
            [
                'title' => '정해진 패키지를 강매하지 않고, 필요한 항목만 골라 조합할 수 있습니다.',
                'body' => '단일 작업부터 패키지 조합까지 매장 상황에 맞게 선택할 수 있도록 설계했습니다. 찾으시는 항목이 없더라도 기타 F&B 관리 문의를 함께 받을 수 있습니다.',
            ],
        ],
        // 원문 body.html 68행(.why-overlay > .eyebrow) / 76행(.copy > .eyebrow).
        'about_stage_eyebrow' => 'Why Pinkbro',
        'about_side_eyebrow' => 'Brand Perspective',
        'service_intro' => "F&B 매장의 핵심 관리 영역을\n한 곳에서 함께 관리합니다.",
        'package_intro' => "매장에 필요한 것만 골라\n더 효율적으로 관리하세요.",
        'pricing_notice' => "표기 금액은 모두\n기본 작업 기준가입니다.",
        'pricing_flow' => "기본가 확인\n→ 문의 접수\n→ 현장확인 후 확정견적",
        'projects_intro' => "실제 현장에서 확인해 보세요.\n최근 작업 사례입니다.",
        'projects_note' => '현장별 작업 결과는 오염 상태, 소재, 작업 범위와 현장 조건에 따라 달라질 수 있습니다.',
        'estimate_intro' => "필요한 내용을 남겨주시면\n확인 후 안내드립니다.",
        'estimate_note' => '홈페이지에서는 사진 없이 업종, 필요한 서비스, 대략적인 규모와 연락처를 남겨주세요. 현장 사진으로 빠르게 상담받고 싶으시면 카카오채널을 이용하시면 편리합니다.',
        'faq_intro' => "견적 전에 많이 묻는 내용을\n먼저 확인해 보세요.",
        'footer_text' => '© PINKBRO CLEANCARE. F&B 매장에 필요한 위생 클린케어를 한 번에.',
        // 원문 body.html 479~488행(footer .footer-col ×3) — 푸터 4컬럼의 제목·항목.
        // 항목 문구는 원문 <br> 을 개행(\n)으로 보존한 스칼라 값이다(표시 계층의
        // renderCopyText 가 <br> 로 렌더한다).
        'footer_core_service_heading' => 'Core Service',
        'footer_core_service' => "바닥 기계세척\n유리창 세척\n접이식 어닝 세척\n간판 세척",
        'footer_more_service_heading' => 'More Service',
        'footer_more_service' => "상업용 후드 세척\n에어컨 분해세척\n기타 F&B 관리 문의",
        'footer_contact_heading' => 'Contact',
        // 원문 488행 연락처 3줄 — 값(전화번호·채널 URL·지역)은 SITE 도메인이 갖고
        // (SITE.phone / SITE.kakao_channel / SITE.region), 표시 라벨만 COPY 로 온다.
        'footer_contact_phone_label' => '상담문의',
        'footer_contact_kakao_label' => '카카오채널 핑크브로클린케어',
        'about_heading' => '좋은 매장은 공간의 컨디션까지 다릅니다.',
        'about_side_heading' => "매장에 꼭 필요한 위생관리만\n더 분명하게 제안합니다.",
        'hero_visual_label' => 'PINKBRO F&B HYGIENE CARE',
        // 원문 53행(.hero-visual-bottom span) — 아래 `hero_visual_brand_message`(b)의 라벨이다.
        // 기존 `hero_visual_label`(상단 배지)과 다른 자리이므로 이름을 구분했다.
        'hero_visual_message_label' => 'BRAND MESSAGE',
        'hero_visual_brand_message' => '깨끗한 공간, 더 나은 오늘',
        'hero_visual_body' => "매장에 필요한 위생관리만\n더 체계적으로.",
        'hero_scope' => [
            [
                'no' => '01',
                'title' => 'Customer Area',
                'body' => '바닥 · 유리 · 어닝 · 간판',
            ],
            [
                'no' => '02',
                'title' => 'Kitchen Hygiene',
                'body' => '상업용 후드 · 주방 관리',
            ],
            [
                'no' => '03',
                'title' => 'Air Care',
                'body' => '에어컨 분해세척',
            ],
        ],
        'service_intro_sub' => '서비스별 기본 작업 조건과 시작가를 먼저 확인할 수 있습니다. 더 자세한 기준은 항목별 안내에서 확인해 주세요.',
        'service_detail_label' => '자세한 작업기준 확인',
        'extra_box_heading' => '찾으시는 서비스가 목록에 없나요?',
        'extra_box_body' => '메인에 안내된 항목 외에도 F&B 매장과 상업공간 관련 기타 관리가 필요하시면 문의해 주세요. 사진 확인이 필요한 경우 카카오채널로 보내주시면 현장에 맞는 범위를 함께 검토해 드립니다.',
        // 원문 body.html 100행(.section-head .copy > .eyebrow) / 166행(extra-box CTA).
        'service_eyebrow' => 'Core Service',
        'extra_box_cta' => '기타 서비스 문의하기',
        'package_intro_sub' => '첫인상, 주방, 공조환경까지 F&B 매장에서 자주 선택하는 조합을 패키지 기준으로 정리했습니다. 필요한 항목만 선택해 단일 작업과 패키지를 자유롭게 비교할 수 있습니다.',
        // 원문 body.html 175행(package-stage .eyebrow) / 182·197·212행(.pkg-label).
        'package_stage_eyebrow' => 'Pinkbro F&B Package',
        'package_a_label' => 'A Package',
        'package_b_label' => 'B Package',
        'package_c_label' => 'C Package',
        // 원문 .pkg-note 는 한 줄이지만(193·208·225행) 앞줄(기본가 합계)과
        // 뒷줄(동시작업 할인)을 나눠 담는다 — 표시 계층이 사이에 <br> 을 둔다.
        'package_a_note' => '기본가 합계 400,000원',
        'package_a_note_sub' => '3개 항목 동시작업 5% 적용',
        'package_b_note' => '기본가 합계 650,000원',
        'package_b_note_sub' => '3개 항목 동시작업 5% 적용',
        'package_c_note' => '기본가 합계 900,000원',
        'package_c_note_sub' => '5개 항목 동시작업 10% 적용',
        'benefit_heading' => "같은 매장, 같은 일정이라면\n함께 맡길수록 더 효율적입니다.",
        'benefit_sub' => '서비스 종류 기준으로 항목을 계산합니다. 예를 들어 어닝이 3개여도 ‘어닝 세척’ 1개 서비스 항목으로 계산합니다. 추가 면적, 특수오염, 고소장비, 장비 대여 비용은 할인 대상에서 제외됩니다.',
        'benefit_items' => [
            [
                'condition' => '1개 항목',
                'amount_label' => '정상가',
            ],
            [
                'condition' => '2개 항목',
                'amount_label' => '3%',
            ],
            [
                'condition' => '3~4개 항목',
                'amount_label' => '5%',
            ],
            [
                'condition' => '5개 이상',
                'amount_label' => '10%',
            ],
        ],
        // 원문 body.html 232행(benefit-box .eyebrow).
        'benefit_eyebrow' => 'Multi-Service Benefit',
        'pricing_heading' => "가격은 투명하게,\n견적은 더 분명하게 안내합니다.",
        'pricing_sub' => '홈페이지에서는 기본 작업 기준가를 먼저 보여드립니다. 실제 확정 견적은 현장 상태와 작업 범위를 확인한 뒤 안내합니다.',
        'pricing_notice_sub' => '대략적인 예산을 쉽게 가늠할 수 있도록 시작가를 먼저 공개합니다.',
        // 원문 body.html 264행(notice-b) — 첫 문장이 <strong> 이다. 마크업은 원본 그대로
        // 저장하고, 표시 계층(Hero 의 renderCopyText)이 요소로 렌더한다.
        'pricing_field' => '<strong>확정 견적은 현장확인 원칙</strong>으로 진행합니다. 면적, 오염 상태, 작업 구조, 고소작업 여부, 추가 분해 범위에 따라 최종 금액은 달라질 수 있습니다.',
        'pricing_flow_label' => 'Estimate Flow',
        // 원문 body.html 251행(pricing section-head .eyebrow) / 259행(notice-a .eyebrow).
        'pricing_eyebrow' => 'Pricing',
        'pricing_notice_label' => 'Pricing Notice',
        'estimator_heading' => '예상 기본금액을 먼저 확인해 보세요.',
        'estimator_sub' => '항목을 체크하면 기본가 합계와 동시작업 할인율이 자동으로 계산됩니다. 예상금액은 참고용이며, 최종 견적은 현장 기준으로 확정됩니다.',
        // 원문 body.html 275행(estimator section-head .eyebrow) /
        // 291행(.air-select label) / 301행(summary-box h3) /
        // 303~306행(summary-row span 4종) / 309행(summary-total b) /
        // 314~315행(summary-actions CTA 2종).
        'estimator_eyebrow' => 'Expected Estimate',
        'estimator_air_label' => '에어컨 종류 선택',
        'estimator_row_count' => '선택한 서비스',
        'estimator_row_base' => '기본가 합계',
        'estimator_row_discount' => '적용 할인',
        'estimator_row_discount_amount' => '할인 금액',
        'estimator_summary_total_label' => 'Estimated Base Price',
        'estimator_cta_submit' => '이 구성으로 견적 문의하기',
        'estimator_cta_kakao' => '카카오채널 문의하기',
        'estimator_summary_heading' => '예상 기본금액 요약',
        'estimator_summary_note' => '모든 금액은 기본 작업 기준가입니다. 최종 확정 견적은 현장 상태, 면적, 오염도, 추가 작업 여부를 확인한 뒤 안내합니다.',
        // 원문 body.html 326행(faq-intro .eyebrow).
        'faq_eyebrow' => 'FAQ',
        'faq_intro_sub' => '가격, 작업 기준, 출장지역처럼 상담 전에 가장 많이 확인하는 내용을 짧고 분명하게 정리했습니다.',
        // 원문 body.html 371행(projects section-head .eyebrow) /
        // 379행 카드 4장의 .project-kicker / .project-link.
        'projects_eyebrow' => 'Recent Projects',
        'projects_card_kicker' => 'PINKBRO PROJECT',
        'projects_link_label' => '작업사례 자세히 보기',
        'projects_sub' => '핑크브로클린케어가 직접 진행한 현장의 작업 내용과 전후 과정은 네이버 블로그에서 자세히 확인할 수 있습니다.',
        'estimate_checklist' => [
            '홈페이지 문의는 사진 없이 간단한 정보만 남기면 됩니다.',
            '사진을 보내실 경우 휴대폰에서 카카오채널로 바로 보내주세요.',
            '표기 금액은 기본가이며 확정 견적은 현장 조건 확인 후 안내드립니다.',
        ],
        'estimate_panel_heading' => '간편견적 문의하기',
        'estimate_panel_sub' => '업종, 필요한 서비스와 규모, 연락처, 요청사항을 남겨주세요. 사진 첨부 없이 간단하게 접수할 수 있습니다.',
        // 원문 body.html 456행(.panel-note) — 첫 문장이 <strong> 이고 <br> 은 줄바꿈(\n)으로
        // 보존한다. 마크업은 원본 그대로다.
        'estimate_panel_note' => "<strong>사진 첨부가 필요하신가요?</strong>\n휴대폰으로 촬영한 현장 사진은 카카오채널로 보내주시면 가장 빠르게 확인할 수 있습니다. 홈페이지 문의는 사진 없이 접수됩니다.",
        'footer_brand_desc' => '핑크브로클린케어는 카페, 음식점, 베이커리, 주점, 프랜차이즈 등 F&B 매장을 위한 전문 위생 클린케어 브랜드입니다.',
        // --- 헤더·모바일바 (원문 body.html 15·16·497·498·499행) ---
        // 16행(헤더 mobile-link)과 498행(모바일바)은 같은 문자열이라 키를 하나로 쓴다.
        'header_cta' => '간편견적 문의',
        'mobile_cta_estimate' => '간편견적',
        'mobile_cta_phone' => '전화상담',
        'mobile_cta_kakao' => '카카오문의',
    ];

    /**
     * 동시작업 할인 3단계 — reference/content/discount.json steps 원문.
     */
    private const DISCOUNT_STEPS = [
        [
            'condition' => '2개 항목',
            'amount_label' => '3%',
        ],
        [
            'condition' => '3~4개 항목',
            'amount_label' => '5%',
        ],
        [
            'condition' => '5개 이상',
            'amount_label' => '10%',
        ],
    ];

    /**
     * 시더 실행.
     */
    public function run(): void
    {
        $this->info('핑크브로 콘텐츠 시딩 시작...');

        $boards = $this->ensureBoards();

        $this->seedServices($boards['pinkbro_service']);
        $this->seedPackages($boards['pinkbro_package']);
        $this->seedCases($boards['pinkbro_case']);
        $this->seedFaq($boards['pinkbro_faq']);
        $this->seedSiteLevel();

        $this->info('핑크브로 콘텐츠 시딩 완료.');
    }

    /**
     * 게시판 6종을 보장한다.
     *
     * @return array<string, Board> slug => Board
     */
    private function ensureBoards(): array
    {
        $boards = [];

        foreach (self::BOARDS as $slug => $config) {
            $boards[$slug] = $this->ensureBoard($config);
        }

        return $boards;
    }

    /**
     * 게시판을 보장합니다.
     *
     * 이미 있으면 동적 권한만 재확인한다 (참조 시더와 같은 멱등 계약).
     */
    private function ensureBoard(array $config): Board
    {
        $existing = Board::where('slug', $config['slug'])->first();

        if ($existing) {
            $this->info("  - {$config['slug']} 게시판이 이미 존재합니다. 동적 권한을 보장합니다.");
            app(BoardPermissionService::class)->ensureBoardPermissions($existing);

            return $existing;
        }

        $this->info("  - {$config['slug']} 게시판을 생성합니다.");

        $adminIds = User::whereHas('roles', function ($query) {
            $query->where('identifier', 'admin');
        })->pluck('uuid')->toArray();

        $config['board_manager_ids'] = $adminIds;

        return app(BoardService::class)->createBoard($config);
    }

    /**
     * 서비스 6종 — 게시글 1건 + service 도메인 메타.
     */
    private function seedServices(Board $board): void
    {
        $meta = app(ContentMetaService::class);

        foreach (self::SERVICES as $item) {
            $post = $this->findSeededPost($board, MetaDomain::SERVICE, $item['slug'], $item['title']);

            if (! $post) {
                $post = $this->createPost($board->slug, $item['title'], $item['summary']);
            }

            $meta->setMany($board->id, $post->id, MetaDomain::SERVICE, array_merge($item, [
                // 소스에 노출 플래그가 없다 — 시드되는 항목은 전부 노출이다.
                'is_visible' => true,
            ]));
        }
    }

    /**
     * 패키지 3종.
     */
    private function seedPackages(Board $board): void
    {
        $meta = app(ContentMetaService::class);

        foreach (self::PACKAGES as $item) {
            $post = $this->findSeededPost($board, MetaDomain::PACKAGE, null, $item['title']);

            if (! $post) {
                $post = $this->createPost($board->slug, $item['title'], $item['summary']);
            }

            $meta->setMany($board->id, $post->id, MetaDomain::PACKAGE, $item);
        }
    }

    /**
     * 작업사례 4종 — blog_url 은 빈 문자열로 시드한다 (SPEC §12, 사용자 입력 대기).
     */
    private function seedCases(Board $board): void
    {
        $meta = app(ContentMetaService::class);

        foreach (self::CASES as $item) {
            $post = $this->findSeededPost($board, MetaDomain::CASE, null, $item['title']);

            if (! $post) {
                $post = $this->createPost($board->slug, $item['title'], $item['summary']);
            }

            $meta->setMany($board->id, $post->id, MetaDomain::CASE, $item);
        }
    }

    /**
     * FAQ 8종 — 게시글 제목은 질문, 본문은 답변이다.
     */
    private function seedFaq(Board $board): void
    {
        $meta = app(ContentMetaService::class);

        foreach (self::FAQ as $item) {
            $post = $this->findSeededPost($board, MetaDomain::FAQ, null, $item['question']);

            if (! $post) {
                $post = $this->createPost($board->slug, $item['question'], $item['answer']);
            }

            $meta->setMany($board->id, $post->id, MetaDomain::FAQ, $item);
        }
    }

    /**
     * 사이트 레벨 메타 — 게시판·게시글에 매이지 않는다 (board_id/post_id null).
     */
    private function seedSiteLevel(): void
    {
        $meta = app(ContentMetaService::class);

        $meta->setMany(null, null, MetaDomain::SITE, self::SITE);
        $meta->setMany(null, null, MetaDomain::COPY, self::COPY);
        $meta->setMany(null, null, MetaDomain::DISCOUNT, ['steps' => self::DISCOUNT_STEPS]);
    }

    /**
     * 이미 시드된 게시글을 찾는다 (멱등 키).
     *
     * slug 메타가 있는 도메인은 slug 로, 없으면 게시판 안의 제목으로 찾는다.
     */
    private function findSeededPost(Board $board, MetaDomain $domain, ?string $slug, string $title): ?Post
    {
        if ($slug !== null && $slug !== '') {
            $row = PinkbroMeta::query()
                ->where('board_id', $board->id)
                ->where('domain', $domain->value)
                ->where('key', 'slug')
                ->get()
                ->first(fn (PinkbroMeta $meta): bool => (string) $meta->value === $slug);

            if ($row?->post_id) {
                $post = Post::query()->where('board_id', $board->id)->find($row->post_id);

                if ($post) {
                    return $post;
                }
            }
        }

        return Post::query()
            ->where('board_id', $board->id)
            ->where('title', $title)
            ->first();
    }

    /**
     * 콘텐츠 게시글 1건을 만든다.
     *
     * 공식 쓰기 경로(PostService)를 쓴다 — 게시글 수 동기화·캐시 무효화가 함께 처리된다.
     * HTTP 가 아니므로 ip_address 는 시더 로컬 값이다.
     */
    private function createPost(string $boardSlug, string $title, string $content): Post
    {
        return app(PostService::class)->createPost($boardSlug, [
            'title' => $title,
            'content' => $content,
            'content_mode' => 'text',
            'ip_address' => '127.0.0.1',
            'is_notice' => false,
            'is_secret' => false,
            'status' => 'published',
        ]);
    }

    /**
     * 콘솔 출력 — artisan 밖(테스트 컨테이너)에서 호출돼도 죽지 않는다.
     */
    private function info(string $message): void
    {
        $this->command?->info($message);
    }
}
