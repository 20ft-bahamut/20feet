import { default as React } from 'react';
import { ServiceItem, SiteData } from '../lib/types';
export interface InquiryFormProps {
    /** 사이트 기본 정보. null 이면 아직 로딩 중 — 스켈레톤. */
    site: SiteData | null;
    /** 서비스 목록. null 이면 아직 로딩 중 — 스켈레톤(스펙 5.4: null → 필드 숨김). */
    services: ServiceItem[] | null;
    /** 섹션 도입 문구(copy 도메인). null 이면 문구 없이 렌더한다. */
    intro: string | null;
    className?: string;
}
export declare function InquiryForm({ site, services, intro, className }: InquiryFormProps): React.ReactElement;
export default InquiryForm;
