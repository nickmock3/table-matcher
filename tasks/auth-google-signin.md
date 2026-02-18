# Google認証（ログイン）機能 実装TODO

## 参照
- 仕様: `docs/specs/features/auth-google-signin.md`
- 計画: `plans/auth-google-signin.md`

## タスク一覧

### TASK-AUTH-001: 認証導線とセッション表示
- 内容:
  - 店舗ユーザー/管理者向けログイン導線（Googleログイン開始ボタン）を実装
  - ログイン状態/未ログイン状態の表示を実装
  - ログアウト導線を実装
- ブランチ例: `feature/auth-login-entry`
- テスト:
  - unit: 任意（表示ロジックが分離される場合）
  - e2e: 不要（後続TASKで実施）
- DoD:
  - 仕様書の機能要件 1,2,3 を満たす

### TASK-AUTH-002: エラーハンドリングと環境分岐整理
- 内容:
  - 認証未設定/失敗時の表示と再試行導線を実装
  - baseURL/redirectURIの分岐ロジックを見直し
  - unitテストを追加（分岐・エラーケース）
- ブランチ例: `feature/auth-error-handling`
- テスト:
  - unit: 必須（分岐・エラー）
  - e2e: 任意
- DoD:
  - 仕様書の機能要件 4 を満たす

### TASK-AUTH-003: 主要導線E2Eと手順仕上げ
- 内容:
  - ログイン/ログアウト導線のE2Eを追加（自動化可能な範囲）
  - 公開導線がログイン不要であることをE2Eで確認
  - 実Googleログイン手動確認手順を `docs/setup.md` に整理
  - lint + unit + e2e + build の結果を記録
- ブランチ例: `feature/auth-main-flow-e2e`
- テスト:
  - unit: 必要に応じて追加
  - e2e: 必須
- DoD:
  - 仕様書の受け入れ条件 1-4 を主要導線として確認できる
  - `bun run lint` / `bun run test` / `bun run e2e` / `bun run build` が通過

## 補足
- Google実ログインの完全自動化は環境依存のため、手動確認を併用する。

## 変更履歴
- 2026-02-18: 初版作成
