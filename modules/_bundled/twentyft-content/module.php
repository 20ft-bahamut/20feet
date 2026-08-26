<?php

namespace Modules\Twentyft\Content;

use App\Extension\AbstractModule;

/**
 * 20ft Content 모듈
 *
 * G7 게시판을 대체하지 않습니다.
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
     * @return array<string, mixed>
     */
    public function getPermissions(): array
    {
        return [
            'name' => [
                'ko' => '20ft 콘텐츠',
                'en' => '20ft Content',
            ],
            'description' => [
                'ko' => '20ft Website 콘텐츠 관리 권한',
                'en' => '20ft Website content management permissions',
            ],
            'categories' => [
                [
                    'identifier' => 'portfolio',
                    'resource_route_key' => 'portfolio',
                    'owner_key' => null,
                    'name' => [
                        'ko' => 'Portfolio',
                        'en' => 'Portfolio',
                    ],
                    'description' => [
                        'ko' => 'Portfolio 프로젝트 관리',
                        'en' => 'Portfolio project management',
                    ],
                    'permissions' => [
                        [
                            'action' => 'read',
                            'name' => [
                                'ko' => 'Portfolio 조회',
                                'en' => 'View Portfolio',
                            ],
                            'description' => [
                                'ko' => 'Portfolio 프로젝트를 조회합니다.',
                                'en' => 'View Portfolio projects.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'create',
                            'name' => [
                                'ko' => 'Portfolio 생성',
                                'en' => 'Create Portfolio',
                            ],
                            'description' => [
                                'ko' => '새 Portfolio 프로젝트를 등록합니다.',
                                'en' => 'Create a new Portfolio project.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'update',
                            'name' => [
                                'ko' => 'Portfolio 수정',
                                'en' => 'Update Portfolio',
                            ],
                            'description' => [
                                'ko' => 'Portfolio 프로젝트를 수정합니다.',
                                'en' => 'Update Portfolio projects.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'delete',
                            'name' => [
                                'ko' => 'Portfolio 삭제',
                                'en' => 'Delete Portfolio',
                            ],
                            'description' => [
                                'ko' => 'Portfolio 프로젝트를 삭제합니다.',
                                'en' => 'Delete Portfolio projects.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin'],
                        ],
                    ],
                ],
                [
                    'identifier' => 'superbify',
                    'resource_route_key' => 'superbify',
                    'owner_key' => null,
                    'name' => [
                        'ko' => 'SuperBify',
                        'en' => 'SuperBify',
                    ],
                    'description' => [
                        'ko' => 'SuperBify 제품 관리',
                        'en' => 'SuperBify product management',
                    ],
                    'permissions' => [
                        [
                            'action' => 'read',
                            'name' => [
                                'ko' => 'SuperBify 조회',
                                'en' => 'View SuperBify',
                            ],
                            'description' => [
                                'ko' => 'SuperBify 제품을 조회합니다.',
                                'en' => 'View SuperBify products.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'create',
                            'name' => [
                                'ko' => 'SuperBify 생성',
                                'en' => 'Create SuperBify',
                            ],
                            'description' => [
                                'ko' => '새 SuperBify 제품을 등록합니다.',
                                'en' => 'Create a new SuperBify product.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'update',
                            'name' => [
                                'ko' => 'SuperBify 수정',
                                'en' => 'Update SuperBify',
                            ],
                            'description' => [
                                'ko' => 'SuperBify 제품을 수정합니다.',
                                'en' => 'Update SuperBify products.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'delete',
                            'name' => [
                                'ko' => 'SuperBify 삭제',
                                'en' => 'Delete SuperBify',
                            ],
                            'description' => [
                                'ko' => 'SuperBify 제품을 삭제합니다.',
                                'en' => 'Delete SuperBify products.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin'],
                        ],
                    ],
                ],
                [
                    'identifier' => 'inquiries',
                    'resource_route_key' => 'inquiry',
                    'owner_key' => null,
                    'name' => [
                        'ko' => '프로젝트 문의',
                        'en' => 'Project Inquiry',
                    ],
                    'description' => [
                        'ko' => '프로젝트 문의 관리',
                        'en' => 'Project inquiry management',
                    ],
                    'permissions' => [
                        [
                            'action' => 'read',
                            'name' => [
                                'ko' => '프로젝트 문의 조회',
                                'en' => 'View Project Inquiries',
                            ],
                            'description' => [
                                'ko' => '프로젝트 문의 목록을 조회합니다.',
                                'en' => 'View project inquiries.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'update',
                            'name' => [
                                'ko' => '프로젝트 문의 상태 수정',
                                'en' => 'Update Inquiry Status',
                            ],
                            'description' => [
                                'ko' => '프로젝트 문의 상태를 수정합니다.',
                                'en' => 'Update project inquiry status.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin', 'manager'],
                        ],
                        [
                            'action' => 'delete',
                            'name' => [
                                'ko' => '프로젝트 문의 삭제',
                                'en' => 'Delete Inquiry',
                            ],
                            'description' => [
                                'ko' => '프로젝트 문의를 삭제합니다.',
                                'en' => 'Delete project inquiries.',
                            ],
                            'type' => 'admin',
                            'roles' => ['admin'],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * 모듈 설치 시 실행할 시더 목록 반환
     *
     * @return array<class-string<\Illuminate\Database\Seeder>>
     */
    public function getSeeders(): array
    {
        return [
            \Modules\Twentyft\Content\Database\Seeders\TwentyftContentSeeder::class,
        ];
    }

    /**
     * 훅 리스너 목록 반환
     *
     * @return array<class-string>
     */
    public function getHookListeners(): array
    {
        return [];
    }

    /**
     * 관리자 메뉴 정의
     *
     * 20ft 콘텐츠
     * ├ Portfolio
     * ├ SuperBify
     * └ 프로젝트 문의
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAdminMenus(): array
    {
        return [
            [
                'name' => [
                    'ko' => '20ft 콘텐츠',
                    'en' => '20ft Content',
                ],
                'slug' => '20ft-content',
                'url' => '/admin/20ft-content',
                'icon' => 'fas fa-layer-group',
                'order' => 60,
                'permission' => 'twentyft-content.portfolio.read',
                'children' => [
                    [
                        'name' => [
                            'ko' => 'Portfolio',
                            'en' => 'Portfolio',
                        ],
                        'slug' => '20ft-content-portfolio',
                        'url' => '/admin/20ft-content/portfolio',
                        'order' => 10,
                        'permission' => 'twentyft-content.portfolio.read',
                    ],
                    [
                        'name' => [
                            'ko' => 'SuperBify',
                            'en' => 'SuperBify',
                        ],
                        'slug' => '20ft-content-superbify',
                        'url' => '/admin/20ft-content/superbify',
                        'order' => 20,
                        'permission' => 'twentyft-content.superbify.read',
                    ],
                    [
                        'name' => [
                            'ko' => '프로젝트 문의',
                            'en' => 'Project Inquiry',
                        ],
                        'slug' => '20ft-content-inquiries',
                        'url' => '/admin/20ft-content/inquiries',
                        'order' => 30,
                        'permission' => 'twentyft-content.inquiries.read',
                    ],
                ],
            ],
        ];
    }
}
