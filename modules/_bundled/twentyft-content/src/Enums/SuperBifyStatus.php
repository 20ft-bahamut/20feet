<?php

namespace Modules\Twentyft\Content\Enums;

/**
 * SuperBify 상태
 */
enum SuperBifyStatus: string
{
    case IDEA = 'IDEA';
    case RESEARCH = 'RESEARCH';
    case BUILDING = 'BUILDING';
    case RELEASED = 'RELEASED';
    case MAINTENANCE = 'MAINTENANCE';
    case ARCHIVED = 'ARCHIVED';
}
