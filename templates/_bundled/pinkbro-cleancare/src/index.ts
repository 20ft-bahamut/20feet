/**
 * PinkBro CleanCare Gnuboard7 User Template
 *
 * 랜딩 페이지 — Basic 컴포넌트 15종(Div 포함) + 섹션(composite) 컴포넌트 13종.
 *
 * 스타일시트 import 는 필수다: `resources/views/app.blade.php` 가 활성 사용자
 * 템플릿의 `css/components.css` 를 무조건 링크하므로, CSS import 가 없으면
 * `vite build` 가 `dist/css/components.css` 를 만들지 않아 모든 페이지가 404 를 낸다.
 *
 * 컴포넌트 이름은 `components.json` 의 `name` 및 각 파일의 export 이름과
 * 정확히 일치해야 한다. 불일치하면 registry 가 경고만 남기고 건너뛰어
 * 해당 컴포넌트가 페이지에서 조용히 사라진다.
 */

import './styles/design-tokens.css';
import templateMetadata from '../template.json';

// Logger (G7Core 초기화 전에도 동작하도록 폴백 포함)
const logger = ((window as any).G7Core?.createLogger?.('Template:pinkbro-cleancare')) ?? {
    log: (...args: unknown[]) => console.log('[Template:pinkbro-cleancare]', ...args),
    warn: (...args: unknown[]) => console.warn('[Template:pinkbro-cleancare]', ...args),
    error: (...args: unknown[]) => console.error('[Template:pinkbro-cleancare]', ...args),
};

// Basic 컴포넌트 15종
export { Div, type DivProps } from './components/basic/Div';
export { Button, type ButtonProps } from './components/basic/Button';
export { H2, type H2Props } from './components/basic/H2';
export { H3, type H3Props } from './components/basic/H3';
export { H4, type H4Props } from './components/basic/H4';
export { P, type PProps } from './components/basic/P';
export { A, type AProps } from './components/basic/A';
export { Img, type ImgProps } from './components/basic/Img';
export { Span, type SpanProps } from './components/basic/Span';
export { Details, type DetailsProps } from './components/basic/Details';
export { Summary, type SummaryProps } from './components/basic/Summary';
export { Input, type InputProps } from './components/basic/Input';
export { Select, type SelectProps } from './components/basic/Select';
export { Textarea, type TextareaProps } from './components/basic/Textarea';
export { Label, type LabelProps } from './components/basic/Label';

// 섹션(composite) 컴포넌트 — 각 파일이 자체 CSS를 import 한다
export { Hero, type HeroProps } from './components/Hero';
export { AboutSection, type AboutSectionProps } from './components/AboutSection';
export { ServiceGrid, type ServiceGridProps } from './components/ServiceGrid';
export { PackageList, type PackageListProps } from './components/PackageList';
export { PriceDiscount, type PriceDiscountProps } from './components/PriceDiscount';
export { FaqList, type FaqListProps } from './components/FaqList';
export { CaseGallery, type CaseGalleryProps } from './components/CaseGallery';
export { EstimateCalculator, type EstimateCalculatorProps } from './components/EstimateCalculator';
export { InquiryForm, type InquiryFormProps } from './components/InquiryForm';
export { SiteHeader, type SiteHeaderProps, telHref } from './components/SiteHeader';
export { SiteFooter, type SiteFooterProps } from './components/SiteFooter';
export { MobileBar, type MobileBarProps } from './components/MobileBar';
export { TopArrow, type TopArrowProps } from './components/TopArrow';

