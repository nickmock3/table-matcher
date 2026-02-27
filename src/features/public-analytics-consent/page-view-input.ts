import { z } from 'zod';

export const PAGE_VIEW_DEDUPE_WINDOW_SECONDS = 30 * 60;

const pathSchema = z
  .string()
  .min(1)
  .max(2048)
  .refine((value) => value.startsWith('/'), 'Path must start with /');

export const pageViewPayloadSchema = z.object({
  storeId: z.string().min(1).max(128).optional(),
  path: pathSchema,
  sessionId: z.string().min(8).max(128),
  occurredAt: z
    .number()
    .int()
    .positive()
    .max(9_999_999_999, 'occurredAt must be epoch seconds'),
});

export type PageViewPayload = z.infer<typeof pageViewPayloadSchema>;

export const normalizePageViewPayload = (payload: PageViewPayload): PageViewPayload => {
  const [rawPath] = payload.path.split('?');

  return {
    ...payload,
    path: rawPath,
  };
};

export const buildPageViewDedupeKey = (params: {
  anonId: string;
  storeId?: string;
  path: string;
  occurredAt: number;
}): string => {
  const bucket = Math.floor(params.occurredAt / PAGE_VIEW_DEDUPE_WINDOW_SECONDS);
  const storePart = params.storeId ?? '-';

  return `${params.anonId}|${storePart}|${params.path}|${bucket}`;
};
