<?php

namespace Modules\Twentyft\Content\Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * 20ft Content 모듈 시더 진입점
 */
class DatabaseSeeder extends Seeder
{
    /**
     * 시더 실행
     */
    public function run(): void
    {
        $this->call([
            TwentyftContentSeeder::class,
        ]);
    }
}
