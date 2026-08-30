import React from 'react';
import { Div, H1, H2, P, Section, Span } from './basic';
import { getPolicyDocument, localText, type PolicyDocumentKey } from '../config/businessInfo';

/**
 * PolicyPage — template policy document renderer (terms / privacy / shipping).
 *
 * Content comes ONLY from `config/business-info.json` via one import site
 * (`src/config/businessInfo.ts`). The layout JSON passes a `documentKey`
 * prop plus lang-resolved chrome text (eyebrow / note) and nothing else,
 * so the JSON file stays the single edit point.
 */

export interface PolicyPageProps {
    /** Which policy document to render from config/business-info.json. */
    documentKey?: PolicyDocumentKey;
    /** Uppercase eyebrow label above the page title (from lang). */
    eyebrow?: string;
    /** Honest template-scaffolding notice rendered at the bottom (from lang). */
    note?: string;
    className?: string;
}

export function PolicyPage({
    documentKey = 'terms',
    eyebrow,
    note,
    className,
}: PolicyPageProps): React.ReactElement {
    const document = getPolicyDocument(documentKey);
    const title = localText(document?.title);
    const updated = typeof document?.updated === 'string' ? document.updated.trim() : '';
    const sections = Array.isArray(document?.sections) ? document.sections : [];

    return (
        <Section
            className={className}
            data-testid="policy-page"
            data-policy={documentKey}
            style={{
                paddingBlock: 'var(--scm-section-py-md, 3rem)',
            }}
        >
            <Div
                style={{
                    maxWidth: 'var(--scm-max-width, 1200px)',
                    marginInline: 'auto',
                    paddingInline: 'var(--scm-gutter, 1rem)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--scm-spacing-lg, 1.5rem)',
                }}
            >
                {/* Page header: eyebrow + title (+ optional last-updated date) */}
                <Div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-2xs, 0.25rem)',
                    }}
                >
                    {eyebrow ? (
                        <Span
                            data-testid="policy-page-eyebrow"
                            style={{
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.75rem',
                                color: 'var(--scm-text-muted, #8A837B)',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                            }}
                        >
                            {eyebrow}
                        </Span>
                    ) : null}
                    <H1
                        data-testid="policy-page-title"
                        style={{
                            fontFamily: 'var(--scm-font-display, system-ui)',
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            color: 'var(--scm-text-primary, #26221E)',
                            margin: 0,
                        }}
                    >
                        {title}
                    </H1>
                    {updated ? (
                        <Span
                            data-testid="policy-page-updated"
                            style={{
                                fontFamily: 'var(--scm-font-body, system-ui)',
                                fontSize: '0.75rem',
                                color: 'var(--scm-text-muted, #8A837B)',
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            {updated}
                        </Span>
                    ) : null}
                </Div>

                {/* Document sections from config/business-info.json */}
                <Div
                    style={{
                        maxWidth: '46rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--scm-spacing-lg, 1.5rem)',
                    }}
                >
                    {sections.map((section, idx) => (
                        <Div
                            key={`policy-section-${idx}`}
                            data-testid="policy-section"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--scm-spacing-sm, 0.75rem)',
                            }}
                        >
                            <H2
                                style={{
                                    fontFamily: 'var(--scm-font-display, system-ui)',
                                    fontSize: '1.0625rem',
                                    fontWeight: 700,
                                    color: 'var(--scm-text-primary, #26221E)',
                                    margin: 0,
                                }}
                            >
                                {localText(section?.heading)}
                            </H2>
                            {(Array.isArray(section?.paragraphs) ? section.paragraphs : []).map((paragraph, pIdx) => (
                                <P
                                    key={`policy-section-${idx}-p-${pIdx}`}
                                    data-testid="policy-paragraph"
                                    style={{
                                        fontFamily: 'var(--scm-font-body, system-ui)',
                                        fontSize: '0.9375rem',
                                        lineHeight: 1.75,
                                        color: 'var(--scm-text-body, #4A4643)',
                                        margin: 0,
                                        overflowWrap: 'anywhere',
                                    }}
                                >
                                    {localText(paragraph)}
                                </P>
                            ))}
                        </Div>
                    ))}
                </Div>

                {/* Honest template framing — not a legal claim. */}
                {note ? (
                    <Span
                        data-testid="policy-note"
                        style={{
                            fontFamily: 'var(--scm-font-body, system-ui)',
                            fontSize: '0.75rem',
                            color: 'var(--scm-text-muted, #8A837B)',
                            letterSpacing: '0.01em',
                            paddingTop: 'var(--scm-spacing-sm, 0.75rem)',
                            borderTop: '1px solid var(--scm-line, #E4DCCE)',
                        }}
                    >
                        {note}
                    </Span>
                ) : null}
            </Div>
        </Section>
    );
}

export default PolicyPage;