<?php

namespace Modules\Twentyft\Content\Enums;

/**
 * SuperBify 제품 유형
 */
enum SuperBifyType: string
{
    case MODULE = 'MODULE';
    case PLUGIN = 'PLUGIN';
    case TEMPLATE = 'TEMPLATE';
    case INTEGRATION = 'INTEGRATION';
    case DEVELOPER_TOOL = 'DEVELOPER_TOOL';
    case OPEN_SOURCE = 'OPEN_SOURCE';
}
