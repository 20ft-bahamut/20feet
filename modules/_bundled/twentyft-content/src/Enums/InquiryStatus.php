<?php

namespace Modules\Twentyft\Content\Enums;

/**
 * 프로젝트 문의 내부 관리 상태
 */
enum InquiryStatus: string
{
    case NEW = 'NEW';
    case REVIEWING = 'REVIEWING';
    case REPLIED = 'REPLIED';
    case MEETING = 'MEETING';
    case ESTIMATING = 'ESTIMATING';
    case CLOSED = 'CLOSED';

    /**
     * 관리자 화면 라벨의 번역 키
     *
     * 라벨은 화면 표시 전용이다. 저장되는 값은 언제나 enum value 이므로
     * 관리자 로케일에 따라 문구가 바뀌어도 데이터는 변하지 않는다.
     */
    public function labelKey(): string
    {
        return 'twentyft-content::enums.inquiry_status.'.$this->value;
    }

    /**
     * 관리자 화면에 표시할 라벨 (현재 로케일)
     */
    public function label(): string
    {
        return __($this->labelKey());
    }
}
