# table-matcher

空席マッチングWebサービスのMVP開発プロジェクトです。  
「仕様を先に固めてから実装する」運用を前提に、1人開発 + AIレビューで進めます。

## プロジェクト概要
- フレームワーク: Next.js (App Router)
- 実行基盤: Cloudflare Workers (OpenNext)
- データストア: Cloudflare D1 / R2
- 認証: Better Auth (Google OAuth)
- ORM: Drizzle ORM

## ディレクトリ構成
主要なディレクトリのみを示します。

```text
.
├── docs/
│   ├── specs/
│   │   └── features/      # 機能仕様書
│   ├── development-policy.md
│   └── setup.md
├── plans/                 # 機能実装計画
├── tasks/                 # 実装TODO（タスク単位）
├── src/                   # アプリ実装
├── drizzle/               # D1マイグレーション
├── wrangler.jsonc         # Cloudflare設定
└── AGENTS.md              # AIエージェント向け運用ルール
```

## 開発の進め方（ルール）
1. `docs/specs/features/` に機能仕様書を作成
2. `plans/` に実装計画を作成
3. `tasks/` に実装タスクを作成
4. タスク単位で実装（1ブランチ = 1タスク）

詳細ルールは `docs/development-policy.md` を参照してください。

## セットアップ
```bash
bun install
bun run db:generate
```

## 起動
### ローカル起動（Next.jsのみ）
```bash
bun run dev
```

### Cloudflareバインディング込みの確認
```bash
bun run dev:cf
```

## デプロイ
```bash
bun run deploy:dev
bun run deploy:demo
bun run deploy:prod
```

## 主要コマンド
```bash
bun run lint
bun run build
bun run build:cf
bun run db:migrate:dev
bun run db:migrate:prod
```

## ローカル管理者ロール付与
ローカルで管理者画面を確認する場合は、`users` テーブルに管理者メールを登録します。

```bash
wrangler d1 execute table-matcher-dev \
  --local --env dev --config wrangler.jsonc \
  --command "INSERT INTO users (id, email, role, created_at, updated_at)
             VALUES ('admin-local', 'あなたのGoogleメールアドレス', 'admin', strftime('%s','now'), strftime('%s','now'))
             ON CONFLICT(email) DO UPDATE SET role='admin', updated_at=strftime('%s','now');"
```

## 参照ドキュメント
- `docs/setup.md`（環境構築手順）
- `docs/development-policy.md`（開発方針・DoD・レビュー基準）
- `docs/specs/features/_template.md`（機能仕様書テンプレート）
- `docs/glossary.md`（技術用語集）
- `AGENTS.md`（AIエージェント運用ルール）
