# 店舗ユーザー空席更新機能 実装TODO

## 参照
- 仕様: `docs/specs/features/store-user-vacancy-update.md`
- 計画: `plans/store-user-vacancy-update.md`

## タスク一覧

### TASK-SVU-001: 更新API基盤（認証・認可・保存）
- 内容:
  - 空席更新APIを追加
  - 認証（401）/認可（403）を実装
  - `seat_status_updates` への保存と `expiresAt +30分` を実装
- ブランチ例: `feature/store-vacancy-update-api`
- テスト:
  - unit: 必須（認可判定、バリデーション、expiresAt）
  - e2e: 不要（後続TASKで実施）
- DoD:
  - 仕様書の機能要件 1,2,3,4,6,7 を満たす
- ステータス:
  - 完了（2026-02-16）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass（`src/features/store-vacancy-update/update-seat-status.test.ts` を含む）
  - build: pass

### TASK-SVU-002: 店舗ユーザー更新画面
- 内容:
  - 店舗ユーザー向け空席更新画面を実装
  - 現在状態/有効期限の表示
  - 更新成功・失敗フィードバックUI
- ブランチ例: `feature/store-vacancy-update-ui`
- テスト:
  - unit: 任意（表示整形ロジックがある場合）
  - e2e: 任意（主要導線はTASK-SVU-003で実施）
- DoD:
  - 仕様書の機能要件 5 を満たす
- ステータス:
  - 完了（2026-02-16）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass
  - build: pass

### TASK-SVU-003: 主要導線E2Eと仕上げ
- 内容:
  - ログイン -> 更新画面 -> 空席更新成功のE2Eを追加
  - 401/403系のケースを可能な範囲で検証
  - lint + unit + e2e + build 実行結果を記録
  - 未決定事項（URL、反映方式）の確定案を仕様へ反映
- ブランチ例: `feature/store-vacancy-update-main-flow-e2e`
- テスト:
  - unit: 必要に応じて追加
  - e2e: 必須（Playwright）
- DoD:
  - 仕様書の受け入れ条件 1-5 を主要導線として確認できる
  - `bun run lint` / 関連テスト / `bun run build` が通過
- ステータス:
  - 完了（2026-02-16）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run e2e`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass
  - e2e: pass（空席更新主要導線、未認証エラー表示を確認）
  - build: pass
- 仕様フィードバック:
  - 店舗ユーザー画面URLは `/shop/seat-status` で確定。
  - 公開画面反映方式は次フェーズDB連携時に SSR 再取得を基本方針として確定。

## 補足
- 認証連携の段階では、ローカル検証が難しいケースを想定してテストフィクスチャを用意する。

## 変更履歴
- 2026-02-16: 初版作成
- 2026-02-16: TASK-SVU-001 の完了判定（実行コマンド・結果）を追記
- 2026-02-16: TASK-SVU-002 の完了判定（実行コマンド・結果）を追記
- 2026-02-16: TASK-SVU-003 の完了判定（実行コマンド・結果・仕様フィードバック）を追記
