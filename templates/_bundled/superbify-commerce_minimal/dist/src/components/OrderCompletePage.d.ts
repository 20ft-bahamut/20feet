import { default as React } from 'react';
export interface OrderCompleteOrderData {
    order_number?: string;
    total_amount_formatted?: string;
    mc_total_amount?: Record<string, {
        formatted?: string;
    }>;
    subtotal_amount_formatted?: string;
    total_shipping_amount?: number | string;
    total_shipping_amount_formatted?: string;
    total_discount_amount_formatted?: string;
    order_status?: string;
    shipping_address?: {
        recipient_name?: string;
        recipient_phone?: string;
        recipient_country_code?: string;
        zipcode?: string;
        address?: string;
        address_detail?: string;
        city?: string;
        state?: string;
    };
    payment?: {
        payment_method?: string;
        depositor_name?: string;
        deposit_due_at_formatted?: string;
        dbank_name?: string;
        dbank_account?: string;
        dbank_holder?: string;
        vbank_name?: string;
        vbank_number?: string;
        vbank_holder?: string;
        vbank_due_at_formatted?: string;
    };
    options?: Array<{
        product_name?: string | Record<string, string>;
        product_option_name?: string | Record<string, string>;
        option_snapshot?: {
            option_name?: string | Record<string, string>;
        };
        thumbnail_url?: string | null;
        quantity?: number;
        unit_price_formatted?: string;
        subtotal_price_formatted?: string;
    }>;
    orderer_email?: string;
}
export interface OrderCompletePageProps {
    orderData?: {
        data?: OrderCompleteOrderData | null;
        loading?: boolean;
        error?: unknown;
    } | null;
    isLoggedIn?: boolean;
    shopBase?: string;
    title?: string;
    successMessage?: string;
    bankDepositMessage?: string;
    bankDepositInfoTitle?: string;
    depositBankLabel?: string;
    depositAccountLabel?: string;
    depositHolderLabel?: string;
    depositorNameLabel?: string;
    depositAmountLabel?: string;
    depositDueLabel?: string;
    vbankNotice?: string;
    guestNoticeTitle?: string;
    guestNoticeLookup?: string;
    guestNoticeSave?: string;
    guestEmailSent?: string;
    orderNumberLabel?: string;
    orderedItemsLabel?: string;
    shippingAddressLabel?: string;
    subtotalLabel?: string;
    shippingFeeLabel?: string;
    discountLabel?: string;
    totalLabel?: string;
    viewDetailLabel?: string;
    continueShoppingLabel?: string;
    loadingLabel?: string;
    errorTitle?: string;
}
export declare function OrderCompletePage(props: OrderCompletePageProps): React.ReactElement;
export default OrderCompletePage;
