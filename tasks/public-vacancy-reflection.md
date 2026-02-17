# 公開画面への空席反映機能 実装TODO

## 参照
- 仕様: `docs/specs/features/public-vacancy-reflection.md`
- 計画: `plans/public-vacancy-reflection.md`

## タスク一覧

### TASK-PVR-001: 反映ロジック共通化
- 内容:
  - 最新有効レコード選択ロジックを共通化
  - `available/unavailable` 導出を実装
  - 期限切れ/レコードなし時の `unavailable` フォールバックを実装
- ブランチ例: `feature/public-vacancy-reflection-core`
- テスト:
  - unit: 必須（最新判定、期限判定、導出）
  - e2e: 不要（後続タスクで実施）
- DoD:
  - 仕様書の機能要件 1,2,3,4 を満たす
- ステータス:
  - 完了（2026-02-17）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass（`src/features/public-vacancy-reflection/vacancy-status.test.ts` を含む）
  - build: pass

### TASK-PVR-002: トップ/詳細への反映
- 内容:
  - トップ画面データ取得へ反映
  - 店舗詳細データ取得へ反映
  - 同一店で状態が一致することを担保
- ブランチ例: `feature/public-vacancy-reflection-pages`
- テスト:
  - unit: 必須（取得層/マッピング）
  - e2e: 任意（主要導線はTASK-PVR-003で実施）
- DoD:
  - 仕様書の機能要件 5,6,7 を満たす
- ステータス:
  - 完了（2026-02-17）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass（`src/features/public-vacancy-reflection/public-store-resolver.test.ts` を含む）
  - build: pass

### TASK-PVR-003: 主要導線E2Eと仕上げ
- 内容:
  - トップ表示と詳細表示の状態一致をE2Eで検証
  - 空席のみフィルタの反映状態をE2Eで検証
  - lint + unit + e2e + build を実行し結果を記録
- ブランチ例: `feature/public-vacancy-reflection-e2e`
- テスト:
  - unit: 必要に応じて追加
  - e2e: 必須
- DoD:
  - 仕様書の受け入れ条件 1-5 を主要導線として確認できる
  - `bun run lint` / `bun run test` / `bun run e2e` / `bun run build` が通過
- ステータス:
  - 完了（2026-02-17）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run e2e`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass
  - e2e: pass（空席フィルタ反映、トップ/詳細状態一致を確認）
  - build: pass

## 補足
- 本タスク群では表示反映を優先し、キャッシュ最適化は次フェーズで扱う。

## 変更履歴
- 2026-02-17: 初版作成
- 2026-02-17: TASK-PVR-001 の完了判定（実行コマンド・結果）を追記
- 2026-02-17: TASK-PVR-002 の完了判定（実行コマンド・結果）を追記
- 2026-02-17: TASK-PVR-003 の完了判定（実行コマンド・結果）を追記
