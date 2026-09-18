import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, H2, Img, Input } from '../../src/components/basic';

describe('basic components', () => {
  it('Button forwards className and renders children', () => {
    render(<Button className="pb-btn">보내기</Button>);
    const el = screen.getByRole('button', { name: '보내기' });
    expect(el).toHaveClass('pb-btn');
  });

  it('H2 renders text', () => {
    render(<H2>제목</H2>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('제목');
  });

  it('Img passes src and alt through', () => {
    render(<Img src="/x.webp" alt="사진" />);
    const img = screen.getByAltText('사진');
    expect(img).toHaveAttribute('src', '/x.webp');
  });

  it('Input keeps uncontrolled value passing', () => {
    render(<Input name="contact" defaultValue="010" />);
    expect(screen.getByRole('textbox')).toHaveValue('010');
  });
});
