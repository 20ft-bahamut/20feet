<?php

namespace Modules\Sirsoft\Page\Seo;

use App\Seo\Contracts\SitemapContributorInterface;
use Illuminate\Support\Facades\Log;
use Modules\Sirsoft\Page\Repositories\Contracts\PageRepositoryInterface;

/**
 * Page 모듈 Sitemap 기여자
 *
 * 발행된 페이지 URL을 sitemap에 제공합니다.
 * 데이터 접근은 Repository 인터페이스에 위임합니다.
 */
class PageSitemapContributor implements SitemapContributorInterface
{
    /**
     * PageSitemapContributor 생성자
     *
     * @param  PageRepositoryInterface  $pageRepository  페이지 Repository
     */
    public function __construct(
        private readonly PageRepositoryInterface $pageRepository,
    ) {}

    /**
     * 확장 식별자를 반환합니다.
     *
     * @return string 확장 식별자
     */
    public function getIdentifier(): string
    {
        return 'sirsoft-page';
    }

    /**
     * Sitemap URL 항목 배열을 반환합니다.
     *
     * 발행된 페이지의 URL을 생성합니다.
     *
     * @return array<int, array{url: string, lastmod?: string, changefreq?: string, priority?: float}>
     */
    public function getUrls(): array
    {
        $urls = [];

        // 기여자당 URL 안전 상한 (0 = 무제한). 상한은 이 기여자가 내보내는 모든 URL 유형에 적용된다.
        $maxUrls = (int) g7_core_settings('seo.sitemap_max_urls_per_contributor', 0);
        $truncated = false;

        foreach ($this->pageRepository->streamPublishedForSitemap() as $page) {
            if (! $this->appendUrl($urls, [
                'url' => "/page/{$page->slug}",
                'lastmod' => $page->updated_at?->toW3cString(),
                'changefreq' => 'monthly',
                'priority' => 0.5,
            ], $maxUrls)) {
                $truncated = true;
                break;
            }
        }

        if ($truncated) {
            Log::warning('[SEO] Sitemap 기여자 URL 상한 초과로 잘렸습니다.', [
                'contributor' => $this->getIdentifier(),
                'max_urls' => $maxUrls,
            ]);
        }

        return $urls;
    }

    /**
     * 안전 상한을 지키며 URL 항목을 추가합니다.
     *
     * @param  array<int, array<string, mixed>>  $urls  누적 URL 배열 (참조)
     * @param  array<string, mixed>  $entry  추가할 URL 항목
     * @param  int  $maxUrls  기여자당 URL 상한 (0 = 무제한)
     * @return bool 추가되면 true, 상한 도달로 추가하지 못하면 false
     */
    private function appendUrl(array &$urls, array $entry, int $maxUrls): bool
    {
        if ($maxUrls > 0 && count($urls) >= $maxUrls) {
            return false;
        }

        $urls[] = $entry;

        return true;
    }
}
