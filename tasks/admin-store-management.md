# 管理者向け店舗管理 実装TODO

## 参照
- 仕様: `docs/specs/features/admin-store-management.md`
- 計画: `plans/admin-store-management.md`

## タスク一覧

### TASK-ASM-001: 管理者店舗管理API基盤
- 内容:
  - `src/features/admin-store-management/` に入力スキーマ・モデルを追加
  - 管理者認可付きAPI基盤（一覧/作成/更新）を実装
  - unitテストを追加（入力検証、管理者判定）
- ブランチ例: `feature/admin-store-management-api-foundation`
- テスト:
  - unit: 必須（スキーマ・認可）
  - e2e: 不要
- DoD:
  - 仕様書の機能要件 1,2,3,5 を満たす
- ステータス:
  - 完了（2026-02-24）
- 実行コマンド:
  - `bun run test -- src/features/admin-store-management/store-input.test.ts src/features/admin-store-management/admin-auth.test.ts`
  - `bun run lint -- --ignore-pattern '.wrangler/**' --ignore-pattern 'test-results/**'`
  - `bun run test`
  - `bun run build`
- 結果要約:
  - unit（admin-store-management）: pass
  - lint: pass
  - unit（all）: pass
  - build: pass

### TASK-ASM-002: 管理者画面（一覧/新規/編集）
- 内容:
  - `src/app/admin/stores/**` に一覧・新規・編集画面を実装
  - API連携（作成/更新/公開切り替え）を実装
  - 入力エラー表示と保存後導線を実装
- ブランチ例: `feature/admin-store-management-ui`
- テスト:
  - unit: 必須（表示ロジック、フォーム変換）
  - e2e: 任意（主要導線は次タスク）
- DoD:
  - 仕様書の機能要件 2,3,4 を満たす
- ステータス:
  - 完了（2026-02-24）
- 実行コマンド:
  - `bun run test -- src/features/admin-store-management/admin-store-form.test.ts src/features/admin-store-management/admin-store-list.test.ts src/features/admin-store-management/store-input.test.ts src/features/admin-store-management/admin-auth.test.ts`
  - `bun run lint -- --ignore-pattern '.wrangler/**' --ignore-pattern 'test-results/**'`
  - `bun run test`
  - `bun run build`
- 結果要約:
  - unit（admin-store-management）: pass
  - lint: pass
  - unit（all）: pass
  - build: pass

### TASK-ASM-003: E2Eと公開反映確認
- 内容:
  - 管理者導線（一覧 -> 新規/編集）をE2Eで確認
  - 非管理者アクセス拒否（401/403）をE2Eで確認
  - `is_published` の公開反映をE2Eで確認
  - `lint + unit + e2e + build` の結果を記録
- ブランチ例: `feature/admin-store-management-e2e`
- テスト:
  - unit: 必要に応じて追加
  - e2e: 必須
- DoD:
  - 仕様書の受け入れ条件 1-5 を主要導線として確認できる
  - `bun run lint` / `bun run test` / `bun run e2e` / `bun run build` が通過
- ステータス:
  - 完了（2026-02-24）
- 実行コマンド:
  - `bun run lint -- --ignore-pattern '.wrangler/**' --ignore-pattern 'test-results/**'`
  - `bun run test`
  - `bun run e2e`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass（79 tests）
  - e2e: pass（16 tests）
  - build: pass

## 補足
- 管理者メニュー導線は既存ログイン導線との整合を確認し、UI配置を過剰に拡張しない。
- 画像アップロードは本機能外とし、初期は画像URL配列の手入力で運用する。

## 変更履歴
- 2026-02-24: 初版作成
