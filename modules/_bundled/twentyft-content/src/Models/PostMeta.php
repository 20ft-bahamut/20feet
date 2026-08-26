<?php

namespace Modules\Twentyft\Content\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * 20ft post structured metadata row.
 *
 * One board post can have many meta rows keyed by domain + key.
 */
class PostMeta extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'twentyft_post_meta';

    /**
     * The attributes that are mass assignable.
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
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'value' => 'json',
    ];

    /**
     * Disable default timestamp auto-increment guard for JSON value column.
     *
     * @var bool
     */
    public $timestamps = true;
}
