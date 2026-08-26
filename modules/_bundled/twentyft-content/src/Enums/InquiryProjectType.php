<?php

namespace Modules\Twentyft\Content\Enums;

/**
 * 프로젝트 문의 유형
 */
enum InquiryProjectType: string
{
    case WEB = 'WEB';
    case COMMERCE = 'COMMERCE';
    case WEB_SERVICE = 'WEB_SERVICE';
    case GNUBOARD7 = 'GNUBOARD7';
    case SYSTEM_IMPROVEMENT = 'SYSTEM_IMPROVEMENT';
    case INTERNAL_SYSTEM = 'INTERNAL_SYSTEM';
    case OTHER = 'OTHER';

    /**
     * 사용자 화면에 표시할 한국어 label
     */
    public function label(): string
    {
        return match ($this) {
            self::WEB => '웹사이트',
            self::COMMERCE => '커머스',
            self::WEB_SERVICE => '웹서비스',
            self::GNUBOARD7 => '그누보드 7',
            self::SYSTEM_IMPROVEMENT => '기존 시스템 개선',
            self::INTERNAL_SYSTEM => '내부 업무 시스템',
            self::OTHER => '기타',
        };
    }
}
