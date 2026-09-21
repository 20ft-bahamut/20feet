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

/** 히어로 스코프 카드(01 Customer Area / 02 Kitchen Hygiene / 03 Air Care) */
export interface HeroScopeItem {
  no: string;
  title: string;
  body: string;
}

/**
 * 페이지 카피 — 모듈 `pinkbro-contents` 가 COPY 도메인에 넣는 82개 키 전량.
 *
 * 값은 시더가 저장한 원문 그대로다. 개행(`\n`, 원문 `<br>`)과 인라인 강조
 * (`<em>` / `<strong>`)가 값 안에 남아 있으므로 컴포넌트가 그대로 렌더한다
 * (COPY POLICY — 여기서 문자열을 만들거나 태그를 지우지 않는다).
 *
 * 2026-09 복원 배치: 원문에만 있고 키가 없던 눈금(eyebrow)·라벨·CTA 30개를
 * 시더 COPY 에 추가하면서 이 타입도 함께 늘렸다. 원문 body.html 행 번호는
 * 시더 주석에 남아 있다.
 */
export interface CopyData {
  // --- Hero ---
  hero_headline: string | null;
  hero_lead: string | null;
  hero_pills: string[] | null;
  hero_visual_label: string | null;
  hero_visual_message_label: string | null;
  hero_visual_brand_message: string | null;
  hero_visual_body: string | null;
  hero_scope: HeroScopeItem[] | null;
  hero_cta_primary: string | null;
  hero_cta_secondary: string | null;
  // --- About ---
  about_heading: string | null;
  about_message: string | null;
  about_side_heading: string | null;
  about_stage_eyebrow: string | null;
  about_side_eyebrow: string | null;
  about_perspectives: { title: string; body: string }[] | null;
  // --- Service ---
  service_eyebrow: string | null;
  service_intro: string | null;
  service_intro_sub: string | null;
  service_detail_label: string | null;
  extra_box_heading: string | null;
  extra_box_body: string | null;
  extra_box_cta: string | null;
  // --- Package ---
  package_stage_eyebrow: string | null;
  package_intro: string | null;
  package_intro_sub: string | null;
  package_a_label: string | null;
  package_b_label: string | null;
  package_c_label: string | null;
  package_a_note: string | null;
  package_a_note_sub: string | null;
  package_b_note: string | null;
  package_b_note_sub: string | null;
  package_c_note: string | null;
  package_c_note_sub: string | null;
  benefit_eyebrow: string | null;
  benefit_heading: string | null;
  benefit_sub: string | null;
  benefit_items: DiscountStep[] | null;
  // --- Pricing ---
  pricing_eyebrow: string | null;
  pricing_heading: string | null;
  pricing_sub: string | null;
  pricing_notice: string | null;
  pricing_notice_label: string | null;
  pricing_notice_sub: string | null;
  pricing_field: string | null;
  pricing_flow_label: string | null;
  pricing_flow: string | null;
  // --- Estimator ---
  estimator_eyebrow: string | null;
  estimator_heading: string | null;
  estimator_sub: string | null;
  estimator_summary_heading: string | null;
  estimator_summary_total_label: string | null;
  estimator_summary_note: string | null;
  estimator_air_label: string | null;
  estimator_row_count: string | null;
  estimator_row_base: string | null;
  estimator_row_discount: string | null;
  estimator_row_discount_amount: string | null;
  estimator_cta_submit: string | null;
  estimator_cta_kakao: string | null;
  // --- FAQ ---
  faq_eyebrow: string | null;
  faq_intro: string | null;
  faq_intro_sub: string | null;
  // --- Projects ---
  projects_eyebrow: string | null;
  projects_card_kicker: string | null;
  projects_link_label: string | null;
  projects_intro: string | null;
  projects_sub: string | null;
  projects_note: string | null;
  // --- Estimate / inquiry ---
  estimate_intro: string | null;
  estimate_note: string | null;
  estimate_checklist: string[] | null;
  estimate_panel_heading: string | null;
  estimate_panel_sub: string | null;
  estimate_panel_note: string | null;
  // --- Footer ---
  footer_text: string | null;
  footer_brand_desc: string | null;
  // --- Header / mobile bar (사이트 크롬) ---
  header_cta: string | null;
  mobile_cta_estimate: string | null;
  mobile_cta_phone: string | null;
  mobile_cta_kakao: string | null;
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
  /**
   * 이 사례가 쓰는 커버 슬롯 키(`case_1`…`case_4`).
   *
   * 공개 API(`CaseResource`)는 아직 이 키를 내려주지 않는다 — 서버가 `cover_slot` 을
   * 해석해 `cover` 로만 돌려주기 때문이다. 그래서 현재 카드의 슬롯은 카드 순번으로
   * 정해진다(CaseGallery 참조). 계약이 이 키를 노출하면 이 값이 순번을 이긴다.
   */
  cover_slot?: string | null;
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
