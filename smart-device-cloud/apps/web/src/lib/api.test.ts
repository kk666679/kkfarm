import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { buildApiUrl, getApiBase } from './api.js';

describe('api URL helpers', () => {
  it('uses the canonical /api/v1 prefix without duplicating the API segment', () => {
    const base = getApiBase('http://localhost:3000');
    assert.equal(base, 'http://localhost:3000/api/v1');
    assert.equal(
      buildApiUrl('/devices', 'http://localhost:3000'),
      'http://localhost:3000/api/v1/devices'
    );
  });

  it('keeps same-origin relative URLs consistent', () => {
    assert.equal(getApiBase(''), '/api/v1');
    assert.equal(buildApiUrl('/auth/login'), '/api/v1/auth/login');
  });
});
