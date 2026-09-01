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
    Dd,
    Div,
    Dl,
    Dt,
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
    Table,
    Td,
    Textarea,
    Th,
    Tr,
    Ul,
} from './components/basic';

// Layout primitives
export { Container, type ContainerProps } from './components/Container';

// Composite page components
export { AddToCartPanel, type AddToCartPanelProps } from './components/AddToCartPanel';
export { Badge, type BadgeProps, type BadgeTone } from './components/Badge';
export { BrandStorySection, type BrandStorySectionProps } from './components/BrandStorySection';
export {
    CheckoutForm,
    type CheckoutFormProps,
    type CheckoutPaymentMethod,
    type CheckoutItem,
    type CheckoutFormCheckoutPayload,
    type CheckoutSubmitPayload,
} from './components/CheckoutForm';
export {
    CheckoutPage,
    type CheckoutPageProps,
    type CheckoutPageCheckoutData,
    type CheckoutPageSettings,
} from './components/CheckoutPage';
export {
    OrderCompletePage,
    type OrderCompletePageProps,
    type OrderCompleteOrderData,
} from './components/OrderCompletePage';
export { PolicyPage, type PolicyPageProps } from './components/PolicyPage';
export {
    PurchasePanel,
    type PurchasePanelProps,
    type PurchasePanelDispatchDetail,
    type PurchasePanelItem,
    type PurchasePanelAdditionalSelection,
    type PurchasePanelProductData,
    type PurchasePanelOptionGroup,
    type PurchasePanelOption,
    type PurchasePanelAdditionalOption,
    type PurchasePanelAdditionalValue,
    type PurchasePanelOptionValue,
} from './components/PurchasePanel';
export {
    WishlistHeart,
    type WishlistHeartProps,
} from './components/WishlistHeart';
export {
    ProductReviews,
    type ProductReviewsProps,
    type ProductReviewsResponse,
    type ProductReview,
    type ProductReviewImage,
    type ProductReviewOptionSnapshot,
} from './components/ProductReviews';
export {
    ProductQna,
    type ProductQnaProps,
    type ProductQnaItem,
    type ProductQnaResponse,
    type ProductQnaMeta,
    type ProductQnaBoardSettings,
} from './components/ProductQna';
export {
    CouponDownloadBadges,
    type CouponDownloadBadgesProps,
    type CouponDownloadBadgesCoupon,
} from './components/CouponDownloadBadges';
export {
    ProductCommonInfo,
    type ProductCommonInfoProps,
    type ProductCommonInfoData,
    type ProductNoticeData,
    type ProductNoticeItem,
} from './components/ProductCommonInfo';

