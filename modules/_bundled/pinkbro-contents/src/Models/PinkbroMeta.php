<?php

namespace Modules\Pinkbro\Contents\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * PinkBro CleanCare 구조화 메타 행.
 *
 * 한 게시글(또는 게시판/전역)이 domain + key 로 구분되는 여러 메타 행을 가진다.
 */
class PinkbroMeta extends Model
{
    /**
     * 모델과 연결된 테이블
     *
     * @var string
     */
    protected $table = 'pinkbro_meta';

    /**
     * 대량 할당 가능한 속성
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'board_id',
        'post_id',
        'domain',
        'key',
        'value',
    ];

    /**
     * 캐스팅할 속성
     *
     * `array` 캐스팅으로 PHP 배열(중첩 배열 포함)이 JSON 왕복 후에도 그대로 돌아온다.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'array',
    ];
}
