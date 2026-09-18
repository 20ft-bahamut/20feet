<?php

namespace Modules\Pinkbro\Contents\Enums;

/**
 * 문의 처리 상태.
 *
 * meta(key='status') 로 문의 게시글에 붙는다. 접수 시점은 항상 NEW 다.
 */
enum InquiryStatus: string
{
    case NEW = 'new';
    case IN_PROGRESS = 'in_progress';
    case DONE = 'done';
}
