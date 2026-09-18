<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pinkbro_meta', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('board_id')->nullable();
            $table->unsignedBigInteger('post_id')->nullable();
            $table->string('domain', 32);
            $table->string('key', 64);
            $table->json('value')->nullable();
            $table->timestamps();

            $table->unique(['board_id', 'post_id', 'domain', 'key'], 'pinkbro_meta_unique_key');
            $table->index(['domain', 'key'], 'pinkbro_meta_domain_key_index');
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('pinkbro_meta')) {
            Schema::dropIfExists('pinkbro_meta');
        }
    }
};
