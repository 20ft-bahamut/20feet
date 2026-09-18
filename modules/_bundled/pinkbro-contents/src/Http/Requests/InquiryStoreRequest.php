<?php

namespace Modules\Pinkbro\Contents\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * 문의 접수 요청 검증.
 *
 * 비회원도 제출하므로 권한 게이트가 없다. 필드 이름은 템플릿 문의 폼이
 * 서버 오류를 자기 필드에 매핑하는 키이므로 snake_case 그대로 유지한다.
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
            'business_type' => ['required', 'string', 'max:50'],
            'services' => ['required', 'array', 'min:1'],
            'services.*' => ['string', 'max:50'],
            'store_size' => ['nullable', 'string', 'max:200'],
            'contact' => ['required', 'string', 'max:50'],
            'message' => ['nullable', 'string', 'max:5000'],
            'privacy_consent' => ['required', 'accepted'],
            // honeypot — 정상 폼은 전송하지 않는 필드. 값이 있으면 봇으로 간주합니다.
            'website' => ['prohibited'],
        ];
    }
}
