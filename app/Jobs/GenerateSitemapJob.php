<?php

namespace App\Jobs;

use App\Seo\SitemapManager;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Sitemap XML 생성 큐 잡
 *
 * 스케줄러, Artisan 커맨드, 관리자 수동 재생성, 봇 요청 캐시 미스에서 디스패치되며,
 * 실제 생성 로직은 SitemapManager 서비스에 위임합니다.
 *
 * 대용량(수백만 URL) 생성은 수 분~수십 분이 걸리므로 동시 실행을 막고(ShouldBeUnique)
 * 타임아웃/재시도 한계를 넉넉히 잡되, 재시도가 무한히 누적되지 않도록 retryUntil 로 제한합니다.
 */
class GenerateSitemapJob implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @var int 최대 재시도 횟수
     */
    public int $tries = 3;

    /**
     * @var int 타임아웃 (초) — 대용량 스트리밍 생성 대응
     */
    public int $timeout = 1800;

    /**
     * @var int 재시도 대기 시간 (초)
     */
    public int $backoff = 120;

    /**
     * @var int 유니크 락 유지 시간 (초) — 잡이 비정상 종료해도 이 시간 후 자동 해제
     */
    public int $uniqueFor = 900;

    /**
     * 유니크 락 식별자를 반환합니다.
     *
     * 봇 요청 캐시 미스마다 디스패치되어도 큐에는 한 건만 남도록 고정 키를 사용합니다.
     *
     * @return string 유니크 락 키
     */
    public function uniqueId(): string
    {
        return 'seo-sitemap';
    }

    /**
     * 재시도 마감 시각을 반환합니다.
     *
     * timeout(1800초) × tries(3) 만큼 재시도가 누적되는 것을 막습니다.
     *
     * @return \DateTime 재시도 마감 시각
     */
    public function retryUntil(): \DateTime
    {
        return now()->addMinutes(30)->toDateTime();
    }

    /**
     * Sitemap 을 생성하고 캐시에 저장합니다.
     *
     * @param  SitemapManager  $manager  Sitemap 매니저 서비스
     */
    public function handle(SitemapManager $manager): void
    {
        $result = $manager->regenerate();

        if (($result['status'] ?? null) === 'disabled') {
            Log::info('[SEO] Sitemap generation skipped (disabled)');

            return;
        }

        if (! ($result['success'] ?? false)) {
            throw new \RuntimeException($result['message'] ?? 'Sitemap regeneration failed');
        }

        Log::info('[SEO] Sitemap generated and cached', [
            'size' => $result['data']['size_bytes'] ?? null,
            'ttl' => $result['data']['ttl'] ?? null,
        ]);
    }

    /**
     * 잡 실패 시 로그를 기록합니다.
     *
     * @param  \Throwable  $exception  발생한 예외
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('[SEO] Sitemap generation failed', [
            'error' => $exception->getMessage(),
        ]);
    }
}
