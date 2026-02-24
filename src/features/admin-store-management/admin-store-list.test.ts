import { describe, expect, it } from 'vitest';
import { formatPublishStatus } from './admin-store-list';

describe('formatPublishStatus', () => {
  it('trueの場合は公開を返す', () => {
    expect(formatPublishStatus(true)).toBe('公開');
  });

  it('falseの場合は非公開を返す', () => {
    expect(formatPublishStatus(false)).toBe('非公開');
  });
});
