import React from 'react';
import { Div, Form, H1, Input, Label, Option, P, Select, Textarea } from './basic';
import Container from './Container';
import SectionEyebrow from './SectionEyebrow';
import PrimaryButton from './PrimaryButton';
import type { EditorAttrs } from '../types/template';

export interface InquiryFormProps {
    className?: string;
    editorAttrs?: EditorAttrs;
}

export function InquiryForm({ className, editorAttrs }: InquiryFormProps): React.ReactElement {
    const fieldStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem',
        borderRadius: 'var(--20ft-radius-sm, 0.25rem)',
        border: '1px solid var(--20ft-border, rgba(16, 42, 76, 0.12))',
        backgroundColor: 'var(--20ft-bg-secondary, #F4F0E6)',
        color: 'var(--20ft-text-primary, #1A1A1A)',
        fontFamily: 'var(--20ft-font-body, sans-serif)',
        fontSize: '0.875rem',
        opacity: 0.7,
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: 'var(--20ft-spacing-xs, 0.25rem)',
        fontFamily: 'var(--20ft-font-body, sans-serif)',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'var(--20ft-text-primary, #1A1A1A)',
    };

    return (
        <Div
            className={className}
            {...editorAttrs}
            style={{
                paddingBlock: 'var(--20ft-spacing-3xl, 6rem)',
                backgroundColor: 'var(--20ft-paper-white, #FAF8F3)',
                minHeight: '60vh',
            }}
            data-testid="inquiry-form-page"
        >
            <Container>
                <SectionEyebrow text="프로젝트 문의" />
                <H1
                    style={{
                        margin: 0,
                        marginBottom: 'var(--20ft-spacing-md, 1rem)',
                        fontFamily: 'var(--20ft-font-display, Georgia, serif)',
                        fontWeight: 800,
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        color: 'var(--20ft-deep-indigo, #102A4C)',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                    }}
                >
                    만들고 싶은 것을 이야기해주세요.
                </H1>

                <P
                    style={{
                        margin: 0,
                        marginBottom: 'var(--20ft-spacing-xl, 2.5rem)',
                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                        fontSize: '1rem',
                        lineHeight: 1.75,
                        letterSpacing: '-0.01em',
                        color: 'var(--20ft-text-muted, #5E6063)',
                        maxWidth: '56ch',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                    }}
                >
                    무엇을 만들지 완벽하게 정리되어 있지 않아도 괜찮습니다.
                    웹사이트, 커머스, 업무 시스템, 기존 서비스 개선 등
                    현재 상황과 필요한 결과를 알려주시면 함께 구조부터 정리합니다.
                </P>

                <Div
                    data-testid="coming-soon-notice"
                    style={{
                        marginBottom: 'var(--20ft-spacing-xl, 2.5rem)',
                        padding: 'var(--20ft-spacing-md, 1rem)',
                        borderRadius: 'var(--20ft-radius, 0.5rem)',
                        border: '1px solid var(--20ft-heritage-gold, #B69B5F)',
                        backgroundColor: 'var(--20ft-warm-ivory, #F4F0E6)',
                        color: 'var(--20ft-indigo, #183B6B)',
                        fontFamily: 'var(--20ft-font-body, sans-serif)',
                        fontSize: '0.875rem',
                    }}
                >
                    현재 온라인 문의 접수 기능을 준비 중입니다.
                </Div>

                <Form
                    data-testid="inquiry-form"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--20ft-spacing-md, 1rem)',
                        maxWidth: '640px',
                    }}
                    // Intentionally no onSubmit handler — form is disabled/preview only.
                    onSubmit={(e) => e.preventDefault()}
                >
                    <Div>
                        <Label htmlFor="inquiry-name" style={labelStyle}>이름</Label>
                        <Input
                            id="inquiry-name"
                            name="name"
                            type="text"
                            disabled
                            placeholder="이름을 입력해주세요"
                            style={fieldStyle}
                            data-testid="inquiry-input-name"
                        />
                    </Div>

                    <Div>
                        <Label htmlFor="inquiry-email" style={labelStyle}>이메일</Label>
                        <Input
                            id="inquiry-email"
                            name="email"
                            type="email"
                            disabled
                            placeholder="이메일 주소"
                            style={fieldStyle}
                            data-testid="inquiry-input-email"
                        />
                    </Div>

                    <Div>
                        <Label htmlFor="inquiry-type" style={labelStyle}>프로젝트 유형</Label>
                        <Select id="inquiry-type" name="projectType" disabled style={fieldStyle} data-testid="inquiry-select-type">
                            <Option>웹 / 커머스</Option>
                            <Option>소프트웨어 / 시스템</Option>
                            <Option>그누보드 7 확장</Option>
                            <Option>기타 협업</Option>
                        </Select>
                    </Div>

                    <Div>
                        <Label htmlFor="inquiry-message" style={labelStyle}>문의 내용</Label>
                        <Textarea
                            id="inquiry-message"
                            name="message"
                            rows={5}
                            disabled
                            placeholder="만들고 싶은 것과 현재 상황을 간단히 적어주세요"
                            style={fieldStyle}
                            data-testid="inquiry-textarea-message"
                        />
                    </Div>

                    <PrimaryButton type="submit" disabled data-testid="inquiry-submit-button">
                        프로젝트 문의 보내기
                    </PrimaryButton>
                </Form>
            </Container>
        </Div>
    );
}

export default InquiryForm;
