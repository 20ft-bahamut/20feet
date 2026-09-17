<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Enum Translations (English)
    |--------------------------------------------------------------------------
    |
    | Admin screen display only. The persisted value is the enum value;
    | these strings never reach stored data.
    |
    */

    // Project inquiry handling status
    'inquiry_status' => [
        'NEW' => 'New',
        'REVIEWING' => 'Reviewing',
        'REPLIED' => 'Replied',
        'MEETING' => 'Meeting scheduled',
        'ESTIMATING' => 'Preparing estimate',
        'CLOSED' => 'Closed',
    ],

    // Project inquiry type (admin display — the board post title stores its own value)
    'inquiry_project_type' => [
        'WEB' => 'Website',
        'COMMERCE' => 'Commerce',
        'WEB_SERVICE' => 'Web service',
        'GNUBOARD7' => 'Gnuboard 7',
        'SYSTEM_IMPROVEMENT' => 'Improving an existing system',
        'INTERNAL_SYSTEM' => 'Internal work system',
        'OTHER' => 'Other',
    ],

    // Project inquiry budget range
    'inquiry_budget_range' => [
        'UNDECIDED' => 'Undecided',
        'BELOW_3M' => 'Under 3M KRW',
        'BETWEEN_3M_5M' => '3M – 5M KRW',
        'BETWEEN_5M_10M' => '5M – 10M KRW',
        'BETWEEN_10M_30M' => '10M – 30M KRW',
        'ABOVE_30M' => 'Over 30M KRW',
        'NEGOTIABLE' => 'Negotiable',
    ],
];
