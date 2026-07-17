<?php

namespace App\Http\Controllers\Api\Public;

use App\Contracts\Extension\CacheInterface;
use App\Http\Controllers\Controller;
use App\Seo\SeoCacheSettings;
use App\Seo\SitemapGenerator;
use Illuminate\Http\Response;

/**
 * Sitemap XML 컨트롤러
 *
 * sitemap.xml 요청을 처리하여 캐시된 또는 실시간 생성된
 * Sitemap XML을 반환합니다.
 */
class SitemapController extends Controller
{
    /**
     * sitemap.xml을 반환합니다.
     *
     * 캐시가 있으면 캐시된 XML, 없으면 실시간 생성 후 캐시 저장.
     *
     * @param  SitemapGenerator  $generator  Sitemap 생성기
     * @param  CacheInterface  $cache  코어 캐시 드라이버
     * @return Response Sitemap XML 응답
     */
    public function index(SitemapGenerator $generator, CacheInterface $cache): Response
    {
        $enabled = (bool) g7_core_settings('seo.sitemap_enabled', true);
        if (! $enabled) {
            abort(404);
        }

        $xml = $cache->get('seo.sitemap');

        if (! $xml) {
            $xml = $generator->generate();
            // 고급 탭(cache.seo_sitemap_ttl)이 메인, SEO 탭에 별도 지정이 있으면 그것이 우선 (D19)
            $cache->put('seo.sitemap', $xml, SeoCacheSettings::sitemapCacheTtl());
        }

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
