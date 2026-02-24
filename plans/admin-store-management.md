# 管理者向け店舗管理 実装計画

## 1. 対象仕様
- 仕様書: `docs/specs/features/admin-store-management.md`
- 対象範囲: 管理者向け店舗管理（一覧・作成・編集・公開制御）と認可適用

## 2. 実装方針
- 管理者向け機能は `src/features/admin-store-management/` に集約する。
- APIは `src/app/api/admin/stores/**` 配下で提供し、`authz` ガードを再利用して管理者限定アクセスにする。
- フォーム入力はzodで検証し、API/画面で同一スキーマを利用する。

## 3. 成果物
- 管理者向け店舗管理画面（一覧、新規、編集）
- 管理者向け店舗管理API（一覧取得、作成、更新）
- 入力検証スキーマ・変換ロジック
- unit/e2eテスト

## 4. 実装ステップ
1. 管理者向け店舗管理のドメインモデル・入力スキーマを作成。
2. 管理者認可ガード（`users.role=admin`）を適用するAPI基盤を作成。
3. 店舗一覧取得APIと店舗作成/更新APIを実装。
4. 管理者画面（一覧、新規、編集）を実装。
5. 公開画面の `is_published` 反映が維持されることを確認。
6. unit/e2e追加、`lint + unit + e2e + build` を実行。

## 5. テスト計画
- lint: `bun run lint`
- unit: `bun run test`
- e2e: `bun run e2e`（管理導線 + 公開反映の主要ケース）
- build: `bun run build`

## 6. リスクと対策
- リスク: 管理者ロール判定が `users` と Better Auth `user` で不整合になる。
- 対策: API境界で `users` テーブル参照による明示判定を統一実装する。

- リスク: 編集項目増加で入力不整合が起きる。
- 対策: zodスキーマを単一化し、API/フォームで共通利用する。

- リスク: `is_published` 制御で公開画面回帰が発生する。
- 対策: 既存公開導線E2Eに表示可否ケースを追加して固定化する。

## 7. 完了条件（DoD）
- 仕様書の受け入れ条件 1-5 を満たす。
- `spec + plan + tasks` の整合が取れている。
- `bun run lint` / `bun run test` / 必要e2e / `bun run build` が通過する。

## 8. 変更履歴
- 2026-02-24: 初版作成
