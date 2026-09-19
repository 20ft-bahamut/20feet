import { describe, expect, it } from 'vitest';
import { calculateEstimate, discountRateFor, formatWon, parsePrice } from '../../src/lib/estimate';
import type { DiscountStep, EstimateOption } from '../../src/lib/types';

const STEPS: DiscountStep[] = [
  { condition: '2개 항목', amount_label: '3%' },
  { condition: '3~4개 항목', amount_label: '5%' },
  { condition: '5개 이상', amount_label: '10%' },
];

const OPTIONS: EstimateOption[] = [
  { key: 'floor', label: '바닥 기계세척', price: 250000 },
  { key: 'glass', label: '유리창 세척', price: 100000 },
  { key: 'awning', label: '접이식 어닝 세척', price: 150000 },
  { key: 'sign', label: '간판 세척', price: 150000 },
  { key: 'hood', label: '상업용 후드 세척', price: 250000 },
  { key: 'air', label: '에어컨 분해세척', price: 150000 },
];

describe('discountRateFor', () => {
  it.each([
    [0, 0], [1, 0], [2, 3], [3, 5], [4, 5], [5, 10], [6, 10],
  ])('count %i → %i%%', (count, expected) => {
    expect(discountRateFor(count, STEPS)).toBe(expected);
  });

  it('falls back to 0 when no steps are configured', () => {
    expect(discountRateFor(5, [])).toBe(0);
  });
});

describe('calculateEstimate', () => {
  it('returns all zeros when nothing is selected', () => {
    expect(calculateEstimate(OPTIONS, [], STEPS))
      .toEqual({ count: 0, base: 0, rate: 0, discountAmount: 0, final: 0 });
  });

  it('single item has no discount', () => {
    const r = calculateEstimate(OPTIONS, ['floor'], STEPS);
    expect(r).toEqual({ count: 1, base: 250000, rate: 0, discountAmount: 0, final: 250000 });
  });

  it('two items get 3%', () => {
    const r = calculateEstimate(OPTIONS, ['floor', 'glass'], STEPS);
    expect(r.base).toBe(350000);
    expect(r.rate).toBe(3);
    expect(r.discountAmount).toBe(10500);
    expect(r.final).toBe(339500);
  });

  it('three items get 5%', () => {
    const r = calculateEstimate(OPTIONS, ['floor', 'glass', 'awning'], STEPS);
    expect(r.base).toBe(500000);
    expect(r.rate).toBe(5);
    expect(r.discountAmount).toBe(25000);
    expect(r.final).toBe(475000);
  });

  it('five items get 10%', () => {
    const r = calculateEstimate(OPTIONS, OPTIONS.map(o => o.key), STEPS);
    expect(r.base).toBe(1050000);
    expect(r.rate).toBe(10);
    expect(r.discountAmount).toBe(105000);
    expect(r.final).toBe(945000);
  });

  it('rounds the discount amount the same way the source does', () => {
    // 33330 * 3% = 999.9 → 1000
    const opts: EstimateOption[] = [
      { key: 'a', label: 'A', price: 33330 },
      { key: 'b', label: 'B', price: 0 },
    ];
    expect(calculateEstimate(opts, ['a', 'b'], STEPS).discountAmount).toBe(1000);
  });

  it('ignores selected keys that are not in the option list', () => {
    const r = calculateEstimate(OPTIONS, ['floor', 'ghost'], STEPS);
    expect(r.count).toBe(1);
    expect(r.base).toBe(250000);
  });

  it('counts distinct keys once even if duplicated', () => {
    const r = calculateEstimate(OPTIONS, ['floor', 'floor'], STEPS);
    expect(r.count).toBe(1);
    expect(r.base).toBe(250000);
  });
});

describe('formatWon', () => {
  it('formats with ko-KR grouping and the 원 suffix', () => {
    expect(formatWon(339500)).toBe('339,500원');
    expect(formatWon(0)).toBe('0원');
  });
});

describe('parsePrice', () => {
  it('parses a ko-KR currency label to an integer', () => {
    expect(parsePrice('250,000원')).toBe(250000);
    expect(parsePrice('1,000원 ~')).toBe(1000);
    expect(parsePrice('35만원')).toBe(350000);
    expect(parsePrice('5,000')).toBe(5000);
  });

  it('returns 0 for empty or non-numeric labels', () => {
    expect(parsePrice('')).toBe(0);
    expect(parsePrice('   ')).toBe(0);
    expect(parsePrice('별도 견적')).toBe(0);
  });
});