<?php

namespace App\Seo;

/**
 * Sitemap XML 조각 렌더러
 *
 * urlset 헤더/푸터, URL 단위 <url> 블록, sitemapindex 를 생성합니다.
 * Sitemap XML 의 이스케이프 로직을 이 클래스 한 곳에서만 수행하며(단일 출처),
 * SitemapGenerator(수집측)와 SitemapWriter(기록측)가 이 렌더러를 공유합니다.
 *
 * 다국어(supported_locales 2개 이상)면 URL 하나당 로케일별 <url> 블록을 생성하고
 * 각 블록에 xhtml:link hreflang alternate 를 포함합니다.
 */
final class SitemapXmlRenderer
{
    /**
     * 다국어 여부 (지원 로케일 2개 이상)
     */
    private readonly bool $multilingual;

    /**
     * SitemapXmlRenderer 생성자
     *
     * @param  array<int, string>  $supportedLocales  지원 로케일 목록
     * @param  string  $defaultLocale  기본 로케일
     */
    public function __construct(
        private readonly array $supportedLocales,
        private readonly string $defaultLocale,
    ) {
        $this->multilingual = count($this->supportedLocales) > 1;
    }

    /**
     * 애플리케이션 로케일 설정으로 렌더러를 생성합니다.
     *
     * @return self 설정 기반 렌더러 인스턴스
     */
    public static function fromConfig(): self
    {
        $defaultLocale = (string) config('app.locale');

        return new self(
            (array) config('app.supported_locales', [$defaultLocale]),
            $defaultLocale,
        );
    }

    /**
     * 다국어 모드 여부를 반환합니다.
     *
     * @return bool 지원 로케일이 2개 이상이면 true
     */
    public function isMultilingual(): bool
    {
        return $this->multilingual;
    }

    /**
     * URL 항목 하나가 생성하는 <url> 블록 개수를 반환합니다.
     *
     * 분할 임계(파일당 URL 수) 계산에 사용됩니다.
     *
     * @return int 다국어면 로케일 수, 단일 언어면 1
     */
    public function urlBlockCount(): int
    {
        return $this->multilingual ? count($this->supportedLocales) : 1;
    }

    /**
     * urlset 여는 태그(XML 선언 포함)를 반환합니다.
     *
     * @return string urlset 헤더 문자열
     */
    public function urlsetHeader(): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";

        if ($this->multilingual) {
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'."\n";
            $xml .= '        xmlns:xhtml="http://www.w3.org/1999/xhtml">'."\n";
        } else {
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        }

        return $xml;
    }

    /**
     * urlset 닫는 태그를 반환합니다.
     *
     * @return string urlset 푸터 문자열
     */
    public function urlsetFooter(): string
    {
        return '</urlset>';
    }

    /**
     * URL 항목 하나를 <url> 블록으로 렌더링합니다.
     *
     * 다국어면 로케일 수만큼의 <url> 블록을 이어붙여 반환합니다.
     *
     * @param  array{loc?: string, lastmod?: string, changefreq?: string, priority?: float}  $entry  URL 항목 (loc 은 절대 URL)
     * @return string <url> 블록 문자열 (loc 이 없으면 빈 문자열)
     */
    public function urlBlock(array $entry): string
    {
        $baseLoc = $entry['loc'] ?? '';
        if ($baseLoc === '') {
            return '';
        }

        if (! $this->multilingual) {
            return $this->renderSingleUrl($baseLoc, $entry);
        }

        $xml = '';
        foreach ($this->supportedLocales as $locale) {
            $xml .= $this->renderLocalizedUrl($baseLoc, $entry, (string) $locale);
        }

        return $xml;
    }

    /**
     * 자식 sitemap 목록을 sitemapindex XML 로 렌더링합니다.
     *
     * @param  array<int, array{loc: string, lastmod?: ?string}>  $children  자식 sitemap 목록
     * @return string sitemapindex XML 문자열
     */
    public function sitemapIndex(array $children): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        foreach ($children as $child) {
            $xml .= '  <sitemap>'."\n";
            $xml .= '    <loc>'.$this->escape($child['loc']).'</loc>'."\n";

            if (! empty($child['lastmod'])) {
                $xml .= '    <lastmod>'.$this->escape($child['lastmod']).'</lastmod>'."\n";
            }

            $xml .= '  </sitemap>'."\n";
        }

        $xml .= '</sitemapindex>';

        return $xml;
    }

    /**
     * 단일 언어 <url> 블록을 렌더링합니다.
     *
     * @param  string  $loc  절대 URL
     * @param  array  $entry  URL 항목
     * @return string <url> 블록 문자열
     */
    private function renderSingleUrl(string $loc, array $entry): string
    {
        $xml = '  <url>'."\n";
        $xml .= '    <loc>'.$this->escape($loc).'</loc>'."\n";
        $xml .= $this->renderMetaFields($entry);
        $xml .= '  </url>'."\n";

        return $xml;
    }

    /**
     * 특정 로케일의 <url> 블록(hreflang alternate 포함)을 렌더링합니다.
     *
     * @param  string  $baseLoc  기본 로케일 절대 URL
     * @param  array  $entry  URL 항목
     * @param  string  $locale  대상 로케일
     * @return string <url> 블록 문자열
     */
    private function renderLocalizedUrl(string $baseLoc, array $entry, string $locale): string
    {
        $xml = '  <url>'."\n";
        $xml .= '    <loc>'.$this->escape($this->localizedLoc($baseLoc, $locale)).'</loc>'."\n";
        $xml .= $this->renderMetaFields($entry);

        // 모든 로케일의 hreflang alternate 링크
        foreach ($this->supportedLocales as $altLocale) {
            $altHref = $this->localizedLoc($baseLoc, (string) $altLocale);
            $xml .= '    <xhtml:link rel="alternate" hreflang="'.$this->escape((string) $altLocale).'" href="'.$this->escape($altHref).'"/>'."\n";
        }

        // x-default = 기본 로케일 URL
        $xml .= '    <xhtml:link rel="alternate" hreflang="x-default" href="'.$this->escape($baseLoc).'"/>'."\n";

        $xml .= '  </url>'."\n";

        return $xml;
    }

    /**
     * lastmod / changefreq / priority 필드를 렌더링합니다.
     *
     * @param  array  $entry  URL 항목
     * @return string 메타 필드 문자열
     */
    private function renderMetaFields(array $entry): string
    {
        $xml = '';

        if (! empty($entry['lastmod'])) {
            $xml .= '    <lastmod>'.$this->escape((string) $entry['lastmod']).'</lastmod>'."\n";
        }

        if (! empty($entry['changefreq'])) {
            $xml .= '    <changefreq>'.$this->escape((string) $entry['changefreq']).'</changefreq>'."\n";
        }

        if (isset($entry['priority'])) {
            $xml .= '    <priority>'.number_format((float) $entry['priority'], 1).'</priority>'."\n";
        }

        return $xml;
    }

    /**
     * 로케일별 URL 을 생성합니다.
     *
     * @param  string  $baseLoc  기본 로케일 절대 URL
     * @param  string  $locale  대상 로케일
     * @return string 로케일 URL (기본 로케일이면 원본 그대로)
     */
    private function localizedLoc(string $baseLoc, string $locale): string
    {
        return $locale === $this->defaultLocale
            ? $baseLoc
            : $baseLoc.'?locale='.$locale;
    }

    /**
     * XML 특수문자를 이스케이프합니다.
     *
     * @param  string  $value  원본 문자열
     * @return string 이스케이프된 문자열
     */
    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1, 'UTF-8');
    }
}
