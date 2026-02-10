import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold">Table Matcher MVP Setup</h1>
        <p className="text-sm text-zinc-600">
          Cloudflare Workers + D1 + R2 + Better Auth (Google OAuth) の初期構築済み状態です。
        </p>
      </section>

      <section className="rounded-lg border border-zinc-200 p-5">
        <h2 className="mb-3 text-lg font-medium">Health Checks</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link className="underline" href="/api/health">
              /api/health
            </Link>
          </li>
          <li>
            <Link className="underline" href="/api/auth/get-session">
              /api/auth/get-session
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-lg border border-zinc-200 p-5">
        <h2 className="mb-3 text-lg font-medium">Google OAuth</h2>
        <div className="flex flex-wrap gap-3">
          <form action="/api/auth/sign-in/social" method="GET">
            <input name="provider" type="hidden" value="google" />
            <input name="callbackURL" type="hidden" value="/" />
            <button className="rounded bg-zinc-900 px-4 py-2 text-sm text-white" type="submit">
              Sign in with Google
            </button>
          </form>
          <form action="/api/auth/sign-out" method="POST">
            <button className="rounded border border-zinc-300 px-4 py-2 text-sm" type="submit">
              Sign out
            </button>
          </form>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          `bun run dev` ではCloudflare binding未接続のためAuth APIは503になります。OAuth検証は
          `bun run dev:cf` を使用してください。
        </p>
      </section>
    </main>
  );
}