// Business information single edit point (config/business-info.json)
export {
    businessInfo,
    businessFields,
    hasBusinessInfo,
    getPolicyDocument,
    localText,
    resolveTemplateLocale,
    POLICY_ROUTES,
    type BusinessField,
    type BusinessInfo,
    type LocalizedText,
    type PolicyDocument,
    type PolicyDocumentKey,
    type PolicySection,
    type ShopInfo,
    type TemplateLocale,
} from './config/businessInfo';
export { CartItemRow, type CartItemRowItem, type CartItemRowProps } from './components/CartItemRow';
export { CartSummary, type CartSummaryCalc, type CartSummaryProps } from './components/CartSummary';
export { CategoryCard, type CategoryCardProps } from './components/CategoryCard';
export { CategoryNav, type CategoryNavProps } from './components/CategoryNav';
export { CategoryPreviewStrip, type CategoryPreviewStripProps } from './components/CategoryPreviewStrip';
export { ConfirmDialog, type ConfirmDialogProps } from './components/ConfirmDialog';
export { Modal, type ModalProps } from './components/Modal';
export { CrossSellStrip, type CrossSellStripProps } from './components/CrossSellStrip';
export { EditorialBanner, type EditorialBannerProps } from './components/EditorialBanner';
export { EmptyState, type EmptyStateProps } from './components/EmptyState';
export { HeroBanner, type HeroBannerProps } from './components/HeroBanner';
export { HtmlContent, type HtmlContentProps } from './components/HtmlContent';
export { NoticeList, type NoticeListProps } from './components/NoticeList';
export { Pagination, type PaginationProps } from './components/Pagination';
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
    Dd,
    Div,
    Dl,
    Dt,
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
    Table,
    Td,
    Textarea,
    Th,
    Tr,
    Ul,
} from './components/basic';
import { Container } from './components/Container';
import { AddToCartPanel } from './components/AddToCartPanel';
import { Badge } from './components/Badge';
import { BrandStorySection } from './components/BrandStorySection';
import { CartItemRow } from './components/CartItemRow';
import { CheckoutForm } from './components/CheckoutForm';
import { CheckoutPage } from './components/CheckoutPage';
import { OrderCompletePage } from './components/OrderCompletePage';
import { PolicyPage } from './components/PolicyPage';
import { PurchasePanel } from './components/PurchasePanel';
import { WishlistHeart } from './components/WishlistHeart';
import { ProductReviews } from './components/ProductReviews';
import { ProductQna } from './components/ProductQna';
import { CouponDownloadBadges } from './components/CouponDownloadBadges';
import { ProductCommonInfo } from './components/ProductCommonInfo';
import { CartSummary } from './components/CartSummary';
import { CategoryCard } from './components/CategoryCard';
import { CategoryNav } from './components/CategoryNav';
import { CategoryPreviewStrip } from './components/CategoryPreviewStrip';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Modal } from './components/Modal';
import { CrossSellStrip } from './components/CrossSellStrip';
import { EditorialBanner } from './components/EditorialBanner';
import { EmptyState } from './components/EmptyState';
import { HeroBanner } from './components/HeroBanner';
import { HtmlContent } from './components/HtmlContent';
import { NoticeList } from './components/NoticeList';
import { Pagination } from './components/Pagination';
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
    registry.register({ component: Dd, metadata: { name: 'Dd', type: 'basic' } });
    registry.register({ component: Div, metadata: { name: 'Div', type: 'basic' } });
    registry.register({ component: Dl, metadata: { name: 'Dl', type: 'basic' } });
    registry.register({ component: Dt, metadata: { name: 'Dt', type: 'basic' } });
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
    registry.register({ component: Table, metadata: { name: 'Table', type: 'basic' } });
    registry.register({ component: Td, metadata: { name: 'Td', type: 'basic' } });
    registry.register({ component: Textarea, metadata: { name: 'Textarea', type: 'basic' } });
    registry.register({ component: Th, metadata: { name: 'Th', type: 'basic' } });
    registry.register({ component: Tr, metadata: { name: 'Tr', type: 'basic' } });
    registry.register({ component: Ul, metadata: { name: 'Ul', type: 'basic' } });

    // Layout primitive
    registry.register({ component: Container, metadata: { name: 'Container', type: 'layout' } });

    // Composite components
    registry.register({ component: AddToCartPanel, metadata: { name: 'AddToCartPanel', type: 'composite' } });
    registry.register({ component: Badge, metadata: { name: 'Badge', type: 'composite' } });
    registry.register({ component: BrandStorySection, metadata: { name: 'BrandStorySection', type: 'composite' } });
    registry.register({ component: CartItemRow, metadata: { name: 'CartItemRow', type: 'composite' } });
    registry.register({ component: CheckoutForm, metadata: { name: 'CheckoutForm', type: 'composite' } });
    registry.register({ component: CheckoutPage, metadata: { name: 'CheckoutPage', type: 'composite' } });
    registry.register({ component: OrderCompletePage, metadata: { name: 'OrderCompletePage', type: 'composite' } });
    registry.register({ component: PolicyPage, metadata: { name: 'PolicyPage', type: 'composite' } });
    registry.register({ component: PurchasePanel, metadata: { name: 'PurchasePanel', type: 'composite' } });
    registry.register({ component: WishlistHeart, metadata: { name: 'WishlistHeart', type: 'composite' } });
    registry.register({ component: ProductReviews, metadata: { name: 'ProductReviews', type: 'composite' } });
    registry.register({ component: ProductQna, metadata: { name: 'ProductQna', type: 'composite' } });
    registry.register({ component: CouponDownloadBadges, metadata: { name: 'CouponDownloadBadges', type: 'composite' } });
    registry.register({ component: ProductCommonInfo, metadata: { name: 'ProductCommonInfo', type: 'composite' } });
    registry.register({ component: CartSummary, metadata: { name: 'CartSummary', type: 'composite' } });
    registry.register({ component: CategoryCard, metadata: { name: 'CategoryCard', type: 'composite' } });
    registry.register({ component: CategoryNav, metadata: { name: 'CategoryNav', type: 'composite' } });
    registry.register({ component: CategoryPreviewStrip, metadata: { name: 'CategoryPreviewStrip', type: 'composite' } });
    registry.register({ component: ConfirmDialog, metadata: { name: 'ConfirmDialog', type: 'composite' } });
    registry.register({ component: Modal, metadata: { name: 'Modal', type: 'composite' } });
    registry.register({ component: CrossSellStrip, metadata: { name: 'CrossSellStrip', type: 'composite' } });
    registry.register({ component: EditorialBanner, metadata: { name: 'EditorialBanner', type: 'composite' } });
    registry.register({ component: EmptyState, metadata: { name: 'EmptyState', type: 'composite' } });
    registry.register({ component: HeroBanner, metadata: { name: 'HeroBanner', type: 'composite' } });
    registry.register({ component: HtmlContent, metadata: { name: 'HtmlContent', type: 'composite' } });
    registry.register({ component: Pagination, metadata: { name: 'Pagination', type: 'composite' } });
    registry.register({ component: NoticeList, metadata: { name: 'NoticeList', type: 'composite' } });
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
