// test/math.test.js
import { describe, it, expect } from 'vitest';
import { add } from '../src/math.js';

describe('math', () => {
  it('adds numbers correctly', () => {
    expect(add(2, 3)).toBe(5);
  });
});
