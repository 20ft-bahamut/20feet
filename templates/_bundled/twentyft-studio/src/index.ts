/**
 * 20ft Studio Gnuboard7 User Template
 *
 * Portfolio / SuperBify / Project Inquiry
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
export { Status, type StatusProps } from './components/Status';

// Composite page components
export { SiteHeader, type SiteHeaderProps } from './components/SiteHeader';
export { SiteFooter, type SiteFooterProps } from './components/SiteFooter';
export { HomeHero, type HomeHeroProps } from './components/HomeHero';
export { HomeWhatWeBuild, type HomeWhatWeBuildProps } from './components/HomeWhatWeBuild';
export { HomeHowWeWork, type HomeHowWeWorkProps } from './components/HomeHowWeWork';
export { SelectedPortfolio, type SelectedPortfolioProps } from './components/SelectedPortfolio';
export { SuperBifyPreview, type SuperBifyPreviewProps } from './components/SuperBifyPreview';
export { AboutPreview, type AboutPreviewProps } from './components/AboutPreview';
export { InquiryMottoCTA, type InquiryMottoCTAProps } from './components/InquiryMottoCTA';
export { PortfolioList, type PortfolioListProps } from './components/PortfolioList';
export { PortfolioDetail, type PortfolioDetailProps } from './components/PortfolioDetail';
export { SuperBifyList, type SuperBifyListProps } from './components/SuperBifyList';
export { SuperBifyDetail, type SuperBifyDetailProps } from './components/SuperBifyDetail';
export { InquiryForm, type InquiryFormProps } from './components/InquiryForm';
export { AboutPage, type AboutPageProps } from './components/AboutPage';

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
import { Status } from './components/Status';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';
import { HomeHero } from './components/HomeHero';
import { HomeWhatWeBuild } from './components/HomeWhatWeBuild';
import { HomeHowWeWork } from './components/HomeHowWeWork';
import { SelectedPortfolio } from './components/SelectedPortfolio';
import { SuperBifyPreview } from './components/SuperBifyPreview';
import { AboutPreview } from './components/AboutPreview';
import { InquiryMottoCTA } from './components/InquiryMottoCTA';
import { PortfolioList } from './components/PortfolioList';
import { PortfolioDetail } from './components/PortfolioDetail';
import { SuperBifyList } from './components/SuperBifyList';
import { SuperBifyDetail } from './components/SuperBifyDetail';
import { InquiryForm } from './components/InquiryForm';
import { AboutPage } from './components/AboutPage';

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
    registry.register({ component: Status, metadata: { name: 'Status', type: 'composite' } });
    registry.register({ component: SiteHeader, metadata: { name: 'SiteHeader', type: 'composite' } });
    registry.register({ component: SiteFooter, metadata: { name: 'SiteFooter', type: 'composite' } });
    registry.register({ component: HomeHero, metadata: { name: 'HomeHero', type: 'composite' } });
    registry.register({ component: HomeWhatWeBuild, metadata: { name: 'HomeWhatWeBuild', type: 'composite' } });
    registry.register({ component: HomeHowWeWork, metadata: { name: 'HomeHowWeWork', type: 'composite' } });
    registry.register({ component: SelectedPortfolio, metadata: { name: 'SelectedPortfolio', type: 'composite' } });
    registry.register({ component: SuperBifyPreview, metadata: { name: 'SuperBifyPreview', type: 'composite' } });
    registry.register({ component: AboutPreview, metadata: { name: 'AboutPreview', type: 'composite' } });
    registry.register({ component: InquiryMottoCTA, metadata: { name: 'InquiryMottoCTA', type: 'composite' } });
    registry.register({ component: PortfolioList, metadata: { name: 'PortfolioList', type: 'composite' } });
    registry.register({ component: PortfolioDetail, metadata: { name: 'PortfolioDetail', type: 'composite' } });
    registry.register({ component: SuperBifyList, metadata: { name: 'SuperBifyList', type: 'composite' } });
    registry.register({ component: SuperBifyDetail, metadata: { name: 'SuperBifyDetail', type: 'composite' } });
    registry.register({ component: InquiryForm, metadata: { name: 'InquiryForm', type: 'composite' } });
    registry.register({ component: AboutPage, metadata: { name: 'AboutPage', type: 'composite' } });
    logger.log('Registered 20ft Studio components');
} else {
    logger.warn('ComponentRegistry not available — skipping auto-registration');
}
