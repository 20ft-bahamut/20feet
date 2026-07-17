<?php

namespace Tests\Unit\Seo;

use App\Seo\SitemapXmlRenderer;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

/**
 * SitemapXmlRenderer 단위 테스트
 *
 * D14 로 추출된 XML 조각 렌더러이며 sitemap 이스케이프의 단일 출처다.
 * SitemapGenerator(수집측)와 SitemapWriter(기록측)가 이 클래스를 공유하므로,
 * 여기서 깨지면 양쪽이 함께 깨진다.
 *
 * S3 ⑮(hreflang N² 해소)의 실제 편집 대상이 이 클래스이므로, 그 작업의
 * 회귀 기준선으로서 현재 동작을 고정한다.
 *
 * 검증 목적:
 * - 이스케이프: loc/lastmod/changefreq/hreflang/sitemapindex 전 경로
 * - 단일 언어 vs 다국어 분기 (헤더 xmlns / urlBlockCount / <url> 블록 수)
 * - hreflang alternate 구조 (현재: 로케일 수 × (로케일 수 + x-default))
 * - 로케일 URL 규칙 (기본 로케일은 원본, 그 외 ?locale=)
 * - sitemapindex 구조
 */
class SitemapXmlRendererTest extends TestCase
{
    /**
     * 단일 언어 렌더러를 만듭니다.
     *
     * @return SitemapXmlRenderer 렌더러
     */
    private function singleLocale(): SitemapXmlRenderer
    {
        return new SitemapXmlRenderer(['ko'], 'ko');
    }

    /**
     * 다국어 렌더러를 만듭니다.
     *
     * @param  array<int, string>  $locales  지원 로케일
     * @return SitemapXmlRenderer 렌더러
     */
    private function multiLocale(array $locales = ['ko', 'en', 'ja']): SitemapXmlRenderer
    {
        return new SitemapXmlRenderer($locales, 'ko');
    }

    /**
     * fromConfig: 앱 로케일 설정을 반영한다
     */
    public function test_from_config_reflects_app_locale_settings(): void
    {
        Config::set('app.locale', 'ko');
        Config::set('app.supported_locales', ['ko', 'en']);

        $renderer = SitemapXmlRenderer::fromConfig();

        $this->assertTrue($renderer->isMultilingual());
        $this->assertSame(2, $renderer->urlBlockCount());
    }

    /**
     * fromConfig: supported_locales 미설정 시 기본 로케일 단독으로 동작한다
     */
    public function test_from_config_falls_back_to_default_locale_only(): void
    {
        Config::set('app.locale', 'ko');
        Config::set('app.supported_locales', null);

        $renderer = SitemapXmlRenderer::fromConfig();

        $this->assertFalse($renderer->isMultilingual());
        $this->assertSame(1, $renderer->urlBlockCount());
    }

    /**
     * isMultilingual: 로케일이 1개면 단일 언어다
     */
    public function test_is_multilingual_is_false_for_single_locale(): void
    {
        $this->assertFalse($this->singleLocale()->isMultilingual());
        $this->assertTrue($this->multiLocale(['ko', 'en'])->isMultilingual());
    }

    /**
     * urlBlockCount: 다국어면 로케일 수, 단일 언어면 1
     *
     * 이 값이 틀리면 writer 의 파일당 URL 수 임계 계산이 어긋나 프로토콜을 위반한다.
     */
    public function test_url_block_count_matches_locale_count(): void
    {
        $this->assertSame(1, $this->singleLocale()->urlBlockCount());
        $this->assertSame(3, $this->multiLocale()->urlBlockCount());
    }

    /**
     * urlsetHeader: 단일 언어는 xhtml 네임스페이스를 선언하지 않는다
     */
    public function test_urlset_header_omits_xhtml_namespace_for_single_locale(): void
    {
        $header = $this->singleLocale()->urlsetHeader();

        $this->assertStringStartsWith('<?xml version="1.0" encoding="UTF-8"?>', $header);
        $this->assertStringContainsString('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"', $header);
        $this->assertStringNotContainsString('xmlns:xhtml', $header);
    }

    /**
     * urlsetHeader: 다국어는 xhtml 네임스페이스를 선언한다 (hreflang 사용)
     */
    public function test_urlset_header_declares_xhtml_namespace_for_multilingual(): void
    {
        $this->assertStringContainsString(
            'xmlns:xhtml="http://www.w3.org/1999/xhtml"',
            $this->multiLocale()->urlsetHeader()
        );
    }

    /**
     * urlsetFooter: urlset 을 닫는다
     */
    public function test_urlset_footer_closes_urlset(): void
    {
        $this->assertSame('</urlset>', $this->singleLocale()->urlsetFooter());
    }

