import React from 'react';
import { createPortal } from 'react-dom';
import { A, Button, Img } from './basic';

export interface ZoomableImageProps {
    src: string;
    /** 이미지 설명. 확대 화면에서도 같은 설명을 쓴다. */
    alt: string;
    /** 목록·상세에서 보이는 크기. 확대 화면은 이 값을 쓰지 않는다. */
    style?: React.CSSProperties;
    /** 확대 화면에서 쓸 원본 주소. 없으면 src 를 그대로 쓴다. */
    fullSrc?: string;
    /** 확대 화면 설명 문구. 기본은 alt */
    caption?: string;
    loading?: 'lazy' | 'eager';
    testId?: string;
}

/**
 * 눌러서 크게 보는 이미지.
 *
 * 사례 화면은 업무 UI 가 작게 들어가 있어 상세에서도 읽기 어렵다. 이미지 자체를
 * 키우는 대신, 누르면 원본 크기로 여는 경로를 둔다.
 *
 * 구조를 세 층으로 나눈 데는 이유가 있다.
 *   ① 배경(overlay)  — 화면 고정. 스크롤하지 않는다.
 *   ② 이미지 영역     — 여기만 스크롤한다. 안쪽 래퍼가 `margin: auto` 로 정렬한다.
 *   ③ 조작 줄         — ② 바깥에 둔다. 이미지를 옆으로 밀어도 닫기 버튼이 화면에 남는다.
 *
 * `justify-content: center` 로 가운데 정렬하면 이미지가 영역보다 클 때 시작점이
 * 음수로 밀려 왼쪽·위쪽 일부에 스크롤로도 닿을 수 없다. `margin: auto` 는
 * 들어맞을 때는 가운데로 보내고, 넘칠 때는 시작점을 남겨 둔다.
 *
 * 닫는 방법: 닫기 버튼 / Esc / 바깥 누르기. 열면 초점이 닫기 버튼으로 가고
 * Tab·Shift+Tab 은 확대창 안에서만 돈다. 닫으면 원래 누른 자리로 돌아온다.
 */
export function ZoomableImage({
    src,
    alt,
    style,
    fullSrc,
    caption,
    loading = 'lazy',
    testId,
}: ZoomableImageProps): React.ReactElement {
    const [isOpen, setIsOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const closeRef = React.useRef<HTMLButtonElement>(null);
    const dialogRef = React.useRef<HTMLDivElement>(null);

    const close = React.useCallback((): void => {
        setIsOpen(false);
        // 열기 전에 누른 자리로 초점을 되돌린다.
        // preventScroll 이 없으면 초점이 옮겨가며 페이지가 그 위치로 끌려간다 —
        // 읽던 자리를 지키려면 스크롤은 건드리지 않아야 한다.
        triggerRef.current?.focus({ preventScroll: true });
    }, []);

    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                close();

                return;
            }

            if (event.key !== 'Tab') {
                return;
            }

            // 초점을 확대창 안에 가둔다. 배경 링크로 빠지면 모달이 열린 채
            // 뒤쪽 화면을 키보드로 조작할 수 있게 된다.
            const dialog = dialogRef.current;
            if (!dialog) {
                return;
            }

            const focusables = Array.from(
                dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
            );

            if (focusables.length === 0) {
                event.preventDefault();

                return;
            }

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement as HTMLElement | null;
            const inside = active ? dialog.contains(active) : false;

            if (event.shiftKey) {
                if (! inside || active === first) {
                    event.preventDefault();
                    last.focus();
                }

                return;
            }

            if (! inside || active === last) {
                event.preventDefault();
                first.focus();
            }
        };

        const previousOverflow = document.body.style.overflow;
        const previousPaddingRight = document.body.style.paddingRight;
        // 스크롤바가 사라지며 본문이 옆으로 밀리는 것을 막는다.
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        document.addEventListener('keydown', onKeyDown);
        closeRef.current?.focus({ preventScroll: true });

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPaddingRight;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen, close]);

    return (
        <>
            <Button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label={`${alt} 크게 보기`}
                data-testid={testId}
                style={{
                    display: 'block',
                    width: '100%',
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    cursor: 'zoom-in',
                    lineHeight: 0,
                }}
            >
                <Img src={src} alt={alt} loading={loading} style={style} />
            </Button>

            {isOpen &&
                createPortal(
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={caption ?? alt}
                        data-testid={testId ? `${testId}-viewer` : 'image-viewer'}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'rgba(16, 42, 76, 0.96)',
                        }}
                    >
                        <div
                            data-testid={testId ? `${testId}-viewer-scroll` : 'image-viewer-scroll'}
                            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                                // 바깥(어두운 배경)을 누르면 닫는다. 이미지 자체 클릭은 무시.
                                if (event.target === event.currentTarget) {
                                    close();
                                }
                            }}
                            style={{
                                flex: '1 1 auto',
                                minHeight: 0,
                                overflow: 'auto',
                                display: 'flex',
                                padding: 'var(--20ft-spacing-lg, 1.5rem)',
                            }}
                        >
                            {/* margin:auto — 들어맞으면 가운데, 넘치면 시작점을 남긴다 */}
                            <div
                                style={{
                                    margin: 'auto',
                                    minWidth: 'min-content',
                                    lineHeight: 0,
                                }}
                            >
                                <Img
                                    src={fullSrc ?? src}
                                    alt={alt}
                                    style={{
                                        display: 'block',
                                        maxWidth: 'var(--20ft-viewer-image-max, 100%)',
                                        maxHeight: 'var(--20ft-viewer-image-max-height, calc(100vh - 12rem))',
                                        width: 'auto',
                                        height: 'auto',
                                        borderRadius: 'var(--20ft-radius, 6px)',
                                        backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                                    }}
                                />
                            </div>
                        </div>

                        {/* 조작 줄은 스크롤 영역 바깥 — 이미지를 어디로 밀어도 화면에 남는다 */}
                        <div
                            data-testid={testId ? `${testId}-viewer-controls` : 'image-viewer-controls'}
                            style={{
                                flex: '0 0 auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                                gap: 'var(--20ft-spacing-sm, 0.75rem)',
                                padding: '0.75rem 1rem',
                                paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))',
                                borderTop: '1px solid rgba(244, 240, 230, 0.18)',
                            }}
                        >
                            <A
                                href={fullSrc ?? src}
                                target="_blank"
                                rel="noreferrer noopener"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    minHeight: '2.75rem',
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: '0.9375rem',
                                    color: 'var(--20ft-paper-white, #FAF8F3)',
                                    textDecoration: 'underline',
                                }}
                            >
                                원본 이미지 열기
                            </A>
                            <Button
                                ref={closeRef}
                                type="button"
                                onClick={close}
                                data-testid={testId ? `${testId}-viewer-close` : 'image-viewer-close'}
                                style={{
                                    minHeight: '2.75rem',
                                    padding: '0.5rem 1.5rem',
                                    border: '1px solid rgba(244, 240, 230, 0.4)',
                                    borderRadius: 'var(--20ft-radius, 6px)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--20ft-paper-white, #FAF8F3)',
                                    fontFamily: 'var(--20ft-font-body, sans-serif)',
                                    fontSize: '0.9375rem',
                                    cursor: 'pointer',
                                }}
                            >
                                닫기
                            </Button>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}

export default ZoomableImage;
