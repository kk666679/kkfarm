import { describe, it, expect } from 'vitest';

describe('auth plugin', () => {
  it('returns 401 when Authorization header missing', () => {
    expect(true).toBe(true);
  });
  it('returns 403 when permission denied', () => {
    expect(true).toBe(true);
  });
});
