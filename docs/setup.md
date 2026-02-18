# セットアップ手順（Bun + Next.js + Cloudflare Workers）

## 1. 事前準備
- Bun 1.2 以上
- Cloudflare アカウント
- Google Cloud の OAuth クレデンシャル

## 2. 依存関係のインストール
```bash
bun install
```

## 3. 環境変数の設定
1. `.env.example` を参考にローカル環境変数を設定する。
2. `opennextjs-cloudflare preview` 用に `.dev.vars` を設定する。

必須項目:
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APP_BASE_URL_DEV`
- `APP_BASE_URL_PROD`
- `GOOGLE_REDIRECT_URI_DEV`
- `GOOGLE_REDIRECT_URI_PROD`

任意項目（local/demo運用時）:
- `APP_BASE_URL_LOCAL`
- `APP_BASE_URL_DEMO`
- `GOOGLE_REDIRECT_URI_LOCAL`
- `GOOGLE_REDIRECT_URI_DEMO`
- `APP_ENV`（`local / dev / demo / prod / e2e`）

## 4. Cloudflare リソース作成（dev/prod）
### D1
```bash
wrangler d1 create table-matcher-dev
wrangler d1 create table-matcher-prod
```

### R2
```bash
wrangler r2 bucket create table-matcher-images-dev
wrangler r2 bucket create table-matcher-images-prod
wrangler r2 bucket create table-matcher-cache-dev
wrangler r2 bucket create table-matcher-cache-prod
```

作成したID/バケット名を `wrangler.jsonc` に反映する。

## 5. Secrets の設定
```bash
wrangler secret put BETTER_AUTH_SECRET --env dev --config wrangler.jsonc
wrangler secret put GOOGLE_CLIENT_ID --env dev --config wrangler.jsonc
wrangler secret put GOOGLE_CLIENT_SECRET --env dev --config wrangler.jsonc

wrangler secret put BETTER_AUTH_SECRET --env prod --config wrangler.jsonc
wrangler secret put GOOGLE_CLIENT_ID --env prod --config wrangler.jsonc
wrangler secret put GOOGLE_CLIENT_SECRET --env prod --config wrangler.jsonc
```

## 6. OAuth リダイレクトURI設定
Google Cloud Console に以下を登録:
- dev: `APP_BASE_URL_DEV/api/auth/callback/google`
- demo: `APP_BASE_URL_DEMO/api/auth/callback/google`（利用時）
- local: `APP_BASE_URL_LOCAL/api/auth/callback/google`（利用時）
- prod: `APP_BASE_URL_PROD/api/auth/callback/google`

## 7. マイグレーション
```bash
bun run db:generate
bun run db:migrate:dev
```

ローカル preview 用:
```bash
bun run db:migrate:local
```

### 7.1 ローカルD1の初期データ投入（E2E/画面確認用）
1. ローカルD1へマイグレーションを適用:
```bash
bun run db:migrate:local
```

2. テーブル作成確認:
```bash
wrangler d1 execute table-matcher-dev --local --env dev --config wrangler.jsonc --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

3. seed SQLを作成（例: `seeds/seed.local.sql`）し、`stores` の初期データを投入:
```bash
bun run db:seed:local
```

4. 投入結果確認:
```bash
wrangler d1 execute table-matcher-dev --local --env dev --config wrangler.jsonc --command "SELECT id,name,city,genre,is_published FROM stores ORDER BY id;"
```

補足:
- `db:seed:local` は `seeds/seed.local.sql` を実行する。
- `seeds/seed.local.sql` はローカル開発用のデータとして管理する。
- seedには `users` / `store_user_links` も含まれる。初期紐付けは以下:
  - `shop-sakura@example.com` -> `store_id: 3`（和食処 さくら）
  - `shop-bluesky@example.com` -> `store_id: 1`（カフェ ブルースカイ）

## 8. 起動
### Next.js ローカル起動（CF バインディングなし）
```bash
bun run dev
```

### Cloudflare preview（バインディングあり）
```bash
bun run dev:cf
```

### 8.1 E2EでローカルD1を使う場合の注意
- `bun run dev`（Next.js単体起動）では Cloudflare D1 バインディングは利用されない。
- ローカルD1連携の挙動を確認したい場合は `bun run dev:cf` を使う。
- 本リポジトリでは `playwright.config.ts` の `webServer.command` で
  `bun run build:cf && opennextjs-cloudflare preview --env e2e --port 3100` を実行する。
- 主要導線E2Eの実行前に、以下を実行してローカルD1を準備する:
```bash
bun run db:migrate:local
bun run db:seed:local
bun run e2e
```
- 障害表示E2Eは `__e2e_force_store_error=1` クエリで強制再現する（`E2E_FORCE_ERROR_ENABLED=1` のときのみ有効）。
- 本リポジトリでは `wrangler.jsonc` の `env.e2e.vars.E2E_FORCE_ERROR_ENABLED=1` を使い、
  `playwright.config.ts` から `opennextjs-cloudflare preview --env e2e` で起動している。

## 9. デプロイ
```bash
bun run deploy:dev
bun run deploy:prod
```

## 10. 確認項目
- `/` が表示される
- `/api/health` が `ok: true`
- `/api/auth/get-session` が応答
- Google Sign In が成功

## 11. Google実ログイン手動確認手順
1. `.dev.vars` に `BETTER_AUTH_SECRET` / `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `APP_BASE_URL_*` / `GOOGLE_REDIRECT_URI_*` を設定する。
2. Google Cloud Console で、実行する環境の Origin と Redirect URI を完全一致で登録する。
3. ローカルD1を利用する場合は先に以下を実行する。
```bash
bun run db:migrate:local
bun run db:seed:local
```
4. Cloudflare previewで起動する。
```bash
bun run dev:cf -- --port 8787
```
5. ブラウザで `http://127.0.0.1:8787/shop/login` を開き、`Googleでログイン` を実行する。
6. ログイン成功後、セッション状態にメールアドレスが表示されることを確認する。
7. `ログアウト` を実行し、`未ログインです。` 表示へ戻ることを確認する。

補足:
- `Auth is not available in this runtime` が出る場合は `bun run dev:cf` で起動しているか確認する。
- `Invalid origin` / `redirect_uri_mismatch` が出る場合は GCP 側登録値と実行URLの不一致を確認する。
