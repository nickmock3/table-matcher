import { getD1 } from "@/lib/db/client";

export async function GET() {
  try {
    const d1 = await getD1();

    if (!d1) {
      return Response.json({ ok: true, db: "unbound", runtime: "local-node" });
    }

    await d1.prepare("select 1 as ok").first();

    return Response.json({ ok: true, db: "ok", runtime: "cloudflare" });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        db: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
