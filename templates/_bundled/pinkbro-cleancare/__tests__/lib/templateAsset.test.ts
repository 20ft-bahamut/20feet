import { describe, expect, it } from 'vitest';
import { templateAsset } from '../../src/lib/templateAsset';

describe('templateAsset', () => {
  it('builds the template asset endpoint url with the identifier', () => {
    expect(templateAsset('images/brand-logo.webp'))
      .toBe('/api/templates/assets/pinkbro-cleancare?file=images/brand-logo.webp');
  });

  it('does not double up slashes', () => {
    expect(templateAsset('/images/brand-logo.webp'))
      .toBe('/api/templates/assets/pinkbro-cleancare?file=images/brand-logo.webp');
  });

  it('returns an empty string for an empty path', () => {
    expect(templateAsset('')).toBe('');
  });
});
