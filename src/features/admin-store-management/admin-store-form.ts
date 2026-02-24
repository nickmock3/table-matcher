export type AdminStore = {
  id: string;
  name: string;
  address: string | null;
  city: string;
  genre: string;
  latitude: number | null;
  longitude: number | null;
  imageUrls: string[];
  reservationUrl: string;
  isPublished: boolean;
  updatedAt: number;
};

export type AdminStoreFormValues = {
  name: string;
  address: string;
  city: string;
  genre: string;
  reservationUrl: string;
  latitude: string;
  longitude: string;
  imageUrlsText: string;
  isPublished: boolean;
};

export type AdminStorePayloadResult =
  | {
      ok: true;
      payload: {
        name: string;
        address: string | null;
        city: string;
        genre: string;
        reservationUrl: string;
        latitude: number | null;
        longitude: number | null;
        imageUrls: string[];
        isPublished: boolean;
      };
    }
  | {
      ok: false;
      message: string;
    };

const parseCoordinate = (value: string): number | null | 'invalid' => {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return 'invalid';

  return parsed;
};

export const parseImageUrlsText = (imageUrlsText: string): string[] => {
  return imageUrlsText
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export const formatImageUrlsText = (imageUrls: readonly string[]): string => {
  return imageUrls.join('\n');
};

export const createEmptyAdminStoreFormValues = (): AdminStoreFormValues => {
  return {
    name: '',
    address: '',
    city: '',
    genre: '',
    reservationUrl: '',
    latitude: '',
    longitude: '',
    imageUrlsText: '',
    isPublished: true,
  };
};

export const toAdminStoreFormValues = (store: AdminStore): AdminStoreFormValues => {
  return {
    name: store.name,
    address: store.address ?? '',
    city: store.city,
    genre: store.genre,
    reservationUrl: store.reservationUrl,
    latitude: store.latitude === null ? '' : String(store.latitude),
    longitude: store.longitude === null ? '' : String(store.longitude),
    imageUrlsText: formatImageUrlsText(store.imageUrls),
    isPublished: store.isPublished,
  };
};

export const buildAdminStorePayload = (form: AdminStoreFormValues): AdminStorePayloadResult => {
  const latitude = parseCoordinate(form.latitude);
  const longitude = parseCoordinate(form.longitude);

  if (latitude === 'invalid' || longitude === 'invalid') {
    return {
      ok: false,
      message: '緯度・経度は数値で入力してください。',
    };
  }

  if ((latitude === null) !== (longitude === null)) {
    return {
      ok: false,
      message: '緯度・経度は両方入力するか、両方空欄にしてください。',
    };
  }

  return {
    ok: true,
    payload: {
      name: form.name.trim(),
      address: form.address.trim() ? form.address.trim() : null,
      city: form.city.trim(),
      genre: form.genre.trim(),
      reservationUrl: form.reservationUrl.trim(),
      latitude,
      longitude,
      imageUrls: parseImageUrlsText(form.imageUrlsText),
      isPublished: form.isPublished,
    },
  };
};
