import { default as React } from 'react';
import { MediaSlots, ServiceItem, SiteData } from '../lib/types';
export interface InquiryFormProps {
    /** 사이트 기본 정보. null 이면 아직 로딩 중 — 스켈레톤. */
    site: SiteData | null;
    /** 서비스 목록. null 이면 아직 로딩 중 — 스켈레톤(스펙 5.4: null → 필드 숨김). */
    services: ServiceItem[] | null;
    /** 미디어 슬롯 키 → 슬롯. null = 아직 로딩 중. `estimate_bg` 가 이 섹션의 배경 이미지다. */
    media: MediaSlots | null;
    /** 섹션 제목(copy: estimate_intro). null 이면 제목 없이 렌더한다. */
    intro: string | null;
    /** 섹션 보조 문구(copy: estimate_note). null 이면 생략한다. */
    sub: string | null;
    /** 좌측 체크리스트 3항목(copy: estimate_checklist). null = 로딩 중, [] = 항목 없음. */
    checklist: string[] | null;
    /** 우측 패널 제목(copy: estimate_panel_heading). null 이면 생략한다. */
    panelHeading: string | null;
    /** 우측 패널 안내 문구(copy: estimate_panel_sub). null 이면 생략한다. */
    panelSub: string | null;
    /** 폼 하단 안내 문구(copy: estimate_panel_note). 원문 456행처럼 <strong> 마크업과 \n(원본 <br>)을 담는다. null 이면 생략한다. */
    panelNote: string | null;
    className?: string;
}
export declare function InquiryForm({ site, services, media, intro, sub, checklist, panelHeading, panelSub, panelNote, className, }: InquiryFormProps): React.ReactElement;
export default InquiryForm;
