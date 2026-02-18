# 店舗情報のDB正本化 実装TODO

## 参照
- 仕様: `docs/specs/features/store-data-source-of-truth.md`
- 計画: `plans/store-data-source-of-truth.md`

## タスク一覧

### TASK-SDS-001: storesスキーマ拡張と変換ロジック
- 内容:
  - storesに住所/位置/画像カラムを追加
  - `image_urls` パースを含む表示モデル変換を実装
  - unitテストを追加
- ブランチ例: `feature/store-data-schema-model`
- テスト:
  - unit: 必須（パース/フォールバック）
  - e2e: 不要（後続で実施）
- DoD:
  - 仕様書の機能要件 1,5 を満たす
- ステータス:
  - 完了（2026-02-18）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass（`src/features/store-data/store-model.test.ts` を含む）
  - build: pass

### TASK-SDS-002: 画面参照元のDB統一
- 内容:
  - トップ/詳細/店舗ユーザー画面の店舗情報参照をDB正本化
  - モック補完ロジックを撤去
  - 既存空席反映ロジックと整合
- ブランチ例: `feature/store-data-page-integration`
- テスト:
  - unit: 必須（取得・マッピング）
  - e2e: 任意（主要導線はTASK-SDS-003で実施）
- DoD:
  - 仕様書の機能要件 2,3,4,6 を満たす
- ステータス:
  - 完了（2026-02-18）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass
  - build: pass

### TASK-SDS-003: E2Eと仕上げ
- 内容:
  - トップ→詳細の店舗情報一致をE2Eで検証
  - 店舗ユーザー画面の店舗名/画像表示をE2Eで検証
  - lint + unit + e2e + build 結果記録
- ブランチ例: `feature/store-data-e2e`
- テスト:
  - unit: 必要に応じて追加
  - e2e: 必須
- DoD:
  - 仕様書の受け入れ条件 1-5 を主要導線として確認できる
  - `bun run lint` / `bun run test` / `bun run e2e` / `bun run build` が通過
- ステータス:
  - 完了（2026-02-18）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run e2e`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass（43 tests）
  - e2e: pass（7 tests）
  - build: pass

## 補足
- 初期移行では既存モックデータをseedへ移植し、画面表示差異を最小化する。
- ローカル開発向けseedを追加:
  - `seeds/seed.local.sql`
  - `bun run db:seed:local`
- seedには `stores` に加えて `users` / `store_user_links` を含め、店舗ユーザー画面の導線確認を容易化した。

## 変更履歴
- 2026-02-17: 初版作成
- 2026-02-18: TASK-SDS-001 の完了判定（実行コマンド・結果）を追記
- 2026-02-18: TASK-SDS-002 の完了判定（実行コマンド・結果）を追記
- 2026-02-18: TASK-SDS-003 の完了判定（実行コマンド・結果）を追記
- 2026-02-18: ローカルseed運用（`seeds/seed.local.sql` / `db:seed:local`）を追記
