<?php

namespace Modules\Twentyft\Content\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Twentyft\Content\Enums\PortfolioStatus;
use Modules\Twentyft\Content\Enums\PortfolioType;

/**
 * Portfolio 목록 조회 요청 검증
 */
class PortfolioListRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'featured' => ['sometimes', 'in:0,1,true,false'],
            'type' => ['sometimes', 'string', 'in:'.implode(',', array_column(PortfolioType::cases(), 'value'))],
            'status' => ['sometimes', 'string', 'in:'.implode(',', array_column(PortfolioStatus::cases(), 'value'))],
        ];
    }

    /**
     * 기본값을 반환합니다.
     *
     * @return array<string, mixed>
     */
    public function defaults(): array
    {
        return [
            'page' => 1,
            'per_page' => 12,
        ];
    }
}
