<?php

namespace Modules\Pinkbro\Contents\Enums;

enum MetaDomain: string
{
    case SERVICE = 'service';
    case PACKAGE = 'package';
    case CASE = 'case';
    case FAQ = 'faq';
    case INQUIRY = 'inquiry';
    case MEDIA = 'media';
    case SITE = 'site';
    case COPY = 'copy';
    case DISCOUNT = 'discount';
}
