/**
 * pinkbro-contents 모듈 API 응답 계약 타입.
 *
 * 키 이름은 API 가 내려주는 snake_case 그대로다. 컴포넌트가 payload 를
 * 직접 읽으므로 camelCase 로 변환하지 않는다.
 *
 * 목록 성질의 필드는 `T[] | null` 이다 — `null` 은 로딩 중, `[]` 는 빈 목록.
 * (3단 폴백: 로딩 / 빈 목록 / 데이터)
 */

/** 이미지 슬롯 — 미설정이면 url·alt 모두 null */
export interface MediaSlot {
  url: string | null;
  alt: string | null;
}

/** 슬롯 키 → 이미지 슬롯 */
export type MediaSlots = Record<string, MediaSlot>;

/** 사이트 기본 정보 */
export interface SiteData {
  brand_name: string | null;
  brand_name_en: string | null;
  tagline: string | null;
  eyebrow: string | null;
  phone: string | null;
  kakao_channel: string | null;
  region: string | null;
  og_image_slot: string | null;
}

/** 페이지 카피 */
export interface CopyData {
  hero_headline: string | null;
  hero_lead: string | null;
  hero_pills: string[] | null;
  about_message: string | null;
  about_perspectives: { title: string; body: string }[] | null;
  service_intro: string | null;
  package_intro: string | null;
  pricing_notice: string | null;
  pricing_flow: string | null;
  projects_intro: string | null;
  projects_note: string | null;
  estimate_intro: string | null;
  estimate_note: string | null;
  faq_intro: string | null;
  footer_text: string | null;
}

/** 서비스별 에어컨 타입 옵션 */
export interface AirType {
  kind: string;
  price_label: string;
  price_value: number;
  default_selected?: boolean;
}

/** 서비스 항목. 별도 body 텍스트는 없다(스펙에서 제거됨). */
export interface ServiceItem {
  slug: string;
  title: string;
  tag: string;
  summary: string;
  criteria: string;
  base_price: string;
  extra_note: string;
  air_types?: AirType[];
  photo: MediaSlot;
}

/** 패키지 상품 */
export interface PackageItem {
  title: string;
  summary: string;
  includes: string[];
  base_total: string;
  price: string;
  discount_rate: number;
  is_featured: boolean;
}

/** 시공 사례 */
export interface CaseItem {
  title: string;
  summary: string;
  blog_url: string;
  cover: MediaSlot;
}

/** FAQ 항목 */
export interface FaqItem {
  question: string;
  answer: string;
}

/** 견적계산기 할인 단계 */
export interface DiscountStep {
  condition: string;
  amount_label: string;
}

/** 견적계산기의 계산 입력 — 서비스 목록에서 파생 */
export interface EstimateOption {
  key: string;
  label: string;
  price: number;
}

/** 문의 접수 payload */
export interface InquiryPayload {
  business_type: string;
  services: string[];
  store_size: string;
  contact: string;
  message: string;
  privacy_consent: boolean;
  website: string;
}
