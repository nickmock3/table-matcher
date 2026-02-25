export type ShopImageManagementState = {
  storeId: string;
  storeName: string | null;
  imageUrls: string[];
};

export const parseShopImageManagementState = (payload: unknown): ShopImageManagementState | null => {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const data = payload as {
    ok?: unknown;
    storeId?: unknown;
    storeName?: unknown;
    imageUrls?: unknown;
  };

  if (data.ok !== true) return null;
  if (typeof data.storeId !== 'string') return null;
  if (data.storeName !== undefined && data.storeName !== null && typeof data.storeName !== 'string') return null;
  if (!Array.isArray(data.imageUrls)) return null;
  if (data.imageUrls.some((item) => typeof item !== 'string')) return null;

  return {
    storeId: data.storeId,
    storeName: data.storeName ?? null,
    imageUrls: data.imageUrls,
  };
};

export const reorderImageUrls = (imageUrls: readonly string[], fromIndex: number, toIndex: number): string[] => {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= imageUrls.length ||
    toIndex >= imageUrls.length ||
    fromIndex === toIndex
  ) {
    return [...imageUrls];
  }

  const next = [...imageUrls];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export const removeImageUrlAt = (imageUrls: readonly string[], index: number): string[] => {
  if (index < 0 || index >= imageUrls.length) {
    return [...imageUrls];
  }

  return imageUrls.filter((_, targetIndex) => targetIndex !== index);
};

export const canSaveImageUrls = (params: {
  initialImageUrls: readonly string[];
  draftImageUrls: readonly string[];
  isLoading: boolean;
  isSubmitting: boolean;
}): boolean => {
  if (params.isLoading || params.isSubmitting) {
    return false;
  }

  if (params.draftImageUrls.length === 0) {
    return false;
  }

  if (params.initialImageUrls.length !== params.draftImageUrls.length) {
    return true;
  }

  return params.initialImageUrls.some((imageUrl, index) => imageUrl !== params.draftImageUrls[index]);
};

