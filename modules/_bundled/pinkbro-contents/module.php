<?php

namespace Modules\Pinkbro\Contents;

use App\Extension\AbstractModule;
use Illuminate\Database\Seeder;

/**
 * PinkBro Contents 모듈
 *
 * PinkBro CleanCare 랜딩의 콘텐츠(서비스·패키지·사례·FAQ), 문의 접수,
 * 미디어 슬롯, 사이트 설정을 관리합니다.
 *
 * G7 게시판(sirsoft-board)을 대체하지 않습니다.
 * Board + Meta + Admin UI + API bridge 역할만 수행합니다.
 */
class Module extends AbstractModule
{
    /**
     * 모듈 역할 정의
     *
     * @return array<int, array<string, mixed>>
     */
    public function getRoles(): array
    {
        return [];
    }

    /**
     * 모듈 권한 목록 반환
     *
     * 계층 구조: 모듈(1레벨) → 카테고리(2레벨) → 개별 권한(3레벨)
     *
     * @return array<string, mixed>
     */
    public function getPermissions(): array
    {
        return [
            'name' => [
                'ko' => '핑크브로 콘텐츠',
                'en' => 'PinkBro Contents',
            ],
            'description' => [
                'ko' => '핑크브로클린케어 사이트 콘텐츠 관리 권한',
                'en' => 'PinkBro CleanCare site content permissions',
            ],
            'categories' => [
                [
                    'identifier' => 'content',
                    'resource_route_key' => 'content',
                    'owner_key' => null,
                    'name' => [
                        'ko' => '콘텐츠',
                        'en' => 'Content',
                    ],
                    'description' => [
                        'ko' => '서비스·패키지·사례·FAQ 관리',
                        'en' => 'Services, packages, cases, FAQ',
                    ],
                    'permissions' => [
                        [
                            'action' => 'read',
                            'name' => [
                                'ko' => '조회',
                                'en' => 'Read',
                            ],
                            'description' => [
                                'ko' => '콘텐츠를 조회합니다.',
                                'en' => 'View content.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'create',
                            'name' => [
                                'ko' => '생성',
                                'en' => 'Create',
                            ],
                            'description' => [
                                'ko' => '콘텐츠를 생성합니다.',
                                'en' => 'Create content.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'update',
                            'name' => [
                                'ko' => '수정',
                                'en' => 'Update',
                            ],
                            'description' => [
                                'ko' => '콘텐츠를 수정합니다.',
                                'en' => 'Update content.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'delete',
                            'name' => [
                                'ko' => '삭제',
                                'en' => 'Delete',
                            ],
                            'description' => [
                                'ko' => '콘텐츠를 삭제합니다.',
                                'en' => 'Delete content.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin'],
                        ],
                    ],
                ],
                [
                    'identifier' => 'media',
                    'resource_route_key' => 'media',
                    'owner_key' => null,
                    'name' => [
                        'ko' => '미디어',
                        'en' => 'Media',
                    ],
                    'description' => [
                        'ko' => '이미지 슬롯 관리',
                        'en' => 'Image slot management',
                    ],
                    'permissions' => [
                        [
                            'action' => 'read',
                            'name' => [
                                'ko' => '조회',
                                'en' => 'Read',
                            ],
                            'description' => [
                                'ko' => '미디어 슬롯을 조회합니다.',
                                'en' => 'View media slots.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'update',
                            'name' => [
                                'ko' => '수정',
                                'en' => 'Update',
                            ],
                            'description' => [
                                'ko' => '미디어 슬롯을 수정합니다.',
                                'en' => 'Update media slots.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                    ],
                ],
                [
                    'identifier' => 'site',
                    'resource_route_key' => 'site',
                    'owner_key' => null,
                    'name' => [
                        'ko' => '사이트 설정',
                        'en' => 'Site',
                    ],
                    'description' => [
                        'ko' => '연락처·브랜드 문구',
                        'en' => 'Contact and brand copy',
                    ],
                    'permissions' => [
                        [
                            'action' => 'read',
                            'name' => [
                                'ko' => '조회',
                                'en' => 'Read',
                            ],
                            'description' => [
                                'ko' => '사이트 설정을 조회합니다.',
                                'en' => 'View site settings.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'update',
                            'name' => [
                                'ko' => '수정',
                                'en' => 'Update',
                            ],
                            'description' => [
                                'ko' => '사이트 설정을 수정합니다.',
                                'en' => 'Update site settings.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                    ],
                ],
                [
                    'identifier' => 'inquiries',
                    'resource_route_key' => 'inquiries',
                    'owner_key' => null,
                    'name' => [
                        'ko' => '문의',
                        'en' => 'Inquiries',
                    ],
                    'description' => [
                        'ko' => '문의 조회·상태 변경',
                        'en' => 'Inquiry list and status',
                    ],
                    'permissions' => [
                        [
                            'action' => 'read',
                            'name' => [
                                'ko' => '조회',
                                'en' => 'Read',
                            ],
                            'description' => [
                                'ko' => '문의를 조회합니다.',
                                'en' => 'View inquiries.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'update',
                            'name' => [
                                'ko' => '수정',
                                'en' => 'Update',
                            ],
                            'description' => [
                                'ko' => '문의 처리 상태를 수정합니다.',
                                'en' => 'Update inquiry status.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * 모듈 설치 시 실행할 시더 목록 반환
     *
     * @return array<class-string<Seeder>>
     */
    public function getSeeders(): array
    {
        // 시더(PinkbroContentsSeeder)는 이후 태스크에서 추가한다.
        // 지금 참조하면 아직 없는 클래스라 모듈 오토로드 시 class-not-found 가 난다.
        return [];
    }

    /**
     * 훅 리스너 목록 반환
     *
     * @return array<class-string>
     */
    public function getHookListeners(): array
    {
        // 고아 메타 정리 리스너(MetaCleanupListener)는 이후 태스크에서 추가한다.
        // 같은 이유로 지금은 비운다.
        return [];
    }

    /**
     * 관리자 메뉴 정의
     *
     * 핑크브로 콘텐츠
     * ├ 콘텐츠
     * ├ 문의
     * ├ 미디어
     * ├ 사이트 설정
     * └ 문구
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAdminMenus(): array
    {
        return [
            [
                'name' => [
                    'ko' => '핑크브로 콘텐츠',
                    'en' => 'PinkBro Contents',
                ],
                'slug' => 'pinkbro-contents',
                'url' => '/admin/pinkbro-contents',
                'icon' => 'fas fa-layer-group',
                'order' => 60,
                'permission' => 'pinkbro-contents.content.read',
                'children' => [
                    [
                        'name' => [
                            'ko' => '콘텐츠',
                            'en' => 'Content',
                        ],
                        'slug' => 'pinkbro-contents-content',
                        'url' => '/admin/pinkbro-contents/content/service',
                        'order' => 10,
                        'permission' => 'pinkbro-contents.content.read',
                    ],
                    [
                        'name' => [
                            'ko' => '문의',
                            'en' => 'Inquiries',
                        ],
                        'slug' => 'pinkbro-contents-inquiry',
                        'url' => '/admin/pinkbro-contents/inquiry',
                        'order' => 20,
                        'permission' => 'pinkbro-contents.inquiries.read',
                    ],
                    [
                        'name' => [
                            'ko' => '미디어',
                            'en' => 'Media',
                        ],
                        'slug' => 'pinkbro-contents-media',
                        'url' => '/admin/pinkbro-contents/media',
                        'order' => 30,
                        'permission' => 'pinkbro-contents.media.read',
                    ],
                    [
                        'name' => [
                            'ko' => '사이트 설정',
                            'en' => 'Site',
                        ],
                        'slug' => 'pinkbro-contents-site',
                        'url' => '/admin/pinkbro-contents/site',
                        'order' => 40,
                        'permission' => 'pinkbro-contents.site.read',
                    ],
                    [
                        'name' => [
                            'ko' => '문구',
                            'en' => 'Copy',
                        ],
                        'slug' => 'pinkbro-contents-copy',
                        'url' => '/admin/pinkbro-contents/copy',
                        'order' => 50,
                        'permission' => 'pinkbro-contents.site.read',
                    ],
                ],
            ],
        ];
    }
}
