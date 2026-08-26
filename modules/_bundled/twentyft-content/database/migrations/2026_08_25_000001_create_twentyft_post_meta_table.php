<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('twentyft_post_meta', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('board_id')->comment('G7 board id');
            $table->unsignedBigInteger('post_id')->comment('G7 board_posts id');
            $table->string('domain', 32)->comment('portfolio / superbify / inquiry');
            $table->string('key', 64)->comment('meta key');
            $table->json('value')->nullable()->comment('JSON-encoded meta value');
            $table->timestamps();

            $table->unique(
                ['board_id', 'post_id', 'domain', 'key'],
                'twentyft_post_meta_unique_key'
            );

            $table->index(['domain', 'key'], 'twentyft_post_meta_domain_key_index');
        });

        if (DB::getDriverName() === 'mysql') {
            Schema::table('twentyft_post_meta', function (Blueprint $table) {
                $table->comment('20ft Website용 Board Post 구조화 메타');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('twentyft_post_meta')) {
            Schema::dropIfExists('twentyft_post_meta');
        }
    }
};
