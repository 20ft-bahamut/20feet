<?php

namespace Modules\Twentyft\Content\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Twentyft\Content\Enums\SuperBifyStatus;
use Modules\Twentyft\Content\Enums\SuperBifyType;

/**
 * SuperBify 목록 조회 요청 검증
 */
class SuperBifyListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'featured' => ['sometimes', 'in:0,1,true,false'],
            'type' => ['sometimes', 'string', 'in:'.implode(',', array_column(SuperBifyType::cases(), 'value'))],
            'status' => ['sometimes', 'string', 'in:'.implode(',', array_column(SuperBifyStatus::cases(), 'value'))],
        ];
    }
}
