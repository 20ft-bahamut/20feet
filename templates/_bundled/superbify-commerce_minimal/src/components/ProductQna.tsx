import React, { useCallback, useEffect, useState } from 'react';
import { Button, Div, H3, Input, Label, P, Select, Span, Textarea } from './basic';
import { Modal } from './Modal';

export interface ProductQnaItem {
    id?: number | string;
    title?: string;
    content?: string;
    category?: string;
    is_secret?: boolean;
    is_owner?: boolean;
    has_reply?: boolean;
    answered?: boolean;
    reply?: { content?: string };
    author_name?: string;
    created_at?: string;
}

export interface ProductQnaBoardSettings {
    secret_mode?: 'disabled' | 'optional' | 'always';
    categories?: string[];
    min_title_length?: number;
    max_title_length?: number;
    min_content_length?: number;
    max_content_length?: number;
}

export interface ProductQnaMeta {
    inquiry_available?: boolean;
    board_settings?: ProductQnaBoardSettings;
    abilities?: { can_update?: boolean; can_reply?: boolean; can_delete?: boolean };
    total?: number;
    current_page?: number;
    per_page?: number;
    last_page?: number;
}

export interface ProductQnaResponse {
    items?: ProductQnaItem[];
    meta?: ProductQnaMeta;
}

export interface ProductQnaProps {
    productCode: string;
    inquiryBoardSlug?: string | null;
    isLoggedIn?: boolean;
    title?: string;
    writeLabel?: string;
    emptyLabel?: string;
    secretContentLabel?: string;
    loginRequiredLabel?: string;
    titleLabel?: string;
    contentLabel?: string;
    categoryLabel?: string;
    secretLabel?: string;
    submitLabel?: string;
    cancelLabel?: string;
    deleteLabel?: string;
    deleteConfirmTitle?: string;
    deleteConfirmMessage?: string;
    answeredLabel?: string;
    pendingLabel?: string;
    sellerReplyLabel?: string;
    className?: string;
}

interface G7CoreLike {
    api?: { getToken?: () => string | null };
    toast?: {
        success?: (msg: string) => void;
        error?: (msg: string) => void;
        info?: (msg: string) => void;
        show?: (msg: string, opts?: { type?: string }) => void;
    };
    modal?: { open?: (id: string) => void; close?: (id: string) => void };
}

function getToken(): string | null {
    try {
        const g7 = (window as unknown as { G7Core?: G7CoreLike }).G7Core;
        const t = g7?.api?.getToken?.();
        return typeof t === 'string' && t.length > 0 ? t : null;
    } catch {
        return null;
    }
}

function showToast(type: 'success' | 'error', message: string): void {
    const g7 = (window as unknown as { G7Core?: G7CoreLike }).G7Core;
    try {
        const fn = g7?.toast?.[type];
        if (typeof fn === 'function') {
            fn(message);
            return;
        }
        if (typeof g7?.toast?.show === 'function') {
            g7.toast.show(message, { type });
            return;
        }
    } catch { /* noop */ }
}

interface WriteFormState {
    open: boolean;
    editingId: number | string | null;
    title: string;
    content: string;
    category: string;
    isSecret: boolean;
    submitting: boolean;
    error: string | null;
}

const EMPTY_WRITE: WriteFormState = {
    open: false,
    editingId: null,
    title: '',
    content: '',
    category: '',
    isSecret: true,
    submitting: false,
    error: null,
};

