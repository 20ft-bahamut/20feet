<?php

namespace Modules\Pinkbro\Contents\Services;

use InvalidArgumentException;
use Modules\Pinkbro\Contents\Enums\MetaDomain;
use Modules\Sirsoft\Board\Models\Attachment;

/**
 * 미디어 슬롯 서비스.
 *
 * 관리자가 업로드하는 이미지 슬롯의 유일한 목록 출처(SLOTS)이자,
 * 슬롯 키 → 서빙 URL 해석과 첨부 연결/해제를 담당한다.
 *
 * 파일 저장은 하지 않는다 — 업로드는 G7 sirsoft-board 첨부가 맡고,
 * 이 서비스는 그 첨부 id 를 MEDIA 도메인 메타에 묶어 두는 역할만 한다.
 */
class MediaSlotService
{
    /** 슬롯 레지스트리 — 이 목록이 유일한 출처다. */
    private const SLOTS = [
        'hero_main' => ['ko' => '히어로 대표 이미지', 'en' => 'Hero main'],
        'hero_sub' => ['ko' => '히어로 보조 이미지', 'en' => 'Hero sub'],
        'why_stage' => ['ko' => '브랜드 소개 이미지', 'en' => 'Why stage'],
        'package_stage' => ['ko' => '패키지 섹션 이미지', 'en' => 'Package stage'],
        'estimate_bg' => ['ko' => '견적 섹션 배경', 'en' => 'Estimate background'],
        'case_1' => ['ko' => '작업사례 1 썸네일', 'en' => 'Case 1 cover'],
        'case_2' => ['ko' => '작업사례 2 썸네일', 'en' => 'Case 2 cover'],
        'case_3' => ['ko' => '작업사례 3 썸네일', 'en' => 'Case 3 cover'],
        'case_4' => ['ko' => '작업사례 4 썸네일', 'en' => 'Case 4 cover'],
        'site_og' => ['ko' => '공유 이미지(og:image)', 'en' => 'Social share image'],
        'services_floor' => ['ko' => '바닥 기계세척 사진', 'en' => 'Floor care photo'],
        'services_glass' => ['ko' => '유리창 세척 사진', 'en' => 'Glass care photo'],
        'services_awning' => ['ko' => '접이식 어닝 세척 사진', 'en' => 'Awning care photo'],
        'services_sign' => ['ko' => '간판 세척 사진', 'en' => 'Sign care photo'],
        'services_kitchen' => ['ko' => '상업용 후드 세척 사진', 'en' => 'Kitchen care photo'],
        'services_air' => ['ko' => '에어컨 분해세척 사진', 'en' => 'Air care photo'],
    ];

    public function __construct(private readonly ContentMetaService $meta)
    {
    }

    /** @return string[] */
    public static function slotKeys(): array
    {
        return array_keys(self::SLOTS);
    }

    public static function labels(): array
    {
        return self::SLOTS;
    }

    private static function assertKnown(string $slot): void
    {
        if (! array_key_exists($slot, self::SLOTS)) {
            throw new InvalidArgumentException("Unknown media slot: {$slot}");
        }
    }

    /**
     * 슬롯 하나를 서빙 URL 로 해석한다.
     *
     * 알려진 슬롯에는 항상 배열을 돌려준다 — 슬롯 미설정이나 첨부 행 소실은
     * `['url' => null, 'alt' => null]` 로 표현하지 `null` 로 표현하지 않는다.
     *
     * @return array{url: string|null, alt: string|null}
     *
     * @throws InvalidArgumentException 알 수 없는 슬롯 키
     */
    public function resolve(string $slot): array
    {
        self::assertKnown($slot);

        $row = $this->meta->get(null, null, MetaDomain::MEDIA, $slot);

        if (! is_array($row) || empty($row['attachment_id'])) {
            return ['url' => null, 'alt' => null];
        }

        $attachment = Attachment::find($row['attachment_id']);
        $url = $attachment?->preview_url ?? $attachment?->download_url ?? null;

        return ['url' => $url, 'alt' => $row['alt'] ?? null];
    }

    public function resolveAll(): array
    {
        $out = [];
        foreach (self::slotKeys() as $slot) {
            $out[$slot] = $this->resolve($slot);
        }

        return $out;
    }

    public function link(string $slot, int $attachmentId, ?string $alt = null): void
    {
        self::assertKnown($slot);

        $attachment = Attachment::find($attachmentId);
        if (! $attachment) {
            throw new InvalidArgumentException("Attachment {$attachmentId} not found");
        }

        $this->meta->set(null, null, MetaDomain::MEDIA, $slot, [
            'attachment_id' => $attachmentId,
            'hash' => $attachment->hash,
            'alt' => $alt,
        ]);
    }

    public function unlink(string $slot): void
    {
        self::assertKnown($slot);
        // 슬롯 단위 삭제 — 도메인 전체를 지우면 다른 슬롯이 함께 날아간다.
        $this->meta->deleteKey(null, null, MetaDomain::MEDIA, $slot);
    }
}