    /**
     * urlBlock: loc 이 없으면 빈 문자열을 반환한다 (writer 가 이것으로 skip 판정)
     */
    public function test_url_block_returns_empty_string_without_loc(): void
    {
        $this->assertSame('', $this->singleLocale()->urlBlock([]));
        $this->assertSame('', $this->singleLocale()->urlBlock(['loc' => '']));
        $this->assertSame('', $this->singleLocale()->urlBlock(['changefreq' => 'daily']));
    }

    /**
     * urlBlock: 단일 언어는 <url> 블록 1개를 만들고 hreflang 을 붙이지 않는다
     */
    public function test_url_block_renders_single_url_without_hreflang(): void
    {
        $xml = $this->singleLocale()->urlBlock(['loc' => 'https://example.test/a']);

        $this->assertSame(1, substr_count($xml, '<url>'));
        $this->assertStringContainsString('<loc>https://example.test/a</loc>', $xml);
        $this->assertStringNotContainsString('xhtml:link', $xml);
    }

    /**
     * urlBlock: 메타 필드를 렌더링하며 priority 는 소수 1자리로 고정한다
     */
    public function test_url_block_renders_meta_fields(): void
    {
        $xml = $this->singleLocale()->urlBlock([
            'loc' => 'https://example.test/a',
            'lastmod' => '2026-07-17T00:00:00+09:00',
            'changefreq' => 'daily',
            'priority' => 0.8,
        ]);

        $this->assertStringContainsString('<lastmod>2026-07-17T00:00:00+09:00</lastmod>', $xml);
        $this->assertStringContainsString('<changefreq>daily</changefreq>', $xml);
        $this->assertStringContainsString('<priority>0.8</priority>', $xml);
    }

    /**
     * urlBlock: priority 는 정수로 줘도 소수 1자리로 정규화된다
     */
    public function test_url_block_normalizes_integer_priority(): void
    {
        $xml = $this->singleLocale()->urlBlock(['loc' => 'https://example.test/a', 'priority' => 1]);

        $this->assertStringContainsString('<priority>1.0</priority>', $xml);
    }

    /**
     * urlBlock: 메타 필드가 없으면 해당 태그를 생략한다
     */
    public function test_url_block_omits_absent_meta_fields(): void
    {
        $xml = $this->singleLocale()->urlBlock(['loc' => 'https://example.test/a']);

        $this->assertStringNotContainsString('<lastmod>', $xml);
        $this->assertStringNotContainsString('<changefreq>', $xml);
        $this->assertStringNotContainsString('<priority>', $xml);
    }

    /**
     * urlBlock: 다국어는 로케일 수만큼 <url> 블록을 만든다
     */
    public function test_url_block_renders_one_url_per_locale(): void
    {
        $xml = $this->multiLocale()->urlBlock(['loc' => 'https://example.test/a']);

        $this->assertSame(3, substr_count($xml, '<url>'));
    }

    /**
     * urlBlock: 기본 로케일은 원본 URL, 그 외는 ?locale= 를 붙인다
     */
    public function test_url_block_localizes_loc_per_locale(): void
    {
        $xml = $this->multiLocale()->urlBlock(['loc' => 'https://example.test/a']);

        // 기본 로케일(ko)은 쿼리 없이 원본
        $this->assertStringContainsString('<loc>https://example.test/a</loc>', $xml);
        $this->assertStringContainsString('<loc>https://example.test/a?locale=en</loc>', $xml);
        $this->assertStringContainsString('<loc>https://example.test/a?locale=ja</loc>', $xml);
    }

    /**
     * urlBlock: hreflang alternate 가 현재 N² 구조임을 고정한다 (S3 ⑮ 회귀 기준선)
     *
     * 현재 구현은 <url> 블록마다 모든 로케일의 alternate + x-default 를 넣는다.
     * 즉 로케일 L 개면 L × (L + 1) 개의 xhtml:link 가 생성된다 — 이것이 S3 ⑮ 가
     * 해소하려는 N² 팽창이다. S3 에서 이 수치가 바뀌면 의도된 변경이므로
     * 이 테스트를 함께 갱신할 것.
     */
    public function test_url_block_currently_emits_quadratic_hreflang_links(): void
    {
        $xml = $this->multiLocale(['ko', 'en', 'ja'])->urlBlock(['loc' => 'https://example.test/a']);

        // 3 로케일 → 3 블록 × (3 alternate + 1 x-default) = 12
        $this->assertSame(12, substr_count($xml, 'xhtml:link'));
        $this->assertSame(3, substr_count($xml, 'hreflang="x-default"'));
    }

