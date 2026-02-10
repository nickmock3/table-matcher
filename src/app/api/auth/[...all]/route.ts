import { toNextJsHandler } from "better-auth/next-js";

import { createAuth } from "@/lib/auth/server";

const createUnavailableResponse = (error: unknown) => {
  const reason = error instanceof Error ? error.message : "Unknown error";

  return Response.json(
    {
      ok: false,
      message: "Auth is not available in this runtime. Use `bun run dev:cf`.",
      reason,
    },
    { status: 503 },
  );
};

const createHandler = async () => {
  try {
    const auth = await createAuth();
    return toNextJsHandler(auth);
  } catch (error) {
    return {
      GET: async () => createUnavailableResponse(error),
      POST: async () => createUnavailableResponse(error),
      PUT: async () => createUnavailableResponse(error),
      PATCH: async () => createUnavailableResponse(error),
      DELETE: async () => createUnavailableResponse(error),
    };
  }
};

export async function GET(request: Request) {
  const handler = await createHandler();
  return handler.GET(request);
}

export async function POST(request: Request) {
  const handler = await createHandler();
  return handler.POST(request);
}

export async function PUT(request: Request) {
  const handler = await createHandler();
  return handler.PUT(request);
}

export async function PATCH(request: Request) {
  const handler = await createHandler();
  return handler.PATCH(request);
}

export async function DELETE(request: Request) {
  const handler = await createHandler();
  return handler.DELETE(request);
}
