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
}
