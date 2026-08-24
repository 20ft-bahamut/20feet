import React from 'react';
import { A, Div, Header, Nav } from './basic';
import BrandLogo from './BrandLogo';
import PrimaryButton from './PrimaryButton';
import TextLink from './TextLink';
import type { EditorAttrs } from '../types/template';

export interface SiteHeaderProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function SiteHeader({ className, editorAttrs }: SiteHeaderProps): React.ReactElement {
    return (
        <Header
            className={className}
            {...editorAttrs}
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                height: 'var(--20ft-header-height, 4rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                borderBottom: '1px solid var(--20ft-border, rgba(16, 42, 76, 0.12))',
            }}
            data-testid="site-header"
        >
            <Div
                style={{
                    width: '100%',
                    maxWidth: 'var(--20ft-max-width, 1280px)',
                    height: '100%',
                    marginInline: 'auto',
                    paddingInline: 'var(--20ft-spacing-md, 1rem)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <A
                    href="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        textDecoration: 'none',
                    }}
                    data-testid="header-logo-link"
                >
                    <BrandLogo variant="full" surface="light" height="1.5rem" />
                </A>

                <Nav
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--20ft-spacing-xl, 2.5rem)',
                    }}
                    data-testid="header-nav"
                >
                    <TextLink href="/portfolio" data-testid="header-nav-portfolio">
                        Portfolio
                    </TextLink>
                    <TextLink href="/superbify" data-testid="header-nav-superbify">
                        SuperBify
                    </TextLink>
                </Nav>

                <PrimaryButton
                    href="/inquiry"
                    variant="primary"
                    size="small"
                    data-testid="header-cta"
                >
                    프로젝트 문의
                </PrimaryButton>
            </Div>
        </Header>
    );
}

export default SiteHeader;
