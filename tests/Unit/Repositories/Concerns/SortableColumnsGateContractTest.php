<?php

namespace Tests\Unit\Repositories\Concerns;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * 정렬 허용 컬럼 ↔ 검증 게이트 정합 전수 검사
 *
 * 허용 값의 SSoT 는 요청을 실제로 거절하는 FormRequest 이고, Repository 의 정렬 상수는
 * 그 아래에 깔리는 안전망이다. 상수가 게이트의 **부분집합**이면 검증을 통과한 정렬이 조용히
 * 기본값으로 되돌아간다 — 422 도 로그도 남지 않아 "정렬 버튼이 안 먹는다" 로만 관측된다.
 *
 * 실제 사례: ScheduleHistoryRepository 가 게이트의 `ended_at`/`duration` 대신 존재하지 않는
 * 컬럼 `finished_at` 을 허용 목록에 담아, 종료시각·소요시간 정렬이 무음으로 죽어 있었다.
 *
 * 손으로 나열한 매핑은 새 호출처가 생기면 조용히 빠지므로, **매핑의 완전성 자체를 스캔으로
 * 검증**한다 (test_every_call_site_is_mapped). 새 resolveSortSpec 호출처를 추가하고 매핑을
 * 등록하지 않으면 이 테스트가 실패한다.
 *
 * @scenario case=sortable_columns_gate_contract
 *
 * @effects repo_whitelist_covers_gate, every_call_site_mapped
 */
class SortableColumnsGateContractTest extends TestCase
{
    /** 스캔 대상 루트 (저장소 상대) */
    private const SCAN_ROOTS = ['app/Repositories', 'modules/_bundled', 'plugins/_bundled'];

    /**
     * Repository 파일 → 대응 FormRequest 파일 매핑
     *
     * 값이 null 이면 "요청 경로가 없는 내부 전용 호출" 을 뜻하며 게이트 대조를 건너뛴다.
     *
     * @var array<string, string|null>
     */
    private const GATE_MAP = [
        'app/Repositories/ActivityLogRepository.php' => 'app/Http/Requests/ActivityLog/ActivityLogIndexRequest.php',
        'app/Repositories/IdentityMessageDefinitionRepository.php' => 'app/Http/Requests/Admin/Identity/AdminIdentityMessageDefinitionIndexRequest.php',
        'app/Repositories/MenuRepository.php' => 'app/Http/Requests/Menu/MenuListRequest.php',
        'app/Repositories/NotificationDefinitionRepository.php' => 'app/Http/Requests/NotificationDefinition/NotificationDefinitionIndexRequest.php',
        'app/Repositories/NotificationLogRepository.php' => 'app/Http/Requests/NotificationLog/NotificationLogIndexRequest.php',
        'app/Repositories/ScheduleHistoryRepository.php' => 'app/Http/Requests/Schedule/ScheduleHistoryListRequest.php',
        'app/Repositories/ScheduleRepository.php' => 'app/Http/Requests/Schedule/ScheduleListRequest.php',
        'app/Repositories/UserRepository.php' => 'app/Http/Requests/User/UserListRequest.php',
        'modules/_bundled/sirsoft-ecommerce/src/Repositories/CouponRepository.php' => 'modules/_bundled/sirsoft-ecommerce/src/Http/Requests/Admin/CouponListRequest.php',
        'modules/_bundled/sirsoft-ecommerce/src/Repositories/ExtraFeeTemplateRepository.php' => 'modules/_bundled/sirsoft-ecommerce/src/Http/Requests/Admin/ExtraFeeTemplateListRequest.php',
        'modules/_bundled/sirsoft-ecommerce/src/Repositories/OrderRepository.php' => 'modules/_bundled/sirsoft-ecommerce/src/Http/Requests/Admin/OrderListRequest.php',
        'modules/_bundled/sirsoft-ecommerce/src/Repositories/ProductRepository.php' => 'modules/_bundled/sirsoft-ecommerce/src/Http/Requests/Admin/ProductListRequest.php',
        'modules/_bundled/sirsoft-ecommerce/src/Repositories/ShippingPolicyRepository.php' => 'modules/_bundled/sirsoft-ecommerce/src/Http/Requests/Admin/ShippingPolicyListRequest.php',
        'modules/_bundled/sirsoft-page/src/Repositories/PageRepository.php' => 'modules/_bundled/sirsoft-page/src/Http/Requests/PageListRequest.php',
    ];

    /**
     * 저장소 루트 절대경로를 돌려줍니다.
     *
     * @return string 저장소 루트 경로
     */
    private static function repositoryRoot(): string
    {
        // tests/Unit/Repositories/Concerns → 저장소 루트
        return dirname(__DIR__, 4);
    }

    /**
     * resolveSortSpec 을 호출하는 파일 목록을 스캔합니다.
     *
     * @return array<int, string> 저장소 상대 경로 목록
     */
    private static function scanCallSites(): array
    {
        $root = self::repositoryRoot();
        $found = [];

        foreach (self::SCAN_ROOTS as $scanRoot) {
            $base = $root.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $scanRoot);

            if (! is_dir($base)) {
                continue;
            }

            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($base, \FilesystemIterator::SKIP_DOTS)
            );

