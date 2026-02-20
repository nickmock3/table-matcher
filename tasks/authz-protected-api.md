# 保護API（認証/認可ガード）実装TODO

## 参照
- 仕様: `docs/specs/features/authz-protected-api.md`
- 計画: `plans/authz-protected-api.md`

## タスク一覧

### TASK-AUTHZ-001: 共通ガード基盤の作成
- 内容:
  - `src/features/authz/guards.ts` を追加
  - セッション必須ガード（401）を実装
  - ロールガード（403）を実装
  - 共通エラーレスポンスヘルパーを実装
- ブランチ例: `feature/authz-guard-foundation`
- テスト:
  - unit: 必須（ガード判定）
  - e2e: 不要
- DoD:
  - 仕様書の機能要件 1,2,4,5 を満たす
- ステータス:
  - 完了（2026-02-20）
- 実行コマンド:
  - `bun run test -- src/features/authz/guards.test.ts`
  - `bun run lint -- --ignore-pattern '.wrangler/**' --ignore-pattern 'test-results/**'`
  - `bun run test`
- 結果要約:
  - unit（authz guards）: pass
  - lint: pass
  - unit（all）: pass

### TASK-AUTHZ-002: 店舗スコープガード適用
- 内容:
  - 店舗スコープガードを実装（`store_user_links`）
  - `src/app/api/shop/seat-status/route.ts` へ適用
  - 既存の認可判定重複を整理
- ブランチ例: `feature/authz-store-scope`
- テスト:
  - unit: 必須（自店舗/他店舗/紐づけなし）
  - e2e: 任意（後続で主要導線確認）
- DoD:
  - 仕様書の機能要件 3 を満たす

### TASK-AUTHZ-003: 主要導線E2Eと仕上げ
- 内容:
  - 保護API利用画面で401/403表示をE2Eで確認
  - lint + unit + e2e + build結果を記録
  - 403/404秘匿方針の最終整理を仕様へ反映
- ブランチ例: `feature/authz-main-flow-e2e`
- テスト:
  - unit: 必要に応じて追加
  - e2e: 必須
- DoD:
  - 仕様書の受け入れ条件 1-5 を主要導線として確認できる
  - `bun run lint` / `bun run test` / `bun run e2e` / `bun run build` が通過

## 補足
- まずは店舗ユーザー向けAPIから適用し、管理者APIは後続機能で段階適用する。

## 変更履歴
- 2026-02-18: 初版作成
