import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutSection from '../../src/components/AboutSection';

describe('AboutSection', () => {
  it('renders the message and each perspective', () => {
    render(<AboutSection copy={{
      about_message: '좋은 매장은 공간의 컨디션까지 다릅니다.',
      about_perspectives: [
        { title: '업종에 맞는 핵심 서비스', body: '설명 1' },
        { title: '기본가격 공개', body: '설명 2' },
      ],
    } as any} />);
    expect(screen.getByText('좋은 매장은 공간의 컨디션까지 다릅니다.')).toBeInTheDocument();
    expect(screen.getByText('업종에 맞는 핵심 서비스')).toBeInTheDocument();
  });

  it('renders a loading skeleton when copy is null', () => {
    render(<AboutSection copy={null} />);
    expect(screen.getByTestId('about-skeleton')).toBeInTheDocument();
  });
});