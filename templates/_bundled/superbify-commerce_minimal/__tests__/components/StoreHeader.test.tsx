import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { StoreHeader } from '../../src/components/StoreHeader';

describe('StoreHeader', () => {
    it('renders the brand name and tagline', () => {
        render(<StoreHeader brandName="Still Form" tagline="Quiet objects" />);
        expect(screen.getByText('Still Form')).toBeInTheDocument();
        expect(screen.getByText('Quiet objects')).toBeInTheDocument();
    });

    it('renders nav links', () => {
        render(<StoreHeader />);
        expect(screen.getByTestId('nav-shop')).toBeInTheDocument();
        expect(screen.getByTestId('nav-story')).toBeInTheDocument();
        expect(screen.getByTestId('nav-notice')).toBeInTheDocument();
        expect(screen.getByTestId('nav-cart')).toBeInTheDocument();
    });

    it('hides the cart badge when cartCount is undefined', () => {
        render(<StoreHeader cartCount={undefined} />);
        expect(screen.queryByTestId('cart-count')).not.toBeInTheDocument();
    });

    it('shows the cart badge when cartCount is provided', () => {
        render(<StoreHeader cartCount={3} />);
        expect(screen.getByTestId('cart-count')).toHaveTextContent('3');
    });

    it('shows 99+ when cartCount is over 99', () => {
        render(<StoreHeader cartCount={120} />);
        expect(screen.getByTestId('cart-count')).toHaveTextContent('99+');
    });

    describe('auth state', () => {
        const dispatchAction = vi.fn();

        beforeEach(() => {
            (window as any).G7Core = {
                getActionDispatcher: () => ({ dispatchAction }),
            };
        });

        afterEach(() => {
            delete (window as any).G7Core;
            cleanup();
            vi.clearAllMocks();
        });

        it('renders login + signup links and no member items when logged out', () => {
            render(<StoreHeader />);
            const login = screen.getByTestId('nav-login');
            const signup = screen.getByTestId('nav-signup');
            expect(login).toHaveAttribute('href', '/login');
            expect(signup).toHaveAttribute('href', '/register');
            expect(screen.queryByTestId('nav-mypage')).not.toBeInTheDocument();
            expect(screen.queryByTestId('nav-user-name')).not.toBeInTheDocument();
            expect(screen.queryByTestId('nav-logout')).not.toBeInTheDocument();
        });

        it('treats an empty-string user as logged out', () => {
            render(<StoreHeader user="" />);
            expect(screen.getByTestId('nav-login')).toBeInTheDocument();
            expect(screen.getByTestId('nav-signup')).toBeInTheDocument();
            expect(screen.queryByTestId('nav-logout')).not.toBeInTheDocument();
        });

        it('renders user name + mypage + logout and no auth links when logged in', () => {
            render(
                <StoreHeader
                    user="홍길동"
                    loginLabel="로그인"
                    signupLabel="회원가입"
                    mypageLabel="마이페이지"
                    logoutLabel="로그아웃"
                />,
            );
            expect(screen.getByTestId('nav-user-name')).toHaveTextContent('홍길동');
            const mypage = screen.getByTestId('nav-mypage');
            expect(mypage).toHaveAttribute('href', '/mypage');
            expect(mypage).toHaveTextContent('마이페이지');
            expect(screen.getByTestId('nav-logout')).toHaveTextContent('로그아웃');
            expect(screen.queryByTestId('nav-login')).not.toBeInTheDocument();
            expect(screen.queryByTestId('nav-signup')).not.toBeInTheDocument();
        });

        it('passes auth labels through when logged out', () => {
            render(<StoreHeader loginLabel="로그인" signupLabel="회원가입" />);
            expect(screen.getByTestId('nav-login')).toHaveTextContent('로그인');
            expect(screen.getByTestId('nav-signup')).toHaveTextContent('회원가입');
        });

        it('logout click dispatches the engine action sequence (no direct fetch)', () => {
            render(<StoreHeader user="홍길동" logoutLabel="로그아웃" />);
            fireEvent.click(screen.getByTestId('nav-logout'));
            expect(dispatchAction).toHaveBeenCalledTimes(1);
            expect(dispatchAction).toHaveBeenCalledWith({
                handler: 'sequence',
                actions: [
                    { handler: 'logout', target: 'user' },
                    { handler: 'refetchDataSource', params: { dataSourceId: 'cart_count' } },
                    { handler: 'navigate', params: { path: '/' } },
                ],
            });
        });

        it('logout click is a tolerant no-op when the dispatcher is unavailable', () => {
            (window as any).G7Core = {};
            render(<StoreHeader user="홍길동" />);
            expect(() => fireEvent.click(screen.getByTestId('nav-logout'))).not.toThrow();
            expect(dispatchAction).not.toHaveBeenCalled();
        });
    });
});