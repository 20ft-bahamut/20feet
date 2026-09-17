/**
 * 20ft Studio Gnuboard7 User Template
 *
 * 제작 서비스 · 제작 사례 · 진행 안내 · 이십피트 소개 · 제작 문의
 */

import './styles/design-tokens.css';
import './styles/fonts.css';

const logger = ((window as any).G7Core?.createLogger?.('Template:twentyft-studio')) ?? {
    log: (...args: unknown[]) => console.log('[Template:twentyft-studio]', ...args),
    warn: (...args: unknown[]) => console.warn('[Template:twentyft-studio]', ...args),
    error: (...args: unknown[]) => console.error('[Template:twentyft-studio]', ...args),
};

// Basic HTML wrappers
export {
    A,
    Article,
    Aside,
    Button,
    Div,
    Form,
    Footer,
    H1,
    H2,
    H3,
    H4,
    Header,
    Img,
    Input,
    Label,
    Li,
    Main,
    Nav,
    Ol,
    Option,
    P,
    Section,
    Select,
    Span,
    Textarea,
    Ul,
} from './components/basic';

// Layout primitives
export { Container, type ContainerProps } from './components/Container';

// UI primitives
export { SectionEyebrow, type SectionEyebrowProps } from './components/SectionEyebrow';
export { LoadingRows, type LoadingRowsProps } from './components/LoadingRows';
export { BrandLogo, type BrandLogoProps } from './components/BrandLogo';
export { PrimaryButton, type PrimaryButtonProps } from './components/PrimaryButton';
export { TextLink, type TextLinkProps } from './components/TextLink';
export { Tag, type TagProps } from './components/Tag';
export { ZoomableImage, type ZoomableImageProps } from './components/ZoomableImage';
export { Status, type StatusProps } from './components/Status';

// Shared site chrome
export { SiteHeader, type SiteHeaderProps } from './components/SiteHeader';
export { SiteFooter, type SiteFooterProps } from './components/SiteFooter';

// Home sections
export { HomeHero, type HomeHeroProps } from './components/HomeHero';
export { HomeServices, type HomeServicesProps } from './components/HomeServices';
export { HomeCases, type HomeCasesProps } from './components/HomeCases';
export { HomeExperience, type HomeExperienceProps } from './components/HomeExperience';
export { HomeProcess, type HomeProcessProps } from './components/HomeProcess';
export { HomeFaq, type HomeFaqProps } from './components/HomeFaq';
export { HomeInquiryCTA, type HomeInquiryCTAProps } from './components/HomeInquiryCTA';

// Service pages
export { ServicesList, type ServicesListProps } from './components/ServicesList';
export { ServicePage, type ServicePageProps } from './components/ServicePage';
export { ProcessPage, type ProcessPageProps } from './components/ProcessPage';

// Portfolio
export { PortfolioList, type PortfolioListProps } from './components/PortfolioList';
export { PortfolioDetail, type PortfolioDetailProps } from './components/PortfolioDetail';

// SuperBify
export { SuperBifyList, type SuperBifyListProps } from './components/SuperBifyList';
export { SuperBifyDetail, type SuperBifyDetailProps } from './components/SuperBifyDetail';

// About / Inquiry
export { AboutPage, type AboutPageProps } from './components/AboutPage';
export { InquiryForm, type InquiryFormProps } from './components/InquiryForm';

// Content definitions (used by the components above; exported for reuse/testing)
export { SERVICES, getService } from './content/services';
export type { ServiceDefinition, ServiceKey } from './content/services';
export { INQUIRY_ENDPOINT, INQUIRY_TYPE_OPTIONS, validateInquiryForm, toInquiryPayload } from './content/inquiry';
export { PROCESS_STEPS, FAQ_ITEMS } from './content/process';
export { PRIMARY_NAV, PRIMARY_ACTION, FOOTER_COLUMNS } from './content/nav';

// Template metadata
import templateMetadata from '../template.json';
export { templateMetadata };

// Auto-register with G7 template engine
import {
    A,
    Article,
    Aside,
    Button,
    Div,
    Form,
    Footer,
    H1,
    H2,
    H3,
    H4,
    Header,
    Img,
    Input,
    Label,
    Li,
    Main,
    Nav,
    Ol,
    Option,
    P,
    Section,
    Select,
    Span,
    Textarea,
    Ul,
} from './components/basic';
import { Container } from './components/Container';
import { SectionEyebrow } from './components/SectionEyebrow';
import { LoadingRows } from './components/LoadingRows';
import { BrandLogo } from './components/BrandLogo';
import { PrimaryButton } from './components/PrimaryButton';
import { TextLink } from './components/TextLink';
import { Tag } from './components/Tag';
import { ZoomableImage } from './components/ZoomableImage';
import { Status } from './components/Status';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { HomeHero } from './components/HomeHero';
import { HomeServices } from './components/HomeServices';
import { HomeCases } from './components/HomeCases';
import { HomeExperience } from './components/HomeExperience';
import { HomeProcess } from './components/HomeProcess';
import { HomeFaq } from './components/HomeFaq';
import { HomeInquiryCTA } from './components/HomeInquiryCTA';
import { ServicesList } from './components/ServicesList';
import { ServicePage } from './components/ServicePage';
import { ProcessPage } from './components/ProcessPage';
import { PortfolioList } from './components/PortfolioList';
import { PortfolioDetail } from './components/PortfolioDetail';
import { SuperBifyList } from './components/SuperBifyList';
import { SuperBifyDetail } from './components/SuperBifyDetail';
import { AboutPage } from './components/AboutPage';
import { InquiryForm } from './components/InquiryForm';

