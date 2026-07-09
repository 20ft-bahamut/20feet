<?php

return [
    'type' => [
        'income' => '所得控除用',
        'expense' => '支出証明用',
    ],
    'identifier_type' => [
        'phone' => '携帯電話番号',
        'card' => '現金領収書カード番号',
        'business' => '事業者登録番号',
    ],
    'transaction_type' => [
        'issue' => '発行',
        'cancel' => 'キャンセル',
    ],
    'issue_status' => [
        'in_progress' => '処理中',
        'completed' => '発行完了',
        'failed' => '発行失敗',
    ],
    'shipping_fee_tax_policy' => [
        'proportional' => '按分 (課税商品の比率に応じて課税)',
        'taxable' => '全額課税',
        'follow_main_item' => '主要な財を従う',
    ],
    'errors' => [
        'provider_not_configured' => '現金領収書発行プロバイダーが設定されていません。',
        'no_provider_handled' => '現金領収書発行リクエストを処理したプロバイダーがありません。',
        'no_issuable_amount' => '発行可能な現金性金額がありません。',
        'identifier_unavailable' => '再発行に必要な識別番号を復号化できません。管理者が識別番号を再入力して発行する必要があります。',
    ],
];
