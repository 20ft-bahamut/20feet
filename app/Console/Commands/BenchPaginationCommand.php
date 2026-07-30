<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * 깊은 OFFSET 페이지네이션 비용 계측 커맨드
 *
 * 목록 조회는 OFFSET 이 커질수록 느려지는데, 그 원인이 "건너뛸 행의 넓은 컬럼까지 읽기"인지
 * 확인하려면 같은 필터·정렬로 (1) 실제 목록 컬럼과 (2) 키 컬럼만 조회한 비용을 나란히 재야 한다.
 * 본 커맨드는 그 두 축을 같은 조건에서 측정해 표로 출력한다.
 *
 * tinker 스크립트 대신 커맨드로 만든 이유: tinker 는 REPL 이라 스크립트 실행 후에도 STDIN 을
 * 기다려 출력이 유실된다.
 */
class BenchPaginationCommand extends Command
{
    protected $signature = 'g7:bench:pagination
        {--table=board_posts : 계측 대상 프로파일 키}
        {--offsets=0,20000,50000,99980 : 측정할 OFFSET 목록 (쉼표 구분)}
        {--runs=3 : OFFSET 당 측정 횟수 (첫 회는 버림)}
        {--seed=0 : 계측 전 합성 행 시딩 건수 (0 = 시딩 안 함)}
        {--database= : 계측에 사용할 데이터베이스명 (미지정 시 기본 연결. 개발 DB 오염 방지용)}
        {--fresh : 시딩 전에 대상 테이블을 비움 (운영 환경에서는 거부)}
        {--explain : 각 OFFSET 의 실행 계획도 함께 수집}
        {--json : 기계 판독용 JSON 출력}
        {--list-profiles : 등록된 프로파일 목록 출력}';

    protected $description = '깊은 OFFSET 목록 조회 비용을 목록 컬럼 / 키 컬럼 두 축으로 계측합니다';

    /**
     * 계측 프로파일 정의
     *
     * columns 는 해당 목록이 실제로 select 하는 컬럼이다. 스키마에 없는 컬럼은 실행 시 걸러낸다
     * (확장 버전에 따라 컬럼 구성이 달라도 커맨드가 죽지 않도록).
     *
     * @return array<string, array{table: string, columns: array<int, string>, order: array<int, array{0: string, 1: string}>, soft_delete: bool}>
     */
    private function profiles(): array
    {
        return [
            'board_posts' => [
                'table' => 'board_posts',
                'columns' => ['id', 'board_id', 'title', 'author_name', 'view_count', 'is_notice', 'created_at'],
                'order' => [['created_at', 'desc'], ['id', 'desc']],
                'soft_delete' => true,
                // 실제 목록은 게시판 하나를 조회한다. 필터 없이 재면 인덱스 선택이 달라져
                // 화면에서 일어나는 일과 다른 것을 재게 된다.
                'filters' => ['board_id' => 1],
                'seed_overrides' => ['board_id' => 1, 'is_notice' => 0],
            ],
            'orders' => [
                'table' => 'ecommerce_orders',
                'columns' => ['id', 'user_id', 'order_number', 'order_status', 'order_device', 'is_first_order', 'currency', 'currency_snapshot', 'total_amount', 'total_shipping_amount', 'total_paid_amount', 'total_cancelled_amount', 'total_refunded_amount', 'total_points_used_amount', 'total_earned_points_amount', 'mc_total_amount', 'mc_total_shipping_amount', 'ordered_at', 'created_at', 'updated_at', 'deleted_at'],
                'order' => [['ordered_at', 'desc'], ['id', 'desc']],
                'soft_delete' => true,
            ],
            // 아래 두 목록은 응답 계약상 넓은 컬럼(changes/properties, body)을 그대로 노출하므로
            // 컬럼 프루닝이 불가하다. 지연 조인만 적용했고, 계측 축도 select * vs select id 다.
            'activity_logs' => [
                'table' => 'activity_logs',
                'columns' => ['*'],
                'order' => [['created_at', 'desc'], ['id', 'desc']],
                'soft_delete' => false,
            ],
            'notification_logs' => [
                'table' => 'notification_logs',
                'columns' => ['*'],
                'order' => [['created_at', 'desc'], ['id', 'desc']],
                'soft_delete' => false,
            ],
            'users' => [
                'table' => 'users',
                'columns' => ['*'],
                'order' => [['created_at', 'desc'], ['id', 'desc']],
                'soft_delete' => true,
            ],
            'reports' => [
                'table' => 'boards_reports',
                'columns' => ['*'],
                'order' => [['created_at', 'desc'], ['id', 'desc']],
                'soft_delete' => true,
            ],
            'coupon_issues' => [
                'table' => 'ecommerce_promotion_coupon_issues',
                'columns' => ['*'],
                'order' => [['issued_at', 'desc'], ['id', 'desc']],
                'soft_delete' => false,
            ],
            'products' => [
                'table' => 'ecommerce_products',
                'columns' => ['*'],
                'order' => [['created_at', 'desc'], ['id', 'desc']],
                'soft_delete' => true,
            ],
            'product_inquiries' => [
                'table' => 'ecommerce_product_inquiries',
                'columns' => ['*'],
                'order' => [['created_at', 'desc'], ['id', 'desc']],
                'soft_delete' => true,
            ],
            'product_reviews' => [
                'table' => 'ecommerce_product_reviews',
                'columns' => ['*'],
                'order' => [['created_at', 'desc'], ['id', 'desc']],
                'soft_delete' => true,
            ],
            'pages' => [
                'table' => 'pages',
                'columns' => ['*'],
                'order' => [['created_at', 'desc'], ['id', 'desc']],
                'soft_delete' => true,
            ],
            'extra_fee_templates' => [
                'table' => 'ecommerce_shipping_policy_extra_fee_templates',
                'columns' => ['*'],
                'order' => [['zipcode', 'asc'], ['id', 'asc']],
                'soft_delete' => false,
            ],
        ];
    }

