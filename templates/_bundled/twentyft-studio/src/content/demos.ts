/**
 * 자체 제작 데모의 고객용 표시 문구.
 *
 * 일반 고객이 보는 화면(홈·서비스 상세·제작 사례)에서는 제품 이름과 버전 정보를
 * 앞세우지 않는다. 대신 '무엇을 만든 화면인지'를 제목으로 쓰고,
 * 실제 제품명은 보조 정보로만 둔다. 제품 호환성·라이선스는 SuperBify 제품 상세에 그대로 남는다.
 *
 * DB의 제품 이름·slug·식별자는 바꾸지 않는다. 표시 문구만 여기서 정한다.
 */

export interface DemoDisplay {
    /** 고객용 대표 제목 */
    title: string;
    /** 확인된 화면과 기능 중심의 설명 */
    summary: string;
}

export const DEMO_DISPLAY: Record<string, DemoDisplay> = {
    'superbify-commerce-minimal': {
        title: '미니멀 쇼핑몰 데모',
        summary:
            '상품 목록과 상세, 장바구니, 주문서까지 쇼핑몰의 기본 구매 흐름을 구성한 화면입니다.',
    },
};

/**
 * 데모의 고객용 표시를 돌려준다.
 * 표시 문구가 없는 제품은 게시판에 적힌 이름과 요약을 그대로 쓴다.
 */
export function getDemoDisplay(slug: string, fallbackTitle: string, fallbackSummary?: string): DemoDisplay {
    const mapped = DEMO_DISPLAY[slug];
    if (mapped) {
        return mapped;
    }
    return {
        title: fallbackTitle,
        summary: fallbackSummary ?? '',
    };
}

/**
 * 첨부 이미지의 성격.
 *
 * 제품 상세의 Screenshots 에는 실제 UI 화면과 브랜드 로고·상품 사진이 섞여 올라온다.
 * 둘을 같은 격자에 두면 "이 화면이 제품 기능"이라는 오해를 만든다.
 *
 * 아래 값은 첨부 파일을 직접 열어 확인한 결과다(2026-09-16, superbify-commerce-minimal).
 * - 1672x941 가로형 = 홈·상품목록·상세·장바구니·주문을 담은 UI 콜라주
 * - 1254x1254 정방형 3장 = 브랜드 로고 1장 + 상품 사진 2장
 *
 * 확인되지 않은 첨부는 `ui` 로 둔다 — 화면일 가능성을 남겨두는 쪽이 안전하다.
 * 관리자가 이미지를 바꾸면 이 표도 함께 갱신해야 한다(DECISIONS.md 참고).
 */
const SCREENSHOT_KIND: Record<string, 'ui' | 'brand'> = {
    MMpe83IsLNEH: 'ui',
    RUwz6HCqh1oZ: 'brand',
    '3chpDDnVDIRq': 'brand',
    FiFLIFAsCImd: 'brand',
};

/** 첨부 URL 에서 첨부 id 를 뽑는다. 형식이 다르면 빈 문자열. */
export function attachmentId(url: string): string {
    const match = /\/attachment\/([^/]+)\//.exec(url);
    return match ? match[1] : '';
}

export function screenshotKind(url: string): 'ui' | 'brand' {
    return SCREENSHOT_KIND[attachmentId(url)] ?? 'ui';
}

