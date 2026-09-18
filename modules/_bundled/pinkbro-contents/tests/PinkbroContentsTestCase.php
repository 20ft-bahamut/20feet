<?php

namespace Modules\Pinkbro\Contents\Tests;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

abstract class PinkbroContentsTestCase extends TestCase
{
    use RefreshDatabase;

    /**
     * 테스트 DB 미가용 환경에서 실패 대신 skip 으로 갈라낸다.
     * 선례: modules/_bundled/twentyft-content/tests/Feature/InquiryAdminApiTest.php:45-53
     */
    protected function beforeRefreshingDatabase(): void
    {
        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $this->markTestSkipped('테스트 DB에 접속할 수 없어 건너뜁니다: '.$e->getMessage());
        }
    }
}
