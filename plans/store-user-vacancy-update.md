# 店舗ユーザー空席更新機能 実装計画

## 1. 対象仕様
- 仕様書: `docs/specs/features/store-user-vacancy-update.md`
- 対象範囲: 店舗ユーザーの空席更新UI/API、認可制御、更新履歴保存

## 2. 実装方針
- 画面エントリは `src/app` 側に置き、業務ロジックは `src/features/store-vacancy-update/` 配下へ集約する。
- 認証は Better Auth セッションを利用し、認可は `store_user_links` で判定する。
- 更新は `seat_status_updates` にappend-onlyで保存し、最新状態は最新レコード参照で解決する。

## 3. 成果物
- 店舗ユーザー向け空席更新画面
- 空席更新APIルート
- 認可付き更新ユースケース
- `expiresAt` 計算ユーティリティ
- unit/e2eテスト

## 4. 実装ステップ
1. `src/features/store-vacancy-update/` の型・ユースケース骨格を作成。
2. APIルートを追加し、認証/認可/入力検証を実装。
3. `seat_status_updates` 保存処理を実装（+30分有効期限）。
4. 店舗ユーザー向け更新画面を実装（現在状態表示、更新操作、結果通知）。
5. Unitテストを追加（バリデーション、認可、expiresAt）。
6. E2Eを追加（ログイン -> 更新 -> 成功表示）。
7. lint + unit + e2e + build を実行してDoD確認。

## 5. テスト計画
- lint: `bun run lint`
- unit: `Vitest`（認可・バリデーション・期限計算）
- e2e: `Playwright`（主要導線）

## 6. リスクと対策
- リスク: 店舗ユーザー導線URL未確定で画面導線が変わる可能性。
- 対策: URLは仮置きで実装し、確定時に `spec/tasks` を同時更新。

- リスク: ローカルで認証済みE2Eを安定実行しづらい。
- 対策: 認証モック/テスト専用フィクスチャを用意して段階検証する。

## 7. 完了条件（DoD）
- `docs/specs/features/store-user-vacancy-update.md` の受け入れ条件を満たす。
- `spec + plan + tasks` の整合が取れている。
- `bun run lint` と関連unit、必要e2e、`bun run build` が通過している。
- AIレビューでブロッカー指摘がない、または対応方針が記録されている。

## 8. 変更履歴
- 2026-02-16: 初版作成