const registry = (window as any).G7Core?.templateEngine?.ComponentRegistry?.getInstance?.();
if (registry) {
    // Basic wrappers
    registry.register({ component: A, metadata: { name: 'A', type: 'basic' } });
    registry.register({ component: Article, metadata: { name: 'Article', type: 'basic' } });
    registry.register({ component: Aside, metadata: { name: 'Aside', type: 'basic' } });
    registry.register({ component: Button, metadata: { name: 'Button', type: 'basic' } });
    registry.register({ component: Div, metadata: { name: 'Div', type: 'basic' } });
    registry.register({ component: Form, metadata: { name: 'Form', type: 'basic' } });
    registry.register({ component: Footer, metadata: { name: 'Footer', type: 'basic' } });
    registry.register({ component: H1, metadata: { name: 'H1', type: 'basic' } });
    registry.register({ component: H2, metadata: { name: 'H2', type: 'basic' } });
    registry.register({ component: H3, metadata: { name: 'H3', type: 'basic' } });
    registry.register({ component: H4, metadata: { name: 'H4', type: 'basic' } });
    registry.register({ component: Header, metadata: { name: 'Header', type: 'basic' } });
    registry.register({ component: Img, metadata: { name: 'Img', type: 'basic' } });
    registry.register({ component: Input, metadata: { name: 'Input', type: 'basic' } });
    registry.register({ component: Label, metadata: { name: 'Label', type: 'basic' } });
    registry.register({ component: Li, metadata: { name: 'Li', type: 'basic' } });
    registry.register({ component: Main, metadata: { name: 'Main', type: 'basic' } });
    registry.register({ component: Nav, metadata: { name: 'Nav', type: 'basic' } });
    registry.register({ component: Ol, metadata: { name: 'Ol', type: 'basic' } });
    registry.register({ component: Option, metadata: { name: 'Option', type: 'basic' } });
    registry.register({ component: P, metadata: { name: 'P', type: 'basic' } });
    registry.register({ component: Section, metadata: { name: 'Section', type: 'basic' } });
    registry.register({ component: Select, metadata: { name: 'Select', type: 'basic' } });
    registry.register({ component: Span, metadata: { name: 'Span', type: 'basic' } });
    registry.register({ component: Textarea, metadata: { name: 'Textarea', type: 'basic' } });
    registry.register({ component: Ul, metadata: { name: 'Ul', type: 'basic' } });

    // Layout primitives
    registry.register({ component: Container, metadata: { name: 'Container', type: 'layout' } });

    // Composite components
    registry.register({ component: SectionEyebrow, metadata: { name: 'SectionEyebrow', type: 'composite' } });
    registry.register({ component: LoadingRows, metadata: { name: 'LoadingRows', type: 'composite' } });
    registry.register({ component: BrandLogo, metadata: { name: 'BrandLogo', type: 'composite' } });
    registry.register({ component: PrimaryButton, metadata: { name: 'PrimaryButton', type: 'composite' } });
    registry.register({ component: TextLink, metadata: { name: 'TextLink', type: 'composite' } });
    registry.register({ component: Tag, metadata: { name: 'Tag', type: 'composite' } });
    registry.register({ component: ZoomableImage, metadata: { name: 'ZoomableImage', type: 'composite' } });
    registry.register({ component: Status, metadata: { name: 'Status', type: 'composite' } });
    registry.register({ component: SiteHeader, metadata: { name: 'SiteHeader', type: 'composite' } });
    registry.register({ component: SiteFooter, metadata: { name: 'SiteFooter', type: 'composite' } });
    registry.register({ component: HomeHero, metadata: { name: 'HomeHero', type: 'composite' } });
    registry.register({ component: HomeServices, metadata: { name: 'HomeServices', type: 'composite' } });
    registry.register({ component: HomeCases, metadata: { name: 'HomeCases', type: 'composite' } });
    registry.register({ component: HomeExperience, metadata: { name: 'HomeExperience', type: 'composite' } });
    registry.register({ component: HomeProcess, metadata: { name: 'HomeProcess', type: 'composite' } });
    registry.register({ component: HomeFaq, metadata: { name: 'HomeFaq', type: 'composite' } });
    registry.register({ component: HomeInquiryCTA, metadata: { name: 'HomeInquiryCTA', type: 'composite' } });
    registry.register({ component: ServicesList, metadata: { name: 'ServicesList', type: 'composite' } });
    registry.register({ component: ServicePage, metadata: { name: 'ServicePage', type: 'composite' } });
    registry.register({ component: ProcessPage, metadata: { name: 'ProcessPage', type: 'composite' } });
    registry.register({ component: PortfolioList, metadata: { name: 'PortfolioList', type: 'composite' } });
    registry.register({ component: PortfolioDetail, metadata: { name: 'PortfolioDetail', type: 'composite' } });
    registry.register({ component: SuperBifyList, metadata: { name: 'SuperBifyList', type: 'composite' } });
    registry.register({ component: SuperBifyDetail, metadata: { name: 'SuperBifyDetail', type: 'composite' } });
    registry.register({ component: AboutPage, metadata: { name: 'AboutPage', type: 'composite' } });
    registry.register({ component: InquiryForm, metadata: { name: 'InquiryForm', type: 'composite' } });
    logger.log('Registered 20ft Studio components');
} else {
    logger.warn('ComponentRegistry not available — skipping auto-registration');
}
