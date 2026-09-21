// Both api implementations must export the same functions.

import { describe, it, expect } from 'vitest';
import * as mockApi from './mockApi.js';
import * as httpApi from './httpApi.js';
import * as api from './index.js';

describe('api layer', () => {
  it('has the same functions in mockApi and httpApi', () => {
    expect(Object.keys(httpApi).sort()).toEqual(Object.keys(mockApi).sort());
  });

  it('exports every function from index.js', () => {
    for (const name of Object.keys(mockApi)) {
      expect(typeof api[name]).toBe('function');
    }
  });

  it('uses the simulated backend when VITE_USE_MOCK_API is not set', () => {
    expect(api.USING_MOCK_API).toBe(true);
  });
});
