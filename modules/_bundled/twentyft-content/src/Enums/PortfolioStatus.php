<?php

namespace Modules\Twentyft\Content\Enums;

/**
 * Portfolio 상태
 */
enum PortfolioStatus: string
{
    case BUILDING = 'BUILDING';
    case OPERATING = 'OPERATING';
    case RELEASED = 'RELEASED';
    case RESEARCH = 'RESEARCH';
    case ARCHIVED = 'ARCHIVED';
}
