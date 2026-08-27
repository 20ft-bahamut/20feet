<?php

namespace Modules\Twentyft\Content\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Twentyft\Content\Enums\InquiryBudgetRange;
use Modules\Twentyft\Content\Enums\InquiryProjectType;

/**
 * 프로젝트 문의 등록 요청 검증
 */
class InquiryStoreRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'company' => ['sometimes', 'nullable', 'string', 'max:200'],
            'project_type' => ['required', 'string', 'in:'.implode(',', array_column(InquiryProjectType::cases(), 'value'))],
            'current_site_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'budget_range' => ['sometimes', 'nullable', 'string', 'in:'.implode(',', array_column(InquiryBudgetRange::cases(), 'value'))],
            'desired_schedule' => ['sometimes', 'nullable', 'string', 'max:200'],
            'description' => ['required', 'string', 'max:5000'],
            'reference_url' => ['sometimes', 'nullable', 'url', 'max:500'],
            'privacy_consent' => ['required', 'accepted'],
            // honeypot — 정상 폼은 전송하지 않는 필드. 값이 있으면 봇으로 간주합니다.
            'website' => ['prohibited'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => '이름',
            'email' => '이메일',
            'phone' => '전화번호',
            'company' => '회사',
            'project_type' => '프로젝트 유형',
            'current_site_url' => '현재 사이트 URL',
            'budget_range' => '예산 범위',
            'desired_schedule' => '희망 일정',
            'description' => '문의 내용',
            'reference_url' => '참고 URL',
            'privacy_consent' => '개인정보 수집 동의',
        ];
    }
}
