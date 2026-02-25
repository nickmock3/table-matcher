export const STORE_IMAGE_API_PATH_PREFIX = '/api/store-images/';
export const MAX_STORE_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_STORE_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const mimeTypeToExtension: Record<(typeof ALLOWED_STORE_IMAGE_MIME_TYPES)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

type UploadValidationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

export const validateStoreImageUploadFile = (file: { type: string; size: number }): UploadValidationResult => {
  if (!ALLOWED_STORE_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_STORE_IMAGE_MIME_TYPES)[number])) {
    return {
      ok: false,
      message: 'Unsupported file type',
    };
  }

  if (file.size <= 0) {
    return {
      ok: false,
      message: 'Empty file is not allowed',
    };
  }

  if (file.size > MAX_STORE_IMAGE_UPLOAD_BYTES) {
    return {
      ok: false,
      message: 'File size exceeds limit',
    };
  }

  return { ok: true };
};

const detectMimeTypeBySignature = (bytes: Uint8Array): (typeof ALLOWED_STORE_IMAGE_MIME_TYPES)[number] | null => {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
};

export const validateStoreImageBinary = (
  bytes: Uint8Array,
  declaredMimeType: string,
): UploadValidationResult => {
  const detected = detectMimeTypeBySignature(bytes);
  if (!detected) {
    return {
      ok: false,
      message: 'Unsupported file signature',
    };
  }

  if (detected !== declaredMimeType) {
    return {
      ok: false,
      message: 'File signature does not match MIME type',
    };
  }

  return { ok: true };
};

export const buildStoreImageObjectKey = (storeId: string, mimeType: (typeof ALLOWED_STORE_IMAGE_MIME_TYPES)[number]) => {
  const extension = mimeTypeToExtension[mimeType];
  return `stores/${storeId}/${crypto.randomUUID()}.${extension}`;
};

const encodePathKey = (key: string): string => {
  return key
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
};

const decodePathKey = (encodedKey: string): string => {
  return encodedKey
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => decodeURIComponent(segment))
    .join('/');
};

export const buildStoreImageUrl = (origin: string, key: string): string => {
  const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
  return `${normalizedOrigin}${STORE_IMAGE_API_PATH_PREFIX}${encodePathKey(key)}`;
};

export const extractStoreImageObjectKey = (
  imageUrl: string,
  expectedStoreId: string,
  expectedOrigin?: string,
): string | null => {
  const parsedUrl = (() => {
    try {
      return new URL(imageUrl, 'http://local.test');
    } catch {
      return null;
    }
  })();

  if (!parsedUrl || !parsedUrl.pathname.startsWith(STORE_IMAGE_API_PATH_PREFIX)) {
    return null;
  }

  if (expectedOrigin) {
    const normalizedExpectedOrigin = expectedOrigin.endsWith('/') ? expectedOrigin.slice(0, -1) : expectedOrigin;
    if (parsedUrl.origin !== normalizedExpectedOrigin) {
      return null;
    }
  }

  const encodedKey = parsedUrl.pathname.slice(STORE_IMAGE_API_PATH_PREFIX.length);
  const key = decodePathKey(encodedKey);
  const expectedPrefix = `stores/${expectedStoreId}/`;
  if (!key.startsWith(expectedPrefix)) {
    return null;
  }

  return key;
};
