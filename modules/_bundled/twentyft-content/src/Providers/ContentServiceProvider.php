<?php

namespace Modules\Twentyft\Content\Providers;

use App\Extension\BaseModuleServiceProvider;
use Modules\Twentyft\Content\Repositories\Contracts\PostMetaRepositoryInterface;
use Modules\Twentyft\Content\Repositories\PostMetaRepository;

/**
 * 20ft Content 모듈 서비스 프로바이더
 *
 * Portfolio / SuperBify / Project Inquiry 의 메타 데이터 접근과
 * G7 board_posts 간의 브릿지 역할을 담당합니다.
 */
class ContentServiceProvider extends BaseModuleServiceProvider
{
    /**
     * 모듈 식별자
     */
    protected string $moduleIdentifier = '20ft-content';

    /**
     * Repository 인터페이스와 구현체 매핑
     *
     * @var array<class-string, class-string>
     */
    protected array $repositories = [
        PostMetaRepositoryInterface::class => PostMetaRepository::class,
    ];
}
