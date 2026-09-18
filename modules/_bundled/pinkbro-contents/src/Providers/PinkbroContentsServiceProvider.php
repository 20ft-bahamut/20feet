<?php

namespace Modules\Pinkbro\Contents\Providers;

use App\Extension\BaseModuleServiceProvider;

/**
 * PinkBro Contents 모듈 서비스 프로바이더
 *
 * 콘텐츠 메타·미디어 슬롯·문의 데이터 접근과
 * G7 board_posts 간의 브릿지 역할을 담당합니다.
 */
class PinkbroContentsServiceProvider extends BaseModuleServiceProvider
{
    /**
     * 모듈 식별자
     */
    protected string $moduleIdentifier = 'pinkbro-contents';

    /**
     * Repository 인터페이스와 구현체 매핑
     *
     * @var array<class-string, class-string>
     */
    protected array $repositories = [];
}