    /**
     * 커맨드를 실행합니다.
     *
     * @return int 종료 코드
     */
    public function handle(): int
    {
        $profiles = $this->profiles();

        if ($this->option('list-profiles')) {
            foreach ($profiles as $key => $profile) {
                $this->line(sprintf('%-20s %s', $key, $profile['table']));
            }

            return self::SUCCESS;
        }

        $key = (string) $this->option('table');

        if (! isset($profiles[$key])) {
            $this->error("등록되지 않은 프로파일: {$key} (--list-profiles 로 목록 확인)");

            return self::FAILURE;
        }

        $profile = $profiles[$key];

        // 계측은 대량 시딩을 동반하므로 개발 DB 대신 폐기 가능한 DB 를 지정할 수 있어야 한다.
        // config 가 캐시된 환경에서는 .env / --env 로 연결을 바꿀 수 없어 런타임 치환이 유일한 수단이다.
        $database = (string) $this->option('database');

        if ($database !== '') {
            $connection = config('database.default');

            config([
                "database.connections.{$connection}.database" => $database,
                "database.connections.{$connection}.write.database" => $database,
                "database.connections.{$connection}.read.database" => $database,
            ]);

            DB::purge($connection);
        }

        if (! Schema::hasTable($profile['table'])) {
            $this->error("테이블이 없습니다: {$profile['table']} (해당 확장이 설치되어 있는지 확인)");

            return self::FAILURE;
        }

        // 계측 결과가 환경에 좌우되므로 실행 환경을 먼저 드러낸다
        $this->line(sprintf(
            '환경: APP_ENV=%s / DB=%s / config:cache=%s',
            config('app.env'),
            config('database.default'),
            app()->configurationIsCached() ? 'on' : 'off'
        ));

        if ($this->option('fresh')) {
            if (app()->environment('production')) {
                $this->error('운영 환경에서는 --fresh 를 사용할 수 없습니다.');

                return self::FAILURE;
            }

            // 다른 테이블이 FK 로 참조하면 TRUNCATE 가 거부되므로 제약을 잠시 내린다
            Schema::withoutForeignKeyConstraints(function () use ($profile) {
                DB::table($profile['table'])->truncate();
            });

            $this->warn("비움: {$profile['table']}");
        }

        $seed = (int) $this->option('seed');

        if ($seed > 0) {
            $this->seedRows($profile['table'], $seed, $profile['seed_overrides'] ?? []);
        }

        $columns = $this->existingColumns($profile['table'], $profile['columns']);
        $order = $this->existingOrder($profile['table'], $profile['order']);
        $offsets = $this->parseOffsets();
        $runs = max(1, (int) $this->option('runs'));

        $rows = [];

        foreach ($offsets as $offset) {
            // 세 축: 컬럼 인자를 생략했을 때(=select *) / 목록 컬럼만 / 키 컬럼만.
            // 첫 축이 프루닝 이전 상태, 셋째 축이 지연 조인의 inner 에 해당한다.
            $allMs = $this->measure($profile, ['*'], $order, $offset, $runs);
            $listMs = $this->measure($profile, $columns, $order, $offset, $runs);
            $idOnlyMs = $this->measure($profile, ['id'], $order, $offset, $runs);

            $rows[] = [
                'offset' => $offset,
                'all_ms' => $allMs,
                'list_ms' => $listMs,
                'id_only_ms' => $idOnlyMs,
                'ratio' => $idOnlyMs > 0 ? round($allMs / $idOnlyMs, 1) : null,
                'explain' => $this->option('explain') ? $this->explain($profile, $columns, $order, $offset) : null,
                // 지연 조인의 inner 가 실제로 어떤 계획을 타는지가 인덱스 설계의 근거다
                'explain_id_only' => $this->option('explain') ? $this->explain($profile, ['id'], $order, $offset) : null,
            ];
        }

        if ($this->option('json')) {
            $this->line(json_encode([
                'profile' => $key,
                'table' => $profile['table'],
                'columns' => $columns,
                'runs' => $runs,
                'results' => $rows,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            return self::SUCCESS;
        }

        $this->table(
            ['OFFSET', '전체 컬럼(ms)', '목록 컬럼(ms)', 'ID만(ms)', '전체÷ID'],
            array_map(fn (array $row) => [
                number_format($row['offset']),
                number_format($row['all_ms'], 1),
                number_format($row['list_ms'], 1),
                number_format($row['id_only_ms'], 1),
                $row['ratio'] !== null ? $row['ratio'].'×' : '-',
            ], $rows)
        );

        if ($this->option('explain')) {
            foreach ($rows as $row) {
                $this->newLine();
                $this->line("EXPLAIN @ OFFSET {$row['offset']} — 목록 컬럼");

                foreach ($row['explain'] as $line) {
                    $this->line('  '.$line);
                }

                $this->line("EXPLAIN @ OFFSET {$row['offset']} — ID 만 (지연 조인 inner)");

                foreach ($row['explain_id_only'] as $line) {
                    $this->line('  '.$line);
                }
            }
        }

        return self::SUCCESS;
    }

    /**
     * OFFSET 목록을 파싱합니다.
     *
     * @return array<int, int> 오름차순 정렬된 OFFSET 목록
     */
    private function parseOffsets(): array
    {
        $offsets = array_map('intval', array_filter(explode(',', (string) $this->option('offsets')), 'strlen'));
        sort($offsets);

        return $offsets === [] ? [0] : $offsets;
    }

    /**
     * 스키마에 실제로 존재하는 컬럼만 남깁니다.
     *
     * @param  string  $table  테이블명
     * @param  array<int, string>  $columns  후보 컬럼
     * @return array<int, string> 존재하는 컬럼 목록
     */
    private function existingColumns(string $table, array $columns): array
    {
        // ['*'] 는 "목록이 전 컬럼을 그대로 노출한다" 는 선언이다. 응답 계약상 넓은 컬럼을
        // 뺄 수 없는 목록(활동 로그의 changes, 알림 발송 이력의 body 등)이 여기 해당하며,
        // 이 경우 계측의 비교 축은 "select * vs select id" 가 된다.
        if ($columns === ['*']) {
            return Schema::getColumnListing($table);
        }

        $existing = array_values(array_filter($columns, fn (string $column) => Schema::hasColumn($table, $column)));

        return $existing === [] ? ['id'] : $existing;
    }

    /**
     * 스키마에 존재하는 정렬 컬럼만 남깁니다.
     *
     * @param  string  $table  테이블명
     * @param  array<int, array{0: string, 1: string}>  $order  후보 정렬
     * @return array<int, array{0: string, 1: string}> 적용 가능한 정렬 목록
     */
    private function existingOrder(string $table, array $order): array
    {
        $existing = array_values(array_filter($order, fn (array $spec) => Schema::hasColumn($table, $spec[0])));

        return $existing === [] ? [['id', 'desc']] : $existing;
    }

    /**
     * 한 조합을 여러 번 실행해 중앙값(ms)을 돌려줍니다.
     *
     * DB::enableQueryLog() 는 오버헤드와 메모리 누적이 있어 쓰지 않고 직접 시간을 잰다.
     *
     * @param  array  $profile  프로파일 정의
     * @param  array<int, string>  $columns  select 컬럼
     * @param  array<int, array{0: string, 1: string}>  $order  정렬
     * @param  int  $offset  OFFSET
     * @param  int  $runs  측정 횟수
     * @return float 중앙값 (밀리초)
     */
    private function measure(array $profile, array $columns, array $order, int $offset, int $runs): float
    {
        // 첫 회는 캐시 워밍 성격이라 버린다
        $this->runQuery($profile, $columns, $order, $offset);

        $samples = [];

        for ($i = 0; $i < $runs; $i++) {
            $start = microtime(true);
            $this->runQuery($profile, $columns, $order, $offset);
            $samples[] = (microtime(true) - $start) * 1000;
        }

        sort($samples);

        return $samples[intdiv(count($samples), 2)];
    }

    /**
     * 계측 대상 쿼리를 실행합니다.
     *
     * @param  array  $profile  프로파일 정의
     * @param  array<int, string>  $columns  select 컬럼
     * @param  array<int, array{0: string, 1: string}>  $order  정렬
     * @param  int  $offset  OFFSET
     */
    private function runQuery(array $profile, array $columns, array $order, int $offset): void
    {
        $this->buildQuery($profile, $columns, $order, $offset)->get();
    }

    /**
     * 계측 대상 쿼리를 조립합니다.
     *
     * @param  array  $profile  프로파일 정의
     * @param  array<int, string>  $columns  select 컬럼
     * @param  array<int, array{0: string, 1: string}>  $order  정렬
     * @param  int  $offset  OFFSET
     * @return Builder 조립된 쿼리
     */
    private function buildQuery(array $profile, array $columns, array $order, int $offset)
    {
        $query = DB::table($profile['table'])->select($columns);

        if ($profile['soft_delete'] && Schema::hasColumn($profile['table'], 'deleted_at')) {
            $query->whereNull('deleted_at');
        }

        foreach ($profile['filters'] ?? [] as $column => $value) {
            if (Schema::hasColumn($profile['table'], $column)) {
                $query->where($column, $value);
            }
        }

        foreach ($order as $spec) {
            $query->orderBy($spec[0], $spec[1]);
        }

        return $query->offset($offset)->limit(20);
    }

    /**
     * 실행 계획을 수집합니다.
     *
     * @param  array  $profile  프로파일 정의
     * @param  array<int, string>  $columns  select 컬럼
     * @param  array<int, array{0: string, 1: string}>  $order  정렬
     * @param  int  $offset  OFFSET
     * @return array<int, string> 실행 계획 요약 줄 목록
     */
    private function explain(array $profile, array $columns, array $order, int $offset): array
    {
        $query = $this->buildQuery($profile, $columns, $order, $offset);

        try {
            $plan = DB::select('EXPLAIN '.$query->toSql(), $query->getBindings());
        } catch (\Throwable $e) {
            return ['실행 계획 수집 실패: '.$e->getMessage()];
        }

        return array_map(function ($row) {
            $row = (array) $row;

            return sprintf(
                'type=%s key=%s rows=%s filtered=%s extra=%s',
                $row['type'] ?? '-',
                $row['key'] ?? '-',
                $row['rows'] ?? '-',
                $row['filtered'] ?? '-',
                $row['Extra'] ?? '-'
            );
        }, $plan);
    }

    /**
     * 계측용 합성 행을 시딩합니다.
     *
     * 스키마를 introspect 해 NOT NULL + 기본값 없는 컬럼만 타입에 맞춰 채운다. 프로파일마다
     * 별도 시더를 두면 대상이 늘 때마다 시더가 따라 늘어나므로 일반화한다.
     *
     * @param  string  $table  대상 테이블
     * @param  int  $count  시딩 건수
     * @param  array<string, mixed>  $overrides  컬럼별 고정값 (실제 조회 조건과 맞추기 위한 지정)
     */
    private function seedRows(string $table, int $count, array $overrides = []): void
    {
        $columns = Schema::getColumns($table);
        $fillable = array_values(array_filter(
            $columns,
            fn (array $column) => ! ($column['auto_increment'] ?? false)
                && ! $column['nullable']
                && ($column['default'] === null)
        ));

        $this->info("시딩: {$table} {$count} 건");
        $bar = $this->output->createProgressBar($count);

        $chunk = [];
        $chunkSize = 500;

        for ($i = 1; $i <= $count; $i++) {
            $row = [];

            foreach ($fillable as $column) {
                $row[$column['name']] = array_key_exists($column['name'], $overrides)
                    ? $overrides[$column['name']]
                    : $this->synthesizeValue($column, $i);
            }

            foreach ($overrides as $name => $value) {
                if (! array_key_exists($name, $row) && Schema::hasColumn($table, $name)) {
                    $row[$name] = $value;
                }
            }

            $chunk[] = $row;

            if (count($chunk) >= $chunkSize) {
                $this->insertSynthetic($table, $chunk);
                $bar->advance(count($chunk));
                $chunk = [];
            }
        }

        if ($chunk !== []) {
            $this->insertSynthetic($table, $chunk);
            $bar->advance(count($chunk));
        }

        $bar->finish();
        $this->newLine(2);
    }

    /**
     * 합성 행을 삽입합니다. (외래키 제약 일시 해제)
     *
     * 합성 값은 실제 부모 행을 가리키지 않으므로 FK 를 그대로 두면 삽입이 거부된다.
     * 본 커맨드가 재는 것은 대상 테이블의 OFFSET 스캔 비용이고 조인은 측정 대상이 아니므로,
     * 부모 무결성 없이 행 수와 행 폭만 재현하면 목적에 충분하다. 폐기 가능한 계측용 DB
     * (`--database`)에서만 쓰는 것을 전제로 한다.
     *
     * @param  string  $table  대상 테이블
     * @param  array<int, array<string, mixed>>  $chunk  삽입할 행 묶음
     */
    private function insertSynthetic(string $table, array $chunk): void
    {
        Schema::withoutForeignKeyConstraints(function () use ($table, $chunk) {
            DB::table($table)->insert($chunk);
        });
    }

    /**
     * 컬럼 타입에 맞는 합성 값을 만듭니다.
     *
     * @param  array  $column  Schema::getColumns() 항목
     * @param  int  $index  행 인덱스 (고유값 생성용)
     * @return mixed 합성 값
     */
    private function synthesizeValue(array $column, int $index): mixed
    {
        $type = strtolower((string) ($column['type_name'] ?? $column['type'] ?? 'varchar'));

        return match (true) {
            str_contains($type, 'int') => $index,
            str_contains($type, 'decimal'), str_contains($type, 'float'), str_contains($type, 'double') => 1000,
            str_contains($type, 'bool'), str_contains($type, 'tinyint') => 0,
            str_contains($type, 'json') => '{}',
            // 시간 컬럼을 한 값으로 채우면 정렬이 전부 동률이 되어 filesort 가 지배해 버린다.
            // 정렬 인덱스 효과를 재는 것이 목적이므로 행마다 값을 분산시킨다.
            str_contains($type, 'date'), str_contains($type, 'time') => now()->subMinutes($index),
            str_contains($type, 'text') => str_repeat('벤치마크 본문 ', 100),
            default => $this->synthesizeString($column, $index),
        };
    }

    /**
     * 문자열 컬럼의 선언 길이에 맞는 합성 값을 만듭니다.
     *
     * 컬럼 길이를 무시하고 고정 길이 문자열을 넣으면 `varchar(10)` 류(신고 대상 타입,
     * 우편번호, 로그 타입 등)에서 "Data too long" 으로 시딩 자체가 실패한다.
     *
     * @param  array  $column  Schema::getColumns() 항목
     * @param  int  $index  행 인덱스 (고유값 생성용)
     * @return string 합성 문자열
     */
    private function synthesizeString(array $column, int $index): string
    {
        $length = 40;

        // type 은 'varchar(10)' 형태로 선언 길이를 담고 있다
        if (preg_match('/\((\d+)\)/', (string) ($column['type'] ?? ''), $m) === 1) {
            $length = max(1, (int) $m[1]);
        }

        // 짧은 컬럼은 고유성 확보가 우선이라 인덱스 자체를 문자열로 쓴다
        if ($length <= 12) {
            return substr((string) $index, -$length);
        }

        return substr("bench-{$index}-".Str::random(8), 0, $length);
    }
}
