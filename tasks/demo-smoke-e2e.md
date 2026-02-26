# 中間提出向けスモークE2E 実装TODO

## 参照
- 計画: `plans/demo-smoke-e2e.md`
- 仕様（既存参照）:
  - `docs/specs/features/admin-store-management.md`
  - `docs/specs/features/store-user-image-management.md`
  - `docs/specs/features/store-detail-user.md`

## タスク一覧

### TASK-DSE-001: スモークE2Eシナリオ実装
- 内容:
  - `e2e/demo-smoke.spec.ts` を追加
  - 管理者 -> 店舗ユーザー -> 公開画面の連続シナリオを実装
  - 店舗ユーザーに紐づく既存店舗を対象にし、変更は finally で復元して干渉を回避
- ブランチ例: `feature/demo-smoke-e2e-flow`
- テスト:
  - unit: 不要
  - e2e: 必須（`e2e/demo-smoke.spec.ts`）
- DoD:
  - スモークシナリオで中間提出用主要導線を確認できる
- ステータス:
  - 完了（2026-02-26）
- 実行コマンド:
  - `bun run lint -- e2e/demo-smoke.spec.ts`
  - `bun run e2e -- e2e/demo-smoke.spec.ts`
- 結果要約:
  - lint: pass
  - e2e: pass（1 test）

### TASK-DSE-002: 検証実行と結果記録
- 内容:
  - lint + 関連unit + スモークe2e + build を実行
  - 実行結果を本ファイルへ記録
  - 必要なら失敗時のログ/注意点を補足へ追記
- ブランチ例: `feature/demo-smoke-e2e-verify`
- テスト:
  - unit: 必要に応じて追加
  - e2e: 必須
- DoD:
  - `bun run lint` / 関連unit / `bun run e2e -- e2e/demo-smoke.spec.ts` / `bun run build` が通過
  - 実行コマンドと結果要約が記録されている
- ステータス:
  - 完了（2026-02-26）
- 実行コマンド:
  - `bun run lint -- --ignore-pattern '.wrangler/**' --ignore-pattern 'test-results/**'`
  - `bun run test -- src/features/admin-store-management/admin-auth.test.ts src/features/store-user-image-management/shop-image-auth.test.ts src/features/store-user-image-management/shop-image-management-view.test.ts src/features/store-user-image-management/image-management-input.test.ts src/features/store-user-image-management/image-storage.test.ts src/features/store-user-image-management/store-image-access.test.ts src/features/store-detail/store-detail.test.ts src/features/public-vacancy-reflection/public-store-resolver.test.ts`
  - `bun run e2e -- e2e/demo-smoke.spec.ts`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass（51 tests）
  - e2e: pass（1 test）
  - build: pass

## 補足
- 本タスクは中間提出の説明可能性を高めるためのスモーク確認が目的。
- 網羅的なE2E拡張は別タスクで扱う。

## 変更履歴
- 2026-02-26: 初版作成
