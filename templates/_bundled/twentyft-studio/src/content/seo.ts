/**
 * 페이지별 문서 제목·설명.
 *
 * 배경: G7 코어 엔진은 클라이언트에서 document.title / meta description 을 갱신하지 않는다
 * (코어 번들에 해당 처리가 없다 — 확인 완료). 그래서 서버가 SEO 봇에게 주는 head 는
 * 페이지별로 맞지만, 일반 방문자의 탭 제목은 블레이드 기본값 하나로 고정된다.
 * 코어를 고치지 않고 템플릿에서 `usePageMeta` 로 같은 값을 적용한다.
 *
 * 서버(SeoMiddleware)가 쓰는 값과 어긋나지 않도록 lang/*.json 의 routes.*.title 과
 * 같은 문구를 쓴다. 한쪽만 바꾸면 봇과 방문자가 다른 제목을 보게 된다.
 */

export interface PageMeta {
    title: string;
    description: string;
}

/** 고정 경로의 문서 정보. */
export const PAGE_META: Record<string, PageMeta> = {
    '/': {
        title: '홈페이지·쇼핑몰·웹프로그램 제작 | 이십피트',
        description:
            '회사와 브랜드를 소개하는 홈페이지, 상품을 판매하는 쇼핑몰, 업무에 맞춘 웹프로그램을 기획하고 개발합니다.',
    },
    '/services': {
        title: '제작 서비스 | 이십피트',
        description: '홈페이지 제작, 쇼핑몰 제작, 맞춤형 웹프로그램 개발. 사업에 필요한 웹사이트를 제작합니다.',
    },
    '/services/website': {
        title: '홈페이지 제작 | 이십피트',
        description: '회사와 브랜드, 제품과 서비스를 소개하는 홈페이지를 제작합니다. 기존 사이트 개편도 상담할 수 있습니다.',
    },
    '/services/commerce': {
        title: '쇼핑몰 제작 | 이십피트',
        description: '상품 소개부터 장바구니와 주문까지, 브랜드에 맞는 쇼핑몰을 제작합니다.',
    },
    '/services/web-development': {
        title: '맞춤형 웹프로그램 개발 | 이십피트',
        description: '고객·계약·예약·작업 일정 등 업무에 필요한 정보를 웹에서 관리하도록 개발합니다.',
    },
    '/portfolio': {
        title: '제작 사례 | 이십피트',
        description: '웹사이트와 업무 시스템, 직접 개발한 쇼핑몰 화면을 살펴보세요.',
    },
    '/process': {
        title: '진행 안내 | 이십피트',
        description: '상담, 범위·견적 협의, 제작·확인, 검수·오픈까지. 각 단계에서 확인할 내용을 정리했습니다.',
    },
    '/about': {
        title: '이십피트 소개 | 이십피트',
        description: '20년 넘게 웹을 만들어온 경력과 주요 프로젝트, 일하는 방식을 소개합니다.',
    },
    '/inquiry': {
        title: '제작 문의 | 이십피트',
        description: '홈페이지, 쇼핑몰, 웹프로그램 제작과 기존 사이트 개선을 상담합니다. 만들고 싶은 것과 현재 상황을 알려주세요.',
    },
    '/superbify': {
        title: '자체 개발 제품 | 이십피트',
        description: '이십피트가 직접 개발한 쇼핑몰 템플릿과 그누보드 7 확장 제품입니다.',
    },
};

/** 상세 페이지의 제목·설명을 만든다. 이름이 없으면 목록 제목으로 되돌린다. */
export function detailMeta(
    name: string | undefined,
    fallbackPath: string,
    description?: string,
): PageMeta {
    const fallback = PAGE_META[fallbackPath];
    if (!name) {
        return fallback;
    }
    return {
        title: `${name} | 이십피트`,
        description: description?.trim() || fallback.description,
    };
}
