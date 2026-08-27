/**
 * SuperBify Commerce Minimal — Gnuboard7 User Template
 *
 * Demo D2C store built on sirsoft-ecommerce public API.
 * Auto-registers every basic wrapper, layout primitive, and composite
 * component with the G7 template engine (`window.G7Core.templateEngine`).
 */

import './styles/design-tokens.css';

const logger = ((window as any).G7Core?.createLogger?.('Template:superbify-commerce_minimal')) ?? {
    log: (...args: unknown[]) => console.log('[Template:superbify-commerce_minimal]', ...args),
    warn: (...args: unknown[]) => console.warn('[Template:superbify-commerce_minimal]', ...args),
    error: (...args: unknown[]) => console.error('[Template:superbify-commerce_minimal]', ...args),
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

// Composite page components
export { Badge, type BadgeProps, type BadgeTone } from './components/Badge';
export { BrandStorySection, type BrandStorySectionProps } from './components/BrandStorySection';
export { CategoryCard, type CategoryCardProps } from './components/CategoryCard';
export { CategoryNav, type CategoryNavProps } from './components/CategoryNav';
export { EmptyState, type EmptyStateProps } from './components/EmptyState';
export { HeroBanner, type HeroBannerProps } from './components/HeroBanner';
export { Price, type PriceProps } from './components/Price';
export { ProductCard, type ProductCardProps } from './components/ProductCard';
export { ProductGallery, type ProductGalleryProps, type ProductGalleryImage } from './components/ProductGallery';
export { ProductGrid, type ProductGridProps } from './components/ProductGrid';
export { PromoBanner, type PromoBannerProps } from './components/PromoBanner';
export { RelatedProducts, type RelatedProductsProps } from './components/RelatedProducts';
export { StoreFooter, type StoreFooterProps } from './components/StoreFooter';
export { StoreHeader, type StoreHeaderProps } from './components/StoreHeader';

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
import { Badge } from './components/Badge';
import { BrandStorySection } from './components/BrandStorySection';
import { CategoryCard } from './components/CategoryCard';
import { CategoryNav } from './components/CategoryNav';
import { EmptyState } from './components/EmptyState';
import { HeroBanner } from './components/HeroBanner';
import { Price } from './components/Price';
import { ProductCard } from './components/ProductCard';
import { ProductGallery } from './components/ProductGallery';
import { ProductGrid } from './components/ProductGrid';
import { PromoBanner } from './components/PromoBanner';
import { RelatedProducts } from './components/RelatedProducts';
import { StoreFooter } from './components/StoreFooter';
import { StoreHeader } from './components/StoreHeader';

// Custom action handlers (sirsoft-basic 패턴 단순화 포크)
import { handlerMap } from './handlers/storageHandlers';

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

    // Layout primitive
    registry.register({ component: Container, metadata: { name: 'Container', type: 'layout' } });

    // Composite components
    registry.register({ component: Badge, metadata: { name: 'Badge', type: 'composite' } });
    registry.register({ component: BrandStorySection, metadata: { name: 'BrandStorySection', type: 'composite' } });
    registry.register({ component: CategoryCard, metadata: { name: 'CategoryCard', type: 'composite' } });
    registry.register({ component: CategoryNav, metadata: { name: 'CategoryNav', type: 'composite' } });
    registry.register({ component: EmptyState, metadata: { name: 'EmptyState', type: 'composite' } });
    registry.register({ component: HeroBanner, metadata: { name: 'HeroBanner', type: 'composite' } });
    registry.register({ component: Price, metadata: { name: 'Price', type: 'composite' } });
    registry.register({ component: ProductCard, metadata: { name: 'ProductCard', type: 'composite' } });
    registry.register({ component: ProductGallery, metadata: { name: 'ProductGallery', type: 'composite' } });
    registry.register({ component: ProductGrid, metadata: { name: 'ProductGrid', type: 'composite' } });
    registry.register({ component: PromoBanner, metadata: { name: 'PromoBanner', type: 'composite' } });
    registry.register({ component: RelatedProducts, metadata: { name: 'RelatedProducts', type: 'composite' } });
    registry.register({ component: StoreFooter, metadata: { name: 'StoreFooter', type: 'composite' } });
    registry.register({ component: StoreHeader, metadata: { name: 'StoreHeader', type: 'composite' } });

    logger.log('Registered SuperBify Commerce Minimal components');
} else {
    logger.warn('ComponentRegistry not available — skipping auto-registration');
}

// Custom handler registration (initCartKey 등)
// G7Core 가 로드되기 전 모듈이 평가될 수 있으므로, window.load 이후 폴링으로
// ActionDispatcher 가 잡힐 때마다 핸들러를 등록한다. sirsoft-basic 패턴 단순화 포크.
if (typeof window !== 'undefined') {
    (window as any).G7TemplateHandlers = handlerMap;

    const registerHandlers = () => {
        const actionDispatcher = (window as any).G7Core?.getActionDispatcher?.();
        if (actionDispatcher && typeof actionDispatcher.registerHandler === 'function') {
            Object.entries(handlerMap).forEach(([name, handler]) => {
                actionDispatcher.registerHandler(name, handler);
            });
            logger.log(`Registered ${Object.keys(handlerMap).length} custom handler(s):`, Object.keys(handlerMap));
            return true;
        }
        return false;
    };

    let retries = 0;
    const maxRetries = 50;
    const tryRegister = () => {
        if (registerHandlers()) return;
        retries += 1;
        if (retries <= maxRetries) {
            setTimeout(tryRegister, 100);
        } else {
            logger.error('ActionDispatcher not available after maximum retries');
        }
    };

    if (document.readyState === 'complete') {
        tryRegister();
    } else {
        window.addEventListener('load', tryRegister);
    }
}
