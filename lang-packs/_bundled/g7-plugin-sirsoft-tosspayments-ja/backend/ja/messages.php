<?php

return [
    'refund' => [
        'missing_payment_key' => 'Toss Payments の決済キーが存在しないため、返金処理ができません。',
        'default_reason' => '顧客リクエストによるキャンセル',
    ],
    'settings_validation' => [
        'vbank_valid_hours_range' => '仮想口座の入金期限は :min～:max時間(最大90日)の間である必要があります。',
        'use_escrow_invalid' => 'エスクロー使用設定値が正しくありません。',
    ],
];
