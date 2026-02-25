import { requireStoreScope, type StoreScopeGuardResult } from '@/features/authz/guards';
import { eq } from 'drizzle-orm';
import { getDrizzleDb } from '@/lib/db/client';
import { storeUserLinks, stores } from '@/lib/db/schema';

export type StoreImageLink = {
  storeId: string;
  storeName: string;
  imageUrls: string | null;
};

export const listStoreImageLinks = async (loginEmail: string): Promise<readonly StoreImageLink[]> => {
  const db = await getDrizzleDb();
  return db
    .select({
      storeId: storeUserLinks.storeId,
      storeName: stores.name,
      imageUrls: stores.imageUrls,
    })
    .from(storeUserLinks)
    .innerJoin(stores, eq(storeUserLinks.storeId, stores.id))
    .where(eq(storeUserLinks.loginEmail, loginEmail));
};

export const resolveStoreImageScope = async (
  params: {
    loginEmail: string;
    requestedStoreId?: string;
  },
  dependencies: {
    listStoreLinks: (loginEmail: string) => Promise<readonly StoreImageLink[]>;
  },
): Promise<StoreScopeGuardResult<StoreImageLink>> => {
  return requireStoreScope(params, dependencies);
};
