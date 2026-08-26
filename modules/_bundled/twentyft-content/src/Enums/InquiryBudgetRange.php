<?php

namespace Modules\Twentyft\Content\Enums;

/**
 * 프로젝트 문의 예산 범위
 */
enum InquiryBudgetRange: string
{
    case UNDECIDED = 'UNDECIDED';
    case BELOW_3M = 'BELOW_3M';
    case BETWEEN_3M_5M = 'BETWEEN_3M_5M';
    case BETWEEN_5M_10M = 'BETWEEN_5M_10M';
    case BETWEEN_10M_30M = 'BETWEEN_10M_30M';
    case ABOVE_30M = 'ABOVE_30M';
    case NEGOTIABLE = 'NEGOTIABLE';

    /**
     * 사용자 화면에 표시할 한국어 label
     */
    public function label(): string
    {
        return match ($this) {
            self::UNDECIDED => '미정',
            self::BELOW_3M => '300만원 이하',
            self::BETWEEN_3M_5M => '300~500만원',
            self::BETWEEN_5M_10M => '500~1,000만원',
            self::BETWEEN_10M_30M => '1,000~3,000만원',
            self::ABOVE_30M => '3,000만원 이상',
            self::NEGOTIABLE => '협의',
        };
    }
}