// 섹션 컴포넌트가 사용하는 lib 유틸
export {
    calculateEstimate,
    discountRateFor,
    formatWon,
    parsePrice,
    type EstimateResult,
} from './lib/estimate';
export {
    BUSINESS_TYPES,
    EMPTY_INQUIRY_FORM,
    INQUIRY_ENDPOINT,
    INQUIRY_LIMITS,
    SERVICE_CHOICES,
    SERVER_FIELD_MAP,
    toInquiryPayload,
    validateInquiry,
    type InquiryFieldErrors,
    type InquiryFormValues,
} from './lib/inquiry';
export { servicePhotoFor, SERVICE_PHOTO, SERVICE_SLOT } from './lib/serviceAssets';
export { slotPhotoFor, SLOT_PHOTO } from './lib/serviceAssets';

export { templateMetadata };

// 컴포넌트 레지스트리 자동 등록
import { Div } from './components/basic/Div';
import { Button } from './components/basic/Button';
import { H2 } from './components/basic/H2';
import { H3 } from './components/basic/H3';
import { H4 } from './components/basic/H4';
import { P } from './components/basic/P';
import { A } from './components/basic/A';
import { Img } from './components/basic/Img';
import { Span } from './components/basic/Span';
import { Details } from './components/basic/Details';
import { Summary } from './components/basic/Summary';
import { Input } from './components/basic/Input';
import { Select } from './components/basic/Select';
import { Textarea } from './components/basic/Textarea';
import { Label } from './components/basic/Label';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ServiceGrid } from './components/ServiceGrid';
import { PackageList } from './components/PackageList';
import { PriceDiscount } from './components/PriceDiscount';
import { FaqList } from './components/FaqList';
import { CaseGallery } from './components/CaseGallery';
import { EstimateCalculator } from './components/EstimateCalculator';
import { InquiryForm } from './components/InquiryForm';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { MobileBar } from './components/MobileBar';
import { TopArrow } from './components/TopArrow';

const registry = (window as any).G7Core?.templateEngine?.ComponentRegistry?.getInstance?.();
if (registry) {
    const meta = (name: string) => ({ name, type: 'basic' as const });
    registry.register({ component: Div, metadata: meta('Div') });
    registry.register({ component: Button, metadata: meta('Button') });
    registry.register({ component: H2, metadata: meta('H2') });
    registry.register({ component: H3, metadata: meta('H3') });
    registry.register({ component: H4, metadata: meta('H4') });
    registry.register({ component: P, metadata: meta('P') });
    registry.register({ component: A, metadata: meta('A') });
    registry.register({ component: Img, metadata: meta('Img') });
    registry.register({ component: Span, metadata: meta('Span') });
    registry.register({ component: Details, metadata: meta('Details') });
    registry.register({ component: Summary, metadata: meta('Summary') });
    registry.register({ component: Input, metadata: meta('Input') });
    registry.register({ component: Select, metadata: meta('Select') });
    registry.register({ component: Textarea, metadata: meta('Textarea') });
    registry.register({ component: Label, metadata: meta('Label') });

    const composite = (name: string) => ({ name, type: 'composite' as const });
    registry.register({ component: Hero, metadata: composite('Hero') });
    registry.register({ component: AboutSection, metadata: composite('AboutSection') });
    registry.register({ component: ServiceGrid, metadata: composite('ServiceGrid') });
    registry.register({ component: PackageList, metadata: composite('PackageList') });
    registry.register({ component: PriceDiscount, metadata: composite('PriceDiscount') });
    registry.register({ component: FaqList, metadata: composite('FaqList') });
    registry.register({ component: CaseGallery, metadata: composite('CaseGallery') });
    registry.register({ component: EstimateCalculator, metadata: composite('EstimateCalculator') });
    registry.register({ component: InquiryForm, metadata: composite('InquiryForm') });
    registry.register({ component: SiteHeader, metadata: composite('SiteHeader') });
    registry.register({ component: SiteFooter, metadata: composite('SiteFooter') });
    registry.register({ component: MobileBar, metadata: composite('MobileBar') });
    registry.register({ component: TopArrow, metadata: composite('TopArrow') });
    logger.log('Registered 15 basic + 13 composite components');
} else {
    logger.warn('ComponentRegistry not available — skipping auto-registration');
}
