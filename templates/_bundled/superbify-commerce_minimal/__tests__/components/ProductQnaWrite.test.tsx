/**
 * ProductQna 작성 플로우 회귀 (2026-09-01 리팩토링)
 *
 * 결함: fetchQna 가 exclude_secret=1 로 조회해 작성자 본인 비밀글도 목록에서
 * 숨겨 "작성 즉시 소실" 증상을 만들었다(서버 SSoT 는 요청자 신원 기준 마스킹).
 * 본 테스트는 (1) 목록 요청에 exclude_secret 파라미터가 없고,
 * (2) 본인 비밀글 행이 잠금 표시와 함께 렌더되며 (3) 게스트 작성 클릭 시
 * /login?redirect= 로 유도되는 계약을 고정한다.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ProductQna } from '../../src/components/ProductQna';
import type { ProductQnaResponse } from '../../src/components/ProductQna';

const makeResponse = (items: unknown[]): ProductQnaResponse => ({
    items,
    meta: {
        board_settings: { min_title_length: 2, min_content_length: 2 },
        inquiry_available: true,
        total: items.length,
        current_page: 1,
        per_page: 10,
        last_page: 1,
    },
} as unknown as ProductQnaResponse);

describe('ProductQna write contract', () => {
    const originalLocation = window.location;
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ data: makeResponse([]) }),
        });
        (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
        (globalThis as unknown as { G7Core?: unknown }).G7Core = {
            api: { getToken: () => 'qa-token' },
        };
        (window as unknown as { location: unknown }).location = {
            ...originalLocation,
            assign: vi.fn(),
            pathname: '/shop/products/QAE2ESTOCKTEST001',
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
        (window as unknown as { location: unknown }).location = originalLocation;
    });

    it('list request does NOT send exclude_secret (server SSoT identity masking)', async () => {
        render(<ProductQna productCode="QAE2ESTOCKTEST001" inquiryBoardSlug="store-inquiry" isLoggedIn />);
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const url = String(fetchMock.mock.calls[0][0]);
        expect(url).toContain('/products/QAE2ESTOCKTEST001/inquiries');
        expect(url).not.toContain('exclude_secret');
    });

    it('renders the author\'s own secret inquiry row (is_secret=true masked)', async () => {
        fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                data: makeResponse([
                    {
                        id: 9,
                        title: '비밀 QA 문의',
                        content: '비밀글 작성 테스트입니다.',
                        is_secret: true,
                        is_owner: true,
                        is_answered: false,
                    },
                ]),
            }),
        });
        (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
        render(<ProductQna productCode="QAE2ESTOCKTEST001" inquiryBoardSlug="store-inquiry" isLoggedIn />);
        await waitFor(() => expect(screen.getByTestId('qna-card')).toBeTruthy());
        expect(screen.getByText('🔒')).toBeTruthy();
    });

    it('guest clicking write redirects to /login?redirect=<pathname>', () => {
        render(<ProductQna productCode="QAE2ESTOCKTEST001" inquiryBoardSlug="store-inquiry" isLoggedIn={false} />);
        const assign = vi.fn();
        (window as unknown as { location: unknown }).location = {
            ...originalLocation,
            pathname: '/shop/products/QAE2ESTOCKTEST001',
            assign,
        };
        fireEvent.click(screen.getByTestId('qna-write-button'));
        expect(assign).toHaveBeenCalledWith('/login?redirect=%2Fshop%2Fproducts%2FQAE2ESTOCKTEST001');
    });
});
