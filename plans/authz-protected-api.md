# 保護API（認証/認可ガード）実装計画

## 1. 対象仕様
- 仕様書: `docs/specs/features/authz-protected-api.md`
- 対象範囲: セッション必須/役割/店舗スコープの共通ガード化と既存API適用

## 2. 実装方針
- `src/features/authz/` にガード関数を集約し、APIルートから呼び出す。
- 既存API（店舗ユーザー空席更新API）へ段階適用し、回帰を防ぐ。
- エラーレスポンス形式は `Response.json({ ok: false, message }, { status })` に統一する。

## 3. 成果物
- 認証/認可ガード関数群
- 保護対象APIへの適用
- unit/e2eテスト
- 運用ドキュメント更新（必要時）

## 4. 実装ステップ
1. `src/features/authz/guards.ts` を作成（セッション/ロール/店舗スコープ）。
2. 共通エラーレスポンスヘルパーを作成。
3. `src/app/api/shop/seat-status/route.ts` にガードを適用。
4. 既存ロジック重複を削除し、振る舞いを固定。
5. unitテストを追加（ガード判定、レスポンス）。
6. e2eで未認証/認可エラー表示を確認。
7. lint + unit + e2e + build を実行。

## 5. テスト計画
- lint: `bun run lint`
- unit: `bun run test`
- e2e: `bun run e2e`
- build: `bun run build`

## 6. リスクと対策
- リスク: ガード適用で既存APIのレスポンス互換が崩れる。
- 対策: 既存E2E/unitを更新し、期待仕様を明示して固定する。

- リスク: `users` と Better Auth `user` の参照不一致。
- 対策: 現段階は `store_user_links` とセッションメール判定を主軸にし、ロール判定は最小範囲から導入。

## 7. 完了条件（DoD）
- 仕様書の受け入れ条件 1-5 を満たす。
- `spec + plan + tasks` の整合が取れている。
- `bun run lint` / `bun run test` / 必要e2e / `bun run build` が通過。

## 8. 変更履歴
- 2026-02-18: 初版作成
