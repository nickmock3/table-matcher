import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildStoreImageObjectKey,
  buildStoreImageUrl,
  extractStoreImageObjectKey,
  validateStoreImageBinary,
  validateStoreImageUploadFile,
} from './image-storage';

describe('validateStoreImageUploadFile', () => {
  it('許可MIMEかつサイズ上限内なら有効', () => {
    const result = validateStoreImageUploadFile({
      type: 'image/jpeg',
      size: 1024,
    });
    expect(result.ok).toBe(true);
  });

  it('許可外MIMEは無効', () => {
    const result = validateStoreImageUploadFile({
      type: 'application/pdf',
      size: 1024,
    });
    expect(result).toEqual({
      ok: false,
      message: 'Unsupported file type',
    });
  });

  it('サイズ超過は無効', () => {
    const result = validateStoreImageUploadFile({
      type: 'image/jpeg',
      size: 5 * 1024 * 1024 + 1,
    });
    expect(result).toEqual({
      ok: false,
      message: 'File size exceeds limit',
    });
  });
});

describe('store image key/url helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('オブジェクトキーを生成する', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('uuid-test');
    const key = buildStoreImageObjectKey('store-1', 'image/png');
    expect(key).toBe('stores/store-1/uuid-test.png');
  });

  it('URL生成とオブジェクトキー復元ができる', () => {
    const imageUrl = buildStoreImageUrl('https://example.com', 'stores/store-1/file.jpg');
    const key = extractStoreImageObjectKey(imageUrl, 'store-1', 'https://example.com');
    expect(key).toBe('stores/store-1/file.jpg');
  });

  it('他店舗キーは復元対象外', () => {
    const imageUrl = buildStoreImageUrl('https://example.com', 'stores/store-2/file.jpg');
    const key = extractStoreImageObjectKey(imageUrl, 'store-1', 'https://example.com');
    expect(key).toBeNull();
  });

  it('外部URLは復元対象外', () => {
    const key = extractStoreImageObjectKey('https://cdn.example.com/file.jpg', 'store-1', 'https://example.com');
    expect(key).toBeNull();
  });

  it('origin不一致は復元対象外', () => {
    const imageUrl = buildStoreImageUrl('https://evil.example', 'stores/store-1/file.jpg');
    const key = extractStoreImageObjectKey(imageUrl, 'store-1', 'https://example.com');
    expect(key).toBeNull();
  });
});

describe('validateStoreImageBinary', () => {
  it('JPEGシグネチャとMIMEが一致すれば有効', () => {
    const result = validateStoreImageBinary(new Uint8Array([0xff, 0xd8, 0xff, 0x00]), 'image/jpeg');
    expect(result.ok).toBe(true);
  });

  it('シグネチャ不一致は無効', () => {
    const result = validateStoreImageBinary(
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      'image/jpeg',
    );
    expect(result).toEqual({
      ok: false,
      message: 'File signature does not match MIME type',
    });
  });

  it('未知シグネチャは無効', () => {
    const result = validateStoreImageBinary(new Uint8Array([0x00, 0x01, 0x02, 0x03]), 'image/png');
    expect(result).toEqual({
      ok: false,
      message: 'Unsupported file signature',
    });
  });
});