            foreach ($iterator as $file) {
                if (! $file->isFile() || $file->getExtension() !== 'php') {
                    continue;
                }

                $path = str_replace('\\', '/', $file->getPathname());
                $relative = ltrim(str_replace(str_replace('\\', '/', $root), '', $path), '/');

                // 트레이트 본체와 테스트 코드는 호출처가 아니다
                if (str_contains($relative, '/tests/') || str_contains($relative, 'Concerns/ResolvesSortSpec.php')) {
                    continue;
                }

                if (str_contains((string) file_get_contents($path), '$this->resolveSortSpec(')) {
                    $found[] = $relative;
                }
            }
        }

        sort($found);

        return $found;
    }

    /**
     * 게이트 대조 대상 케이스를 제공합니다.
     *
     * @return array<string, array{0: string, 1: string}> [저장소 파일, 요청 파일]
     */
    public static function gatePairProvider(): array
    {
        $cases = [];

        foreach (self::GATE_MAP as $repository => $request) {
            if ($request === null) {
                continue;
            }

            $cases[$repository] = [$repository, $request];
        }

        return $cases;
    }

    /**
     * 파일에서 정렬 허용 컬럼 집합을 추출합니다. (상수 참조 해석 포함)
     *
     * @param  string  $content  파일 내용
     * @return array<int, string> 허용 컬럼 목록
     */
    private function extractRepositoryColumns(string $content): array
    {
        $columns = [];

        // resolveSortSpec 의 두 번째 인자 — self::CONST 또는 인라인 배열
        preg_match_all('/resolveSortSpec\(\s*\$\w+\s*,\s*(self::(\w+)|\[[^\]]*\])/s', $content, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $literal = $match[1];

            if (str_starts_with($literal, 'self::')) {
                $constName = $match[2];

                if (! preg_match('/const\s+'.preg_quote($constName, '/').'\s*=\s*\[(.*?)\];/s', $content, $constMatch)) {
                    continue;
                }

                $literal = $constMatch[1];
            }

            preg_match_all("/'([a-zA-Z0-9_]+)'/", $literal, $columnMatches);
            $columns = array_merge($columns, $columnMatches[1]);
        }

        return array_values(array_unique($columns));
    }

    /**
     * FormRequest 에서 sort_by 허용 값을 추출합니다.
     *
     * @param  string  $content  파일 내용
     * @return array<int, string> 허용 값 목록
     */
    private function extractGateColumns(string $content): array
    {
        // 'sort_by' => ... 한 줄(또는 Rule::in 블록) 안의 in: / Rule::in([...]) 를 읽는다
        if (! preg_match("/'sort_by'\s*=>\s*(.*?)(?:\],|\],\s*$|\n\s*'[a-z_]+'\s*=>)/s", $content, $match)) {
            return [];
        }

        $rule = $match[1];
        $columns = [];

        if (preg_match('/Rule::in\(\[(.*?)\]\)/s', $rule, $ruleInMatch)) {
            preg_match_all("/'([a-zA-Z0-9_]+)'/", $ruleInMatch[1], $columnMatches);
            $columns = $columnMatches[1];
        } elseif (preg_match('/in:([a-zA-Z0-9_,]+)/', $rule, $inMatch)) {
            $columns = explode(',', $inMatch[1]);
        }

        return array_values(array_filter(array_unique($columns)));
    }

    /**
     * 모든 resolveSortSpec 호출처가 매핑에 등록되어 있는지 검사합니다.
     */
    public function test_every_call_site_is_mapped(): void
    {
        $callSites = self::scanCallSites();

        $this->assertNotEmpty($callSites, 'resolveSortSpec 호출처를 하나도 찾지 못했습니다 — 스캔 경로를 확인하세요.');

        $unmapped = array_diff($callSites, array_keys(self::GATE_MAP));

        $this->assertSame(
            [],
            array_values($unmapped),
            "GATE_MAP 에 등록되지 않은 resolveSortSpec 호출처가 있습니다:\n  ".implode("\n  ", $unmapped)
                ."\n대응 FormRequest 를 매핑에 추가하세요 (요청 경로가 없으면 null)."
        );

        $stale = array_diff(array_keys(self::GATE_MAP), $callSites);

        $this->assertSame(
            [],
            array_values($stale),
            "GATE_MAP 에 남아 있으나 더 이상 resolveSortSpec 을 호출하지 않는 항목:\n  ".implode("\n  ", $stale)
        );
    }

    /**
     * Repository 정렬 허용 목록이 FormRequest 게이트를 모두 덮는지 검사합니다.
     *
     * @param  string  $repositoryPath  저장소 상대 경로 (Repository)
     * @param  string  $requestPath  저장소 상대 경로 (FormRequest)
     */
    #[DataProvider('gatePairProvider')]
    public function test_repository_whitelist_covers_gate(string $repositoryPath, string $requestPath): void
    {
        $root = self::repositoryRoot();
        $repositoryFile = $root.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $repositoryPath);
        $requestFile = $root.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $requestPath);

        $this->assertFileExists($repositoryFile, "매핑된 Repository 파일이 없습니다: {$repositoryPath}");
        $this->assertFileExists($requestFile, "매핑된 FormRequest 파일이 없습니다: {$requestPath}");

        $repositoryColumns = $this->extractRepositoryColumns((string) file_get_contents($repositoryFile));
        $gateColumns = $this->extractGateColumns((string) file_get_contents($requestFile));

        $this->assertNotEmpty($repositoryColumns, "정렬 허용 컬럼을 추출하지 못했습니다: {$repositoryPath}");
        $this->assertNotEmpty($gateColumns, "sort_by 허용 값을 추출하지 못했습니다: {$requestPath}");

        $missing = array_diff($gateColumns, $repositoryColumns);

        $this->assertSame(
            [],
            array_values($missing),
            "{$repositoryPath} 의 정렬 허용 목록이 게이트({$requestPath})보다 좁습니다. "
                ."검증을 통과한 정렬이 조용히 기본값으로 되돌아갑니다.\n  누락: ".implode(', ', $missing)
        );
    }
}
