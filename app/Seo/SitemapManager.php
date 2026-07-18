<?php

namespace App\Seo;

use App\Contracts\Extension\CacheInterface;
use App\Contracts\Extension\StorageInterface;
use App\Contracts\Repositories\ConfigRepositoryInterface;
use App\Extension\HookManager;
use Illuminate\Support\Facades\Log;

/**
 * Sitemap 재생성 / 상태 조회 서비스.
 *
 * 큐 잡(GenerateSitemapJob)과 관리자 수동 트리거(SeoCacheController)에서 공통으로 사용합니다.
 * Sitemap 을 SitemapWriter 로 스트리밍 생성하여 비공개 디스크에 분할 파일로 커밋하고,
 * 마지막 업데이트 시각을 settings 의 seo 카테고리(sitemap_last_updated_at)에 기록합니다.
 * 캐시에는 XML 본문이 아니라 메타데이터만 저장합니다.
 */
class SitemapManager
{
    /**
     * Sitemap 메타데이터 캐시 키
     */
    public const META_CACHE_KEY = 'seo.sitemap.meta';

    /**
     * 구 버전 Sitemap XML 본문 캐시 키 (디스크 서빙 전환으로 폐기 — 잔여분 정리용)
     */
    private const LEGACY_XML_CACHE_KEY = 'seo.sitemap';

    public function __construct(
        private SitemapGenerator $generator,
        private CacheInterface $cache,
        private ConfigRepositoryInterface $configRepository,
        private StorageInterface $storage,
    ) {}

    /**
     * Sitemap 을 즉시 생성하여 디스크에 커밋하고 last_updated_at 을 기록합니다.
     *
     * @return array{success: bool, status: string, message?: string, data?: array<string, mixed>}
     *                                                                                             status: 'updated' | 'disabled' | 'failed'
     */
    public function regenerate(): array
    {
        $enabled = (bool) g7_core_settings('seo.sitemap_enabled', true);
        if (! $enabled) {
            return [
                'success' => false,
                'status' => 'disabled',
                'message' => __('seo.sitemap_disabled'),
            ];
        }

        HookManager::doAction('core.seo.sitemap.before_regenerate');

        try {
            $meta = $this->generator->generateToWriter($this->makeWriter());

            // 고급 탭(cache.seo_sitemap_ttl)이 메인, SEO 탭에 별도 지정이 있으면 그것이 우선 (D19)
            $ttl = SeoCacheSettings::sitemapCacheTtl();

            // 디스크 서빙 전환 — 캐시에는 메타만 저장하고 구 XML 본문 캐시는 정리합니다.
            $this->cache->forget(self::LEGACY_XML_CACHE_KEY);
            $this->cache->put(self::META_CACHE_KEY, $meta, $ttl);

            $lastUpdatedAt = $meta['generated_at'];
            $this->updateLastUpdatedAt($lastUpdatedAt);

            $result = [
                'success' => true,
                'status' => 'updated',
                'message' => __('seo.sitemap_regenerated'),
                'data' => [
                    'last_updated_at' => $lastUpdatedAt,
                    'size_bytes' => $meta['size_bytes'],
                    'url_count' => $meta['url_count'],
                    'child_count' => $meta['child_count'],
                    'ttl' => $ttl,
                ],
            ];

            HookManager::doAction('core.seo.sitemap.after_regenerate', $result);

            return $result;
        } catch (\Throwable $e) {
            Log::error('[SEO] Sitemap regeneration failed', [
                'error' => $e->getMessage(),
            ]);

            $result = [
                'success' => false,
                'status' => 'failed',
                'message' => __('seo.sitemap_generate_failed', ['error' => $e->getMessage()]),
            ];

            HookManager::doAction('core.seo.sitemap.after_regenerate_failed', $result);

            return $result;
        }
    }

    /**
     * 현재 sitemap 의 메타데이터를 반환합니다.
     *
     * @return array{last_updated_at: ?string}
     */
    public function getStatus(): array
    {
        $lastUpdatedAt = (string) g7_core_settings('seo.sitemap_last_updated_at', '');

        return [
            'last_updated_at' => $lastUpdatedAt !== '' ? $lastUpdatedAt : null,
        ];
    }

    /**
     * 설정값을 반영한 SitemapWriter 를 생성합니다.
     *
     * @return SitemapWriter 분할 기록기
     */
    private function makeWriter(): SitemapWriter
    {
        return new SitemapWriter(
            $this->storage,
            SitemapXmlRenderer::fromConfig(),
            (int) g7_core_settings('seo.sitemap_urls_per_file', SitemapWriter::HARD_URL_CAP),
            (bool) g7_core_settings('seo.sitemap_gzip', false),
        );
    }

    /**
     * settings 의 seo 카테고리에 sitemap_last_updated_at 을 기록합니다.
     *
     * @param  string  $iso8601  ISO8601 형식 타임스탬프
     */
    private function updateLastUpdatedAt(string $iso8601): void
    {
        try {
            $current = $this->configRepository->getCategory('seo');
            $current['sitemap_last_updated_at'] = $iso8601;
            $this->configRepository->saveCategory('seo', $current);
        } catch (\Throwable $e) {
            Log::warning('Sitemap last_updated_at 갱신 실패', ['error' => $e->getMessage()]);
        }
    }
}
