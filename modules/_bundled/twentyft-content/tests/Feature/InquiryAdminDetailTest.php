<?php

namespace Modules\Twentyft\Content\Tests\Feature;

use Modules\Twentyft\Content\Enums\InquiryStatus;
use PHPUnit\Framework\TestCase;

/**
 * 프로젝트 문의 관리자 화면(목록·상세) 회귀 테스트.
 *
 * 레이아웃 JSON 은 앱을 띄우지 않고도 검증할 수 있는 결함이 대부분이다 —
 * 오타 난 컴포넌트 이름, 존재하지 않는 핸들러, 번역 키 누락, 라우트 미등록.
 * 이 넷은 화면을 열기 전까지 조용히 빈 영역으로 렌더되므로 파일 단위로 막는다.
 *
 * DB 가 필요한 API 동작은 여기서 다루지 않는다(브라우저 검증으로 확인).
 */
class InquiryAdminDetailTest extends TestCase
{
    private const COMPONENT_TYPES = ['basic', 'composite'];

    /** 관리자 화면이 실제로 쓰는 컴포넌트 목록을 담은 템플릿 매니페스트 */
    private const ADMIN_COMPONENTS_JSON = 'templates/_bundled/sirsoft-admin_basic/components.json';

    /** 액션 핸들러 이름의 단일 출처 */
    private const ACTION_DISPATCHER_TS = 'resources/js/core/template-engine/ActionDispatcher.ts';

    private static function moduleRoot(): string
    {
        return dirname(__DIR__, 2);
    }

    private static function repoRoot(): string
    {
        return dirname(self::moduleRoot(), 3);
    }

    /**
     * @return array<string, mixed>
     */
    private static function layout(string $name): array
    {
        $path = self::moduleRoot()."/resources/layouts/admin/{$name}.json";
        self::assertFileExists($path, "레이아웃 파일이 없습니다: {$name}");

        $decoded = json_decode((string) file_get_contents($path), true);
        self::assertIsArray($decoded, "레이아웃 JSON 파싱 실패: {$name}");

        return $decoded;
    }

    /**
     * 레이아웃 트리의 모든 배열 노드를 순회한다.
     *
     * 액션 정의(`handler`)와 컴포넌트 노드(`name`+`type`)는 서로 다른 키를 쓰므로
     * 두 검사 모두 이 순회 위에서 판별한다. 컴포넌트만 골라 순회하면 액션 노드를
     * 통째로 건너뛰어 핸들러 검사가 항상 통과하는 헛검사가 된다.
     *
     * @param  array<string, mixed>  $node
     * @param  callable(array<string, mixed>): void  $callback
     */
    private static function walk(array $node, callable $callback): void
    {
        $callback($node);

        foreach ($node as $value) {
            if (is_array($value)) {
                self::walk($value, $callback);
            }
        }
    }

    /**
     * 관리자 템플릿에 등록된 컴포넌트 이름 집합
     *
     * components.json 의 `components` 는 basic/composite/layout 별로 나뉜 묶음이다.
     *
     * @return array<string, true>
     */
    private static function registeredComponents(): array
    {
        $path = self::repoRoot().'/'.self::ADMIN_COMPONENTS_JSON;
        self::assertFileExists($path, '관리자 템플릿 components.json 을 찾지 못했습니다');

        $manifest = json_decode((string) file_get_contents($path), true);
        $names = [];
        foreach ($manifest['components'] as $group) {
            foreach ($group as $component) {
                if (isset($component['name'])) {
                    $names[$component['name']] = true;
                }
            }
        }

        return $names;
    }

    /**
     * ActionDispatcher 가 아는 핸들러 이름 집합
     *
     * @return array<string, true>
     */
    private static function knownHandlers(): array
    {
        $path = self::repoRoot().'/'.self::ACTION_DISPATCHER_TS;
        self::assertFileExists($path, 'ActionDispatcher.ts 를 찾지 못했습니다');

        $source = (string) file_get_contents($path);
        $unionStart = strpos($source, 'export type ActionType =');
        self::assertNotFalse($unionStart, 'ActionType 유니언을 찾지 못했습니다');

        $unionEnd = strpos($source, ';', $unionStart);
        $union = substr($source, $unionStart, $unionEnd - $unionStart);

        preg_match_all("/'([a-zA-Z]+)'/", $union, $matches);

        return array_fill_keys($matches[1], true);
    }

