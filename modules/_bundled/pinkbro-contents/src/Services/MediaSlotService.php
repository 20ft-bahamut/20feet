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

    public function __construct(private readonly ContentMetaService $meta) {}

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

    /**
     * 슬롯이 지금 가리키는 첨부 id — 연결돼 있지 않으면 null.
     *
     * `resolve()` 의 url 판정과 같은 조건을 쓴다: 메타 행이 없거나 `attachment_id` 가
     * 비어 있으면 "연결 없음"이다. 첨부 행 자체의 생존은 보지 않는다 — 소실된 첨부를
     * 가리키는 슬롯은 `resolve()` 가 url null 로 보므로 여기서도 id 만 돌려주고,
     * 그 판정은 호출자(`relabel()`·컨트롤러)가 한다.
     */
    public function linkedAttachmentId(string $slot): ?int
    {
        self::assertKnown($slot);

        $row = $this->meta->get(null, null, MetaDomain::MEDIA, $slot);

        if (! is_array($row) || empty($row['attachment_id'])) {
            return null;
        }

        return (int) $row['attachment_id'];
    }

    /**
     * 이미 연결된 슬롯의 대체 텍스트만 바꾼다 — 새 업로드가 없는 저장 경로다.
     *
     * 첨부는 `link()` 로 같은 id 를 다시 쓴다: 새 첨부를 만들지 않고, 슬롯이 가리키는
     * 대상도 바꾸지 않는다. 그래서 이 경로는 앵커 게시글의 첨부 예산을 쓰지 않는다.
     *
     * 연결된 첨부가 없으면(또는 그 첨부 행이 사라졌으면) `false` 를 돌려준다 —
     * 붙일 대상이 없는 저장을 성공으로 위장하지 않기 위해서다. 호출자가 422 로 매핑한다.
     */
    public function relabel(string $slot, ?string $alt): bool
    {
        self::assertKnown($slot);

        $attachment = Attachment::find($this->linkedAttachmentId($slot) ?? 0);

        if (! $attachment) {
            return false;
        }

        $this->link($slot, (int) $attachment->id, $alt);

        return true;
    }

    /**
     * 그 첨부를 아직 가리키는 슬롯이 남아 있는가.
     *
     * 재연결로 슬롯이 놓은 첨부를 정리할 때, 다른 슬롯이 같은 첨부를 가리키고 있으면
     * 손대면 안 된다 (두 슬롯이 한 첨부를 공유하는 상태는 메타를 직접 만진 경우에도
     * 생길 수 있다). `$exceptSlot` 은 "지금 다시 연결하는 슬롯"을 세지 않기 위한 것이다 —
     * 이 판정은 새 연결을 쓰기 **전에** 부르므로, 제외하지 않으면 자기 자신이 걸린다.
     */
    public function attachmentInUse(int $attachmentId, ?string $exceptSlot = null): bool
    {
        foreach (self::slotKeys() as $slot) {
            if ($slot === $exceptSlot) {
                continue;
            }

            if ($this->linkedAttachmentId($slot) === $attachmentId) {
                return true;
            }
        }

        return false;
    }

    public function unlink(string $slot): void
    {
        self::assertKnown($slot);
        // 슬롯 단위 삭제 — 도메인 전체를 지우면 다른 슬롯이 함께 날아간다.
        $this->meta->deleteKey(null, null, MetaDomain::MEDIA, $slot);
    }
}