export function ProductQna(props: ProductQnaProps): React.ReactElement | null {
    const {
        productCode,
        inquiryBoardSlug,
        isLoggedIn,
        title = '상품 Q&A',
        writeLabel = '문의 작성',
        emptyLabel = '등록된 문의가 없습니다.',
        secretContentLabel = '비밀글입니다.',
        loginRequiredLabel = '로그인이 필요합니다.',
        titleLabel = '제목',
        contentLabel = '내용',
        categoryLabel = '카테고리',
        secretLabel = '비밀글',
        submitLabel = '등록',
        cancelLabel = '취소',
        deleteLabel = '삭제',
        deleteConfirmTitle = '문의 삭제',
        deleteConfirmMessage = '이 문의를 삭제하시겠어요?',
        answeredLabel = '답변완료',
        pendingLabel = '답변대기',
        sellerReplyLabel = '판매자 답변',
        className,
    } = props;

    const boardSlug = (inquiryBoardSlug ?? '').toString().trim();
    const hasBoard = boardSlug.length > 0;

    const [data, setData] = useState<ProductQnaResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [writeForm, setWriteForm] = useState<WriteFormState>(EMPTY_WRITE);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | string | null>(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    const fetchQna = useCallback(async () => {
        if (!hasBoard) return;
        setLoading(true);
        // exclude_secret 를 보내지 않는다 — 서버 SSoT 가 요청자 신원 기준으로 비밀글을
        // 마스킹하며(can_view_secret), 작성자 본인 비밀글은 원문과 함께 제공된다.
        // exclude_secret=1 은 작성자 본인 비밀글까지 숨겨 "작성 즉시 소실" 결함을 만든다.
        const url = `/api/modules/sirsoft-ecommerce/products/${encodeURIComponent(productCode)}/inquiries?page=1&per_page=10`;
        const token = getToken();
        try {
            const res = await fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            if (!res.ok) {
                let msg = `HTTP ${res.status}`;
                try {
                    const body = await res.json();
                    msg = body?.errors?.message ?? body?.message ?? msg;
                } catch { /* keep */ }
                showToast('error', msg);
                return;
            }
            const body = await res.json().catch(() => ({}));
            const payload = body?.data ?? body;
            setData(payload as ProductQnaResponse);
        } catch (err) {
            showToast('error', (err as Error)?.message ?? 'Network error');
        } finally {
            setLoading(false);
        }
    }, [hasBoard, productCode]);

    useEffect(() => {
        void fetchQna();
    }, [fetchQna]);

    const openWriteForm = useCallback((item?: ProductQnaItem) => {
        if (!isLoggedIn) {
            showToast('error', loginRequiredLabel);
            // 기본 템플릿 정책: 문의는 회원 전용 — 게스트는 로그인 화면으로 유도한다(복귀 경로 포함).
            try {
                window.location.assign('/login?redirect=' + encodeURIComponent(window.location.pathname));
            } catch { /* noop */ }
            return;
        }
        setWriteForm({
            open: true,
            editingId: item?.id ?? null,
            title: item?.title ?? '',
            content: item?.content ?? '',
            category: item?.category ?? '',
            isSecret: item?.is_secret ?? true,
            submitting: false,
            error: null,
        });
    }, [isLoggedIn, loginRequiredLabel]);

    const closeWriteForm = useCallback(() => {
        setWriteForm((prev) => ({ ...prev, open: false, error: null }));
    }, []);

    const submitWriteForm = useCallback(async () => {
        if (writeForm.submitting) return;
        const boardSettings = data?.meta?.board_settings;
        const minTitle = boardSettings?.min_title_length ?? 2;
        const minContent = boardSettings?.min_content_length ?? 2;
        if (writeForm.title.trim().length < minTitle) {
            setWriteForm((prev) => ({ ...prev, error: `제목은 ${minTitle}자 이상 입력해 주세요.` }));
            return;
        }
        if (writeForm.content.trim().length < minContent) {
            setWriteForm((prev) => ({ ...prev, error: `내용은 ${minContent}자 이상 입력해 주세요.` }));
            return;
        }
        setWriteForm((prev) => ({ ...prev, submitting: true, error: null }));
        const token = getToken();
        if (!token) {
            showToast('error', loginRequiredLabel);
            setWriteForm((prev) => ({ ...prev, submitting: false }));
            return;
        }
        const body = {
            title: writeForm.title,
            content: writeForm.content,
            category: writeForm.category || undefined,
            is_secret: writeForm.isSecret,
        };
        const editingId = writeForm.editingId;
        const url = editingId
            ? `/api/modules/sirsoft-ecommerce/user/inquiries/${encodeURIComponent(String(editingId))}`
            : `/api/modules/sirsoft-ecommerce/products/${encodeURIComponent(productCode)}/inquiries`;
        const method = editingId ? 'PUT' : 'POST';
        try {
            const res = await fetch(url, {
                method,
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            if (res.status === 401) {
                showToast('error', loginRequiredLabel);
                setWriteForm((prev) => ({ ...prev, submitting: false }));
                // 세션 만료 등 — 로그인 화면으로 유도(복귀 경로 포함).
                try {
                    window.location.assign('/login?redirect=' + encodeURIComponent(window.location.pathname));
                } catch { /* noop */ }
                return;
            }
            if (!res.ok) {
                let msg = `HTTP ${res.status}`;
                try {
                    const errBody = await res.json();
                    msg = errBody?.errors?.message ?? errBody?.message ?? msg;
                } catch { /* keep */ }
                setWriteForm((prev) => ({ ...prev, submitting: false, error: msg }));
                return;
            }
            showToast('success', editingId ? '문의가 수정되었습니다.' : '문의가 등록되었습니다.');
            setWriteForm(EMPTY_WRITE);
            await fetchQna();
        } catch (err) {
            setWriteForm((prev) => ({ ...prev, submitting: false, error: (err as Error)?.message ?? 'Network error' }));
        }
    }, [writeForm, productCode, fetchQna, loginRequiredLabel]);

    const handleDelete = useCallback(async () => {
        if (!deleteConfirmId || deleteBusy) return;
        const token = getToken();
        if (!token) {
            showToast('error', loginRequiredLabel);
            setDeleteConfirmId(null);
            return;
        }
        setDeleteBusy(true);
        try {
            const res = await fetch(`/api/modules/sirsoft-ecommerce/user/inquiries/${encodeURIComponent(String(deleteConfirmId))}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                let msg = `HTTP ${res.status}`;
                try {
                    const errBody = await res.json();
                    msg = errBody?.errors?.message ?? errBody?.message ?? msg;
                } catch { /* keep */ }
                showToast('error', msg);
                setDeleteBusy(false);
                return;
            }
            showToast('success', '문의가 삭제되었습니다.');
            setDeleteConfirmId(null);
            setDeleteBusy(false);
            await fetchQna();
        } catch (err) {
            showToast('error', (err as Error)?.message ?? 'Network error');
            setDeleteBusy(false);
        }
    }, [deleteConfirmId, deleteBusy, fetchQna, loginRequiredLabel]);

    // board_slug 없으면 아예 미렌더 (null)
    if (!hasBoard) return null;

    const items = data?.items ?? [];
    const boardSettings = data?.meta?.board_settings ?? {};
    const secretMode = boardSettings.secret_mode ?? 'optional';
    const categories = Array.isArray(boardSettings.categories) ? boardSettings.categories : [];
    const abilities = data?.meta?.abilities ?? {};

    return (
        <Div
            data-testid="product-qna"
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--scm-spacing-md, 1rem)',
                padding: 'var(--scm-spacing-lg, 1.5rem) 0',
                borderTop: '1px solid var(--scm-line, #E4DCCE)',
            }}
        >
            <Div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--scm-spacing-sm, 0.75rem)',
                }}
            >
                <H3
                    style={{
                        fontFamily: 'var(--scm-font-display, system-ui)',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        color: 'var(--scm-text-primary, #26221E)',
                        margin: 0,
                    }}
                >
                    {title}{' '}
                    <Span
                        style={{
                            color: 'var(--scm-text-muted, #8A837B)',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                        }}
                    >
                        ({data?.meta?.total ?? items.length})
                    </Span>
                </H3>
                <Button
                    type="button"
                    onClick={() => openWriteForm()}
                    data-testid="qna-write-button"
                    style={{
                        padding: '0.55rem 1rem',
                        background: 'var(--scm-charcoal, #26221E)',
                        color: 'var(--scm-paper, #FAF8F3)',
                        border: '1px solid var(--scm-charcoal, #26221E)',
                        borderRadius: 'var(--scm-radius-sm, 4px)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--scm-font-body, system-ui)',
                    }}
                >
                    {writeLabel}
                </Button>
            </Div>

            {loading ? (
                <P
                    style={{
                        fontSize: '0.85rem',
                        color: 'var(--scm-text-muted, #8A837B)',
                        margin: 0,
                    }}
                >
                    불러오는 중…
                </P>
            ) : items.length === 0 ? (
                <P
                    data-testid="qna-empty"
                    style={{
                        fontSize: '0.9rem',
                        color: 'var(--scm-text-muted, #8A837B)',
                        margin: 0,
                        padding: 'var(--scm-spacing-md, 1rem)',
                        textAlign: 'center',
                        border: '1px dashed var(--scm-line, #E4DCCE)',
                        borderRadius: 'var(--scm-radius-sm, 4px)',
                    }}
                >
                    {emptyLabel}
                </P>
            ) : (
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                    }}
                >
                    {items.map((item, idx) => {
                        const canSee = !item.is_secret || item.is_owner || !!abilities.can_update;
                        const statusLabel = item.answered || item.has_reply ? answeredLabel : pendingLabel;
                        const statusColor = (item.answered || item.has_reply)
                            ? 'var(--scm-wood, #C9B08D)'
                            : 'var(--scm-text-muted, #8A837B)';
                        return (
                            <Div
                                key={String(item.id ?? idx)}
                                data-testid="qna-card"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.45rem',
                                    padding: 'var(--scm-spacing-md, 1rem)',
                                    border: '1px solid var(--scm-line, #E4DCCE)',
                                    borderRadius: 'var(--scm-radius-sm, 4px)',
                                    background: 'var(--scm-paper, #FAF8F3)',
                                }}
                            >
                                <Div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                                    }}
                                >
                                    <Span
                                        style={{
                                            fontSize: '0.92rem',
                                            fontWeight: 600,
                                            color: 'var(--scm-text-body, #4A4643)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                            flex: 1,
                                            minWidth: 0,
                                        }}
                                    >
                                        {item.is_secret ? (
                                            <span aria-hidden="true" style={{ color: 'var(--scm-text-muted, #8A837B)' }}>🔒</span>
                                        ) : null}
                                        <span style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {item.title ?? '(제목 없음)'}
                                        </span>
                                    </Span>
                                    <Span
                                        style={{
                                            fontSize: '0.72rem',
                                            color: statusColor,
                                            background: 'var(--scm-surface-2, #F4EFE6)',
                                            padding: '0.15rem 0.5rem',
                                            borderRadius: 'var(--scm-radius-sm, 4px)',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {statusLabel}
                                    </Span>
                                </Div>
                                {item.category ? (
                                    <Span
                                        style={{
                                            display: 'inline-block',
                                            fontSize: '0.72rem',
                                            color: 'var(--scm-text-muted, #8A837B)',
                                            background: 'var(--scm-surface-2, #F4EFE6)',
                                            padding: '0.1rem 0.4rem',
                                            borderRadius: 'var(--scm-radius-sm, 4px)',
                                            width: 'fit-content',
                                        }}
                                    >
                                        {item.category}
                                    </Span>
                                ) : null}
                                <P
                                    style={{
                                        fontSize: '0.85rem',
                                        color: 'var(--scm-text-body, #4A4643)',
                                        margin: 0,
                                        lineHeight: 1.6,
                                        whiteSpace: 'pre-line',
                                    }}
                                >
                                    {canSee ? (item.content ?? '') : secretContentLabel}
                                </P>
                                {canSee && item.has_reply && item.reply?.content ? (
                                    <Div
                                        style={{
                                            marginTop: '0.25rem',
                                            padding: 'var(--scm-spacing-sm, 0.75rem)',
                                            background: 'var(--scm-surface-2, #F4EFE6)',
                                            borderRadius: 'var(--scm-radius-sm, 4px)',
                                        }}
                                    >
                                        <Span
                                            style={{
                                                fontSize: '0.78rem',
                                                fontWeight: 600,
                                                color: 'var(--scm-wood-dark, #A8916F)',
                                                display: 'block',
                                                marginBottom: '0.2rem',
                                            }}
                                        >
                                            {sellerReplyLabel}
                                        </Span>
                                        <P
                                            style={{
                                                fontSize: '0.85rem',
                                                color: 'var(--scm-text-body, #4A4643)',
                                                margin: 0,
                                                lineHeight: 1.55,
                                                whiteSpace: 'pre-line',
                                            }}
                                        >
                                            {item.reply.content}
                                        </P>
                                    </Div>
                                ) : null}
                                {item.is_owner ? (
                                    <Div
                                        style={{
                                            display: 'flex',
                                            gap: 'var(--scm-spacing-xs, 0.5rem)',
                                            marginTop: '0.35rem',
                                        }}
                                    >
                                        <Button
                                            type="button"
                                            onClick={() => openWriteForm(item)}
                                            style={{
                                                padding: '0.35rem 0.7rem',
                                                background: 'transparent',
                                                border: '1px solid var(--scm-line, #E4DCCE)',
                                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                                color: 'var(--scm-text-body, #4A4643)',
                                                fontSize: '0.78rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            수정
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => setDeleteConfirmId(item.id ?? null)}
                                            data-testid={`qna-delete-${item.id ?? idx}`}
                                            style={{
                                                padding: '0.35rem 0.7rem',
                                                background: 'transparent',
                                                border: '1px solid var(--scm-error, #B85450)',
                                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                                color: 'var(--scm-error, #B85450)',
                                                fontSize: '0.78rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {deleteLabel}
                                        </Button>
                                    </Div>
                                ) : null}
                            </Div>
                        );
                    })}
                </Div>
            )}

            {/* Write/Edit modal (Modal 컴포지트 활용) */}
            <Modal
                isOpen={writeForm.open}
                onClose={closeWriteForm}
                title={writeForm.editingId ? '문의 수정' : '문의 작성'}
                size="md"
                data-testid="qna-modal"
            >
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-sm, 0.75rem)',
                        padding: 'var(--scm-spacing-md, 1rem)',
                    }}
                >
                    {categories.length > 0 ? (
                        <Div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                            }}
                        >
                            <Label
                                htmlFor="scm-qna-category"
                                style={{ fontSize: '0.78rem', color: 'var(--scm-text-muted, #8A837B)' }}
                            >
                                {categoryLabel}
                            </Label>
                            <Select
                                id="scm-qna-category"
                                name="category"
                                value={writeForm.category}
                                onChange={(e) =>
                                    setWriteForm((prev) => ({ ...prev, category: (e.target as HTMLSelectElement).value }))
                                }
                                style={{
                                    padding: '0.5rem 0.65rem',
                                    border: '1px solid var(--scm-line, #E4DCCE)',
                                    borderRadius: 'var(--scm-radius-sm, 4px)',
                                    background: 'var(--scm-surface, #FAF8F3)',
                                    fontSize: '0.85rem',
                                }}
                            >
                                <option value="">선택 안 함</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </Select>
                        </Div>
                    ) : null}
                    <Div
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                    >
                        <Label
                            htmlFor="scm-qna-title"
                            style={{ fontSize: '0.78rem', color: 'var(--scm-text-muted, #8A837B)' }}
                        >
                            {titleLabel}
                        </Label>
                        <Input
                            id="scm-qna-title"
                            name="title"
                            type="text"
                            value={writeForm.title}
                            maxLength={boardSettings.max_title_length ?? 200}
                            onChange={(e) =>
                                setWriteForm((prev) => ({ ...prev, title: (e.target as HTMLInputElement).value }))
                            }
                            style={{
                                padding: '0.5rem 0.65rem',
                                border: '1px solid var(--scm-line, #E4DCCE)',
                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                background: 'var(--scm-surface, #FAF8F3)',
                                fontSize: '0.85rem',
                            }}
                        />
                    </Div>
                    <Div
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}
                    >
                        <Label
                            htmlFor="scm-qna-content"
                            style={{ fontSize: '0.78rem', color: 'var(--scm-text-muted, #8A837B)' }}
                        >
                            {contentLabel}
                        </Label>
                        <Textarea
                            id="scm-qna-content"
                            name="content"
                            rows={6}
                            value={writeForm.content}
                            maxLength={boardSettings.max_content_length ?? 4000}
                            onChange={(e) =>
                                setWriteForm((prev) => ({ ...prev, content: (e.target as HTMLTextAreaElement).value }))
                            }
                            style={{
                                padding: '0.5rem 0.65rem',
                                border: '1px solid var(--scm-line, #E4DCCE)',
                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                background: 'var(--scm-surface, #FAF8F3)',
                                fontSize: '0.85rem',
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                resize: 'vertical',
                            }}
                        />
                    </Div>
                    {secretMode !== 'disabled' ? (
                        <Label
                            htmlFor="scm-qna-secret"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontSize: '0.82rem',
                                color: 'var(--scm-text-body, #4A4643)',
                            }}
                        >
                            <Input
                                id="scm-qna-secret"
                                name="is_secret"
                                type="checkbox"
                                data-testid="qna-secret-input"
                                checked={writeForm.isSecret}
                                disabled={secretMode === 'always'}
                                onChange={(e) =>
                                    setWriteForm((prev) => ({ ...prev, isSecret: (e.target as HTMLInputElement).checked }))
                                }
                            />
                            {secretLabel}
                        </Label>
                    ) : null}
                    {writeForm.error ? (
                        <P
                            role="alert"
                            style={{
                                fontSize: '0.82rem',
                                color: 'var(--scm-error, #B85450)',
                                margin: 0,
                            }}
                        >
                            {writeForm.error}
                        </P>
                    ) : null}
                    <Div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 'var(--scm-spacing-sm, 0.75rem)',
                            marginTop: 'var(--scm-spacing-xs, 0.5rem)',
                        }}
                    >
                        <Button
                            type="button"
                            onClick={closeWriteForm}
                            disabled={writeForm.submitting}
                            data-testid="qna-modal-cancel"
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: '1px solid var(--scm-line, #E4DCCE)',
                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                color: 'var(--scm-text-body, #4A4643)',
                                fontSize: '0.85rem',
                                cursor: writeForm.submitting ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => { void submitWriteForm(); }}
                            disabled={writeForm.submitting}
                            data-testid="qna-modal-submit"
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--scm-charcoal, #26221E)',
                                color: 'var(--scm-paper, #FAF8F3)',
                                border: '1px solid var(--scm-charcoal, #26221E)',
                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: writeForm.submitting ? 'wait' : 'pointer',
                                opacity: writeForm.submitting ? 0.6 : 1,
                            }}
                        >
                            {writeForm.submitting ? '처리 중…' : submitLabel}
                        </Button>
                    </Div>
                </Div>
            </Modal>

            {/* Delete confirm modal */}
            <Modal
                isOpen={deleteConfirmId != null}
                onClose={() => { if (!deleteBusy) setDeleteConfirmId(null); }}
                title={deleteConfirmTitle}
                size="sm"
            >
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-md, 1rem)',
                        padding: 'var(--scm-spacing-md, 1rem)',
                    }}
                >
                    <P
                        style={{
                            fontSize: '0.9rem',
                            color: 'var(--scm-text-body, #4A4643)',
                            margin: 0,
                        }}
                    >
                        {deleteConfirmMessage}
                    </P>
                    <Div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 'var(--scm-spacing-sm, 0.75rem)',
                        }}
                    >
                        <Button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            disabled={deleteBusy}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'transparent',
                                border: '1px solid var(--scm-line, #E4DCCE)',
                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                color: 'var(--scm-text-body, #4A4643)',
                                fontSize: '0.85rem',
                                cursor: deleteBusy ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => { void handleDelete(); }}
                            disabled={deleteBusy}
                            data-testid="qna-delete-confirm"
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--scm-charcoal, #26221E)',
                                color: 'var(--scm-paper, #FAF8F3)',
                                border: '1px solid var(--scm-charcoal, #26221E)',
                                borderRadius: 'var(--scm-radius-sm, 4px)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: deleteBusy ? 'wait' : 'pointer',
                                opacity: deleteBusy ? 0.6 : 1,
                            }}
                        >
                            {deleteBusy ? '처리 중…' : deleteLabel}
                        </Button>
                    </Div>
                </Div>
            </Modal>
        </Div>
    );
}

export default ProductQna;