    /**
     * urlBlock: x-default 는 항상 기본 로케일 URL 을 가리킨다
     */
    public function test_url_block_x_default_points_to_base_loc(): void
    {
        $xml = $this->multiLocale()->urlBlock(['loc' => 'https://example.test/a']);

        $this->assertStringContainsString(
            '<xhtml:link rel="alternate" hreflang="x-default" href="https://example.test/a"/>',
            $xml
        );
        $this->assertStringNotContainsString('hreflang="x-default" href="https://example.test/a?locale=', $xml);
    }

    /**
     * urlBlock: loc 의 XML 특수문자를 이스케이프한다 (단일 출처 방어)
     */
    public function test_url_block_escapes_special_characters_in_loc(): void
    {
        $xml = $this->singleLocale()->urlBlock(['loc' => 'https://example.test/a?x=1&y=2<z>']);

        $this->assertStringContainsString('<loc>https://example.test/a?x=1&amp;y=2&lt;z&gt;</loc>', $xml);
        $this->assertStringNotContainsString('&y=2', $xml);
    }

    /**
     * urlBlock: 메타 필드의 XML 특수문자도 이스케이프한다
     */
    public function test_url_block_escapes_special_characters_in_meta_fields(): void
    {
        $xml = $this->singleLocale()->urlBlock([
            'loc' => 'https://example.test/a',
            'lastmod' => '2026 & later',
            'changefreq' => 'da<ily',
        ]);

        $this->assertStringContainsString('<lastmod>2026 &amp; later</lastmod>', $xml);
        $this->assertStringContainsString('<changefreq>da&lt;ily</changefreq>', $xml);
    }

    /**
     * urlBlock: 다국어 alternate href 도 이스케이프한다
     */
    public function test_url_block_escapes_hreflang_alternate_href(): void
    {
        $xml = $this->multiLocale(['ko', 'en'])->urlBlock(['loc' => 'https://example.test/a?x=1&y=2']);

        $this->assertStringContainsString('href="https://example.test/a?x=1&amp;y=2"', $xml);
        // 이스케이프되지 않은 & 가 남으면 XML 파서가 깨진다
        $this->assertStringNotContainsString('&y=2"', $xml);
    }

    /**
     * urlBlock: 다국어 출력이 well-formed XML 이다 (이스케이프 종합 검증)
     */
    public function test_multilingual_url_block_is_well_formed_xml(): void
    {
        $renderer = $this->multiLocale();
        $xml = $renderer->urlsetHeader()
            .$renderer->urlBlock(['loc' => 'https://example.test/a?x=1&y=2', 'changefreq' => 'daily'])
            .$renderer->urlsetFooter();

        $this->assertNotFalse(simplexml_load_string($xml), 'urlset 이 파싱 가능한 XML 이어야 합니다.');
    }

    /**
     * sitemapIndex: 자식 목록을 sitemapindex 로 렌더링한다
     */
    public function test_sitemap_index_renders_children(): void
    {
        $xml = $this->singleLocale()->sitemapIndex([
            ['loc' => 'https://example.test/sitemap-1.xml', 'lastmod' => '2026-07-17T00:00:00+09:00'],
            ['loc' => 'https://example.test/sitemap-2.xml', 'lastmod' => null],
        ]);

        $this->assertStringStartsWith('<?xml version="1.0" encoding="UTF-8"?>', $xml);
        $this->assertStringContainsString('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', $xml);
        $this->assertSame(2, substr_count($xml, '<sitemap>'));
        $this->assertStringContainsString('<loc>https://example.test/sitemap-1.xml</loc>', $xml);
        // lastmod 가 null 인 자식은 태그를 생략한다
        $this->assertSame(1, substr_count($xml, '<lastmod>'));
        $this->assertStringEndsWith('</sitemapindex>', $xml);
    }

    /**
     * sitemapIndex: 자식이 없어도 well-formed 인 빈 인덱스를 만든다
     */
    public function test_sitemap_index_is_well_formed_when_empty(): void
    {
        $xml = $this->singleLocale()->sitemapIndex([]);

        $this->assertNotFalse(simplexml_load_string($xml));
        $this->assertStringNotContainsString('<sitemap>', $xml);
    }

    /**
     * sitemapIndex: 자식 loc/lastmod 의 특수문자를 이스케이프한다
     */
    public function test_sitemap_index_escapes_special_characters(): void
    {
        $xml = $this->singleLocale()->sitemapIndex([
            ['loc' => 'https://example.test/sitemap-1.xml?v=1&t=2', 'lastmod' => '2026 & later'],
        ]);

        $this->assertStringContainsString('<loc>https://example.test/sitemap-1.xml?v=1&amp;t=2</loc>', $xml);
        $this->assertStringContainsString('<lastmod>2026 &amp; later</lastmod>', $xml);
        $this->assertNotFalse(simplexml_load_string($xml));
    }
}