    /**
     * `$t:` 접두사를 가진 번역 키를 레이아웃 트리에서 모두 수집한다.
     *
     * @param  array<string, mixed>  $layout
     * @return array<int, string>
     */
    private static function translationKeys(array $layout): array
    {
        $keys = [];

        $collect = function (array $node) use (&$keys): void {
            foreach ($node as $value) {
                if (! is_string($value)) {
                    continue;
                }

                if (preg_match_all('/\$t:([A-Za-z0-9_.\-]+)/', $value, $matches)) {
                    foreach ($matches[1] as $key) {
                        $keys[] = $key;
                    }
                }
            }
        };

        self::walk($layout, $collect);
        // 최상위 meta 의 title/description 도 같은 규칙을 쓴다.
        $collect($layout['meta'] ?? []);
        $collect($layout['data_sources'] ?? []);

        return array_values(array_unique($keys));
    }

    /**
     * 번역 파일에서 점 표기 키를 조회한다.
     *
     * 레이아웃의 `$t:` 키는 모듈 네임스페이스(`twentyft-content.`)로 시작하지만
     * lang 파일 최상위는 `common`/`admin`/`editor` 부터 시작한다. 접두사를 벗겨야
     * 같은 키를 가리킨다.
     *
     * @param  array<string, mixed>  $lang
     */
    private static function langValue(array $lang, string $key): mixed
    {
        $segments = explode('.', $key);
        if (($segments[0] ?? null) === 'twentyft-content') {
            array_shift($segments);
        }

        $cursor = $lang;
        foreach ($segments as $segment) {
            if (! is_array($cursor) || ! array_key_exists($segment, $cursor)) {
                return null;
            }
            $cursor = $cursor[$segment];
        }

        return $cursor;
    }

    // ── 레이아웃 구조 ────────────────────────────────────────────────────────

    public function test_detail_layout_has_the_fields_the_engine_requires(): void
    {
        $layout = self::layout('admin_inquiry_detail');

        $this->assertSame('admin_inquiry_detail', $layout['layout_name']);
        $this->assertSame('1.0.0', $layout['version']);
        $this->assertSame('_admin_base', $layout['extends'], '관리자 공통 레이아웃을 상속해야 합니다');
        $this->assertSame(['twentyft-content.inquiries.read'], $layout['permissions']);
        $this->assertArrayHasKey('meta', $layout);
        $this->assertArrayHasKey('content', $layout['slots'], 'content 슬롯이 비어 있으면 화면이 빈 채로 뜹니다');
        $this->assertNotEmpty($layout['slots']['content']);
    }

    public function test_detail_layout_fetches_the_inquiry_by_route_param(): void
    {
        $layout = self::layout('admin_inquiry_detail');
        $sources = $layout['data_sources'];

        $this->assertCount(1, $sources);

        $source = $sources[0];
        $this->assertSame('inquiry', $source['id']);
        $this->assertSame('GET', $source['method']);
        $this->assertStringContainsString('/admin/inquiries/', $source['endpoint']);
        $this->assertStringContainsString('{{route.post_id}}', $source['endpoint'], '라우트 파라미터로 상세를 조회해야 합니다');
        $this->assertTrue($source['auth_required']);
        $this->assertSame('form', $source['initLocal'], '폼 상태로 주입되어야 Select 초기값이 잡힙니다');
        $this->assertSame('blocking', $source['loading_strategy']);
        $this->assertArrayHasKey('404', $source['errorHandling']);
        $this->assertArrayHasKey('403', $source['errorHandling']);
    }

    public function test_detail_layout_only_uses_components_the_admin_template_registers(): void
    {
        $registered = self::registeredComponents();
        $unknown = [];

        self::walk(self::layout('admin_inquiry_detail'), function (array $node) use ($registered, &$unknown): void {
            if (isset($node['handler']) || ! isset($node['name'], $node['type'])) {
                return;
            }
            if (! in_array($node['type'], self::COMPONENT_TYPES, true)) {
                return;
            }
            if (! isset($registered[$node['name']])) {
                $unknown[$node['name']] = true;
            }
        });

        $this->assertSame([], array_keys($unknown), '등록되지 않은 컴포넌트는 빈 영역으로 렌더됩니다');
    }

    public function test_detail_layout_only_uses_handlers_the_engine_dispatches(): void
    {
        $known = self::knownHandlers();
        $unknown = [];

        self::walk(self::layout('admin_inquiry_detail'), function (array $node) use ($known, &$unknown): void {
            if (isset($node['handler']) && ! isset($known[$node['handler']])) {
                $unknown[$node['handler']] = true;
            }
        });

        $this->assertSame([], array_keys($unknown), '알 수 없는 핸들러는 클릭 시 아무 일도 하지 않습니다');
    }

