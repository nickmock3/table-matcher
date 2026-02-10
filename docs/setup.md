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

## 8. 起動
### Next.js ローカル起動（CF バインディングなし）
```bash
bun run dev
```

### Cloudflare preview（バインディングあり）
```bash
bun run dev:cf
```

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
