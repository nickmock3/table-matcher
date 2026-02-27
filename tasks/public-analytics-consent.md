# 公開ユーザー計測（同意管理付き）実装TODO

## 参照
- 仕様: `docs/specs/features/public-analytics-consent.md`
- 計画: `plans/public-analytics-consent.md`

## タスク一覧

### TASK-PAC-001: 同意管理（バナー/保存/再設定）
- 内容:
  - 公開画面共通で同意バナーを表示
  - 許可/拒否を保存するAPIと永続化を実装
  - 同意状態の再設定導線（フッター等）を実装
- ブランチ例: `feature/public-analytics-consent-banner`
- テスト:
  - unit: 必須（同意状態判定、保存payload検証）
  - e2e: 必須（初回表示、許可/拒否保存、再設定）
- DoD:
  - 受け入れ条件 1,4 を満たす
- ステータス:
  - 完了（2026-02-27）
- 実行コマンド:
  - `bun run db:generate`
  - `bun run db:migrate:local`
  - `bun run lint -- src/app/layout.tsx src/app/api/public/analytics/consent/route.ts src/features/public-analytics-consent/consent-cookie.ts src/features/public-analytics-consent/consent-model.ts src/features/public-analytics-consent/components/PublicAnalyticsConsentBanner.tsx src/features/public-analytics-consent/consent-model.test.ts e2e/public-analytics-consent.spec.ts`
  - `bun run test -- src/features/public-analytics-consent/consent-model.test.ts`
  - `bun run e2e -- e2e/public-analytics-consent.spec.ts`
  - `bun run build`
- 結果要約:
  - migration: pass（`analytics_consents` 追加）
  - lint: pass
  - unit: pass（9 tests）
  - e2e: pass（1 test）
  - build: pass

### TASK-PAC-002: 閲覧イベント収集API（最小）
- 内容:
  - `page_view_events` 保存APIを実装
  - payload検証（`storeId`, `path`, `occurredAt`, `sessionId`）
  - `anonId` は同意APIで管理するCookieから解決して保存
  - 重複判定用キー生成ロジックを追加
- ブランチ例: `feature/public-analytics-page-view-api`
- テスト:
  - unit: 必須（バリデーション、重複判定キー）
  - e2e: 任意（API直叩きで代替可）
- DoD:
  - 受け入れ条件 2,3,5 を満たすためのAPIが成立
- ステータス:
  - 完了（2026-02-27）
- 実行コマンド:
  - `bun run db:generate`
  - `bun run db:migrate:local`
  - `bun run lint -- src/lib/db/schema.ts src/app/api/public/analytics/page-view/route.ts src/features/public-analytics-consent/page-view-input.ts src/features/public-analytics-consent/page-view-input.test.ts`
  - `bun run test -- src/features/public-analytics-consent/page-view-input.test.ts`
  - `bun run build`
- 結果要約:
  - migration: pass（`page_view_events` 追加、重複防止ユニークインデックス追加）
  - lint: pass
  - unit: pass（7 tests）
  - build: pass

### TASK-PAC-003: 同意連動の送信制御（公開画面）
- 内容:
  - 公開トップ/店舗詳細で同意状態に応じた送信制御を実装
  - `accepted` のみ送信、`rejected`/未確定は非送信
  - 送信失敗時の非ブロッキング動作を実装
- ブランチ例: `feature/public-analytics-client-tracking`
- テスト:
  - unit: 必須（送信条件分岐）
  - e2e: 必須（許可時送信、拒否時未送信）
- DoD:
  - 受け入れ条件 2,3,4 を満たす
- ステータス:
  - 完了（2026-02-27）
- 実行コマンド:
  - `bun run lint -- src/app/layout.tsx src/features/public-analytics-consent/components/PublicPageViewTracker.tsx src/features/public-analytics-consent/page-view-tracking.ts src/features/public-analytics-consent/page-view-tracking.test.ts e2e/public-analytics-page-view-tracking.spec.ts`
  - `bun run test -- src/features/public-analytics-consent/page-view-tracking.test.ts`
  - `bun run e2e -- e2e/public-analytics-page-view-tracking.spec.ts`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass（4 tests）
  - e2e: pass（2 tests）
  - build: pass

### TASK-PAC-004: 検証実行と結果記録
- 内容:
  - lint + 関連unit + 必要e2e + build を実行
  - 実行結果を本ファイルへ記録
- ブランチ例: `feature/public-analytics-verify`
- テスト:
  - unit: 必要に応じて追加
  - e2e: 必須
- DoD:
  - `bun run lint` / 関連unit / 必要e2e / `bun run build` が通過
  - 実行コマンドと結果要約が記録されている
- ステータス:
  - 未着手

## 補足
- 分配計算ロジック（日次集計、配分率、管理者取り分）は別タスクで実施する。

## 変更履歴
- 2026-02-27: 初版作成