    public function test_detail_layout_changes_status_through_the_status_endpoint(): void
    {
        $layout = self::layout('admin_inquiry_detail');
        $patches = [];

        self::walk($layout, function (array $node) use (&$patches): void {
            if (($node['handler'] ?? null) === 'apiCall') {
                $patches[] = $node;
            }
        });

        $this->assertCount(1, $patches, '상태 변경 외의 쓰기 호출을 두지 않는다');
        $patch = $patches[0];

        $this->assertSame('PATCH', $patch['params']['method']);
        $this->assertStringEndsWith('/status', $patch['target']);
        $this->assertSame('{{_local.form.internalStatus}}', $patch['params']['body']['status']);
    }

    /**
     * 목록에서 상세로 가는 링크가 실제 라우트 경로와 같은 모양인지 확인한다.
     * 어긋나면 행을 눌러도 404 로 떨어진다.
     */
    public function test_index_rows_link_to_the_detail_route(): void
    {
        $index = json_encode(self::layout('admin_inquiry_index'), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $routes = json_decode(
            (string) file_get_contents(self::moduleRoot().'/resources/routes/admin.json'),
            true
        );

        $paths = array_column($routes['routes'], 'path');
        $this->assertContains('*/admin/20ft-content/inquiries/:post_id', $paths);

        $this->assertStringContainsString('/admin/20ft-content/inquiries/{{item.postId}}', $index);
        $this->assertStringNotContainsString(
            '/admin/board/project-inquiry/{{item.postId}}/edit',
            $index,
            '게시판 편집으로 보내면 메타를 볼 수 없다'
        );
    }

    public function test_detail_route_is_registered_with_the_read_permission(): void
    {
        $routes = json_decode(
            (string) file_get_contents(self::moduleRoot().'/resources/routes/admin.json'),
            true
        );

        $detail = null;
        foreach ($routes['routes'] as $route) {
            if (($route['path'] ?? null) === '*/admin/20ft-content/inquiries/:post_id') {
                $detail = $route;
            }
        }

        $this->assertNotNull($detail, '상세 라우트가 없습니다');
        $this->assertSame('admin_inquiry_detail', $detail['layout']);
        $this->assertTrue($detail['auth_required']);
        $this->assertSame('twentyft-content.inquiries.read', $detail['meta']['permission']);
    }

    /**
     * 값이 비어 있을 때 href="" 앵커가 생기면 클릭이 현재 페이지 재이동이 된다.
     * 링크 필드는 값이 있을 때만 앵커를 만들고, 없으면 텍스트로 '-' 를 둔다.
     */
    public function test_link_fields_never_render_an_anchor_without_a_value(): void
    {
        $layout = self::layout('admin_inquiry_detail');
        $anchors = [];

        self::walk($layout, function (array $node) use (&$anchors): void {
            if (($node['name'] ?? null) !== 'A' || ($node['type'] ?? null) !== 'basic') {
                return;
            }
            $href = $node['props']['href'] ?? null;
            if (is_string($href) && str_contains($href, '_local.form')) {
                $anchors[] = $node;
            }
        });

        $this->assertNotEmpty($anchors, '본문 값 앵커를 찾지 못했습니다 — 이 테스트가 헛돌고 있다');

        foreach ($anchors as $anchor) {
            $this->assertArrayHasKey(
                'if',
                $anchor,
                '값이 없을 때도 그려지는 앵커가 있다: '.($anchor['props']['href'] ?? '')
            );
        }
    }

    /**
     * 읽기 권한만 가진 운영자에게 상태 변경 컨트롤을 보여주면 눌러도 403 이다.
     * 카드에 update 권한을 선언해 서버가 노드를 제거하게 한다.
     */
    public function test_status_control_is_gated_by_the_update_permission(): void
    {
        $layout = self::layout('admin_inquiry_detail');
        $gated = [];

        self::walk($layout, function (array $node) use (&$gated): void {
            if (($node['handler'] ?? null) === 'apiCall') {
                $gated['status_card'] = $node;
            }
        });

        $this->assertArrayHasKey('status_card', $gated);

        $card = null;
        foreach ($layout['slots']['content'][0]['children'] as $child) {
            if (($child['id'] ?? null) === 'status_card') {
                $card = $child;
            }
        }

        $this->assertNotNull($card, 'status_card 를 찾지 못했습니다');
        $this->assertSame(
            ['twentyft-content.inquiries.update'],
            $card['permissions'] ?? null,
            '상태 변경 카드에 update 권한이 걸려 있지 않다'
        );
    }

    /**
     * 컨트롤러의 int 파라미터에 숫자가 아닌 값이 들어가면 TypeError 로 500 이 된다.
     * 라우트 제약이 그 경우를 404 로 돌린다.
     */
    public function test_inquiry_api_routes_constrain_the_post_id_to_digits(): void
    {
        $api = (string) file_get_contents(self::moduleRoot().'/src/routes/api.php');

        $this->assertMatchesRegularExpression(
            "/get\('\/\{post_id\}'.*?->where\('post_id', '\[0-9\]\+'\)/s",
            $api,
            '상세 라우트에 숫자 제약이 없다'
        );
        $this->assertMatchesRegularExpression(
            "/patch\('\/\{post_id\}\/status'.*?->where\('post_id', '\[0-9\]\+'\)/s",
            $api,
            '상태 변경 라우트에 숫자 제약이 없다'
        );
    }

    // ── 번역 키 ─────────────────────────────────────────────────────────────

    public function test_every_translation_key_used_by_inquiry_layouts_exists_in_both_languages(): void
    {
        $langs = [];
        foreach (['ko', 'en'] as $locale) {
            $langs[$locale] = json_decode(
                (string) file_get_contents(self::moduleRoot()."/resources/lang/{$locale}.json"),
                true
            );
        }

        foreach (['admin_inquiry_index', 'admin_inquiry_detail'] as $name) {
            foreach (self::translationKeys(self::layout($name)) as $key) {
                foreach ($langs as $locale => $lang) {
                    $this->assertIsString(
                        self::langValue($lang, $key),
                        "{$name}: {$locale} 번역 누락 — {$key}"
                    );
                }
            }
        }
    }

    public function test_lang_files_define_the_same_key_set(): void
    {
        $flatten = function (array $node, string $prefix = '') use (&$flatten): array {
            $keys = [];
            foreach ($node as $key => $value) {
                $path = $prefix === '' ? (string) $key : "{$prefix}.{$key}";
                if (is_array($value)) {
                    $keys = array_merge($keys, $flatten($value, $path));
                    continue;
                }
                $keys[] = $path;
            }

            return $keys;
        };

        $ko = $flatten(json_decode((string) file_get_contents(self::moduleRoot().'/resources/lang/ko.json'), true));
        $en = $flatten(json_decode((string) file_get_contents(self::moduleRoot().'/resources/lang/en.json'), true));

        sort($ko);
        sort($en);

        $this->assertSame($ko, $en, 'ko/en 키 집합이 어긋났습니다');
    }

    // ── enum 라벨 ───────────────────────────────────────────────────────────

    public function test_every_inquiry_status_has_a_translated_label(): void
    {
        $langs = [];
        foreach (['ko', 'en'] as $locale) {
            $path = self::moduleRoot()."/src/lang/{$locale}/enums.php";
            $this->assertFileExists($path, "enum 번역 파일이 없습니다: {$locale}");
            $langs[$locale] = require $path;
        }

        foreach (InquiryStatus::cases() as $status) {
            $key = $status->labelKey();
            $this->assertStringStartsWith(
                'twentyft-content::enums.inquiry_status.',
                $key,
                '라벨은 모듈 번역 키를 가리켜야 한다'
            );

            $shortKey = substr($key, strrpos($key, '.') + 1);
            $this->assertSame($status->value, $shortKey);

            foreach ($langs as $locale => $lang) {
                $label = $lang['inquiry_status'][$shortKey] ?? null;
                $this->assertIsString($label, "{$locale}: {$status->value} 라벨 누락");
                $this->assertNotSame('', trim($label));
            }

            $this->assertMatchesRegularExpression(
                '/[가-힣]/u',
                $langs['ko']['inquiry_status'][$shortKey],
                "{$status->value}: 한국어 라벨이 비어 있다"
            );
            $this->assertNotSame(
                $langs['ko']['inquiry_status'][$shortKey],
                $langs['en']['inquiry_status'][$shortKey],
                "{$status->value}: en 번역이 ko 와 같다 — 번역되지 않았다"
            );
        }
    }

    /**
     * 화면에 쓰이는 유형·예산 라벨도 로케일을 타는지 확인한다.
     * 게시글 제목에 박히는 `InquiryProjectType::label()` 과 달리, 표시용 라벨은 번역 키를 쓴다.
     */
    public function test_display_labels_for_project_type_and_budget_are_translated(): void
    {
        foreach (['inquiry_project_type', 'inquiry_budget_range'] as $group) {
            $ko = require self::moduleRoot().'/src/lang/ko/enums.php';
            $en = require self::moduleRoot().'/src/lang/en/enums.php';

            $this->assertNotEmpty($ko[$group] ?? [], "ko: {$group} 누락");
            $this->assertSame(
                array_keys($ko[$group]),
                array_keys($en[$group]),
                "{$group}: ko/en 키 집합이 어긋났다"
            );
        }
    }
}
