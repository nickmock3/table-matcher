import { eq } from 'drizzle-orm';
import { requireRole, requireSession } from '@/features/authz/guards';
import { getDrizzleDb } from '@/lib/db/client';
import { users } from '@/lib/db/schema';

type ResolveRoleByEmail = (email: string) => Promise<string | null>;

type RequireAdminAccessDependencies = {
  resolveRoleByEmail?: ResolveRoleByEmail;
  requireSessionFn?: typeof requireSession;
  requireRoleFn?: typeof requireRole;
};

const defaultResolveRoleByEmail: ResolveRoleByEmail = async (email) => {
  const db = await getDrizzleDb();
  const rows = await db.select({ role: users.role }).from(users).where(eq(users.email, email)).limit(1);
  return rows[0]?.role ?? null;
};

export type RequireAdminAccessResult =
  | {
      ok: true;
      email: string;
    }
  | {
      ok: false;
      response: Response;
    };

export const requireAdminAccess = async (
  request: Request,
  dependencies?: RequireAdminAccessDependencies,
): Promise<RequireAdminAccessResult> => {
  const requireSessionFn = dependencies?.requireSessionFn ?? requireSession;
  const requireRoleFn = dependencies?.requireRoleFn ?? requireRole;

  const sessionResult = await requireSessionFn(request);
  if (!sessionResult.ok) {
    return sessionResult;
  }

  const resolveRoleByEmail = dependencies?.resolveRoleByEmail ?? defaultResolveRoleByEmail;
  const role = await resolveRoleByEmail(sessionResult.user.email);
  const roleResult = requireRoleFn(role, ['admin']);

  if (!roleResult.ok) {
    return roleResult;
  }

  return {
    ok: true,
    email: sessionResult.user.email,
  };
};
