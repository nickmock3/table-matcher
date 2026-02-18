# Google認証（ログイン）機能 実装計画

## 1. 対象仕様
- 仕様書: `docs/specs/features/auth-google-signin.md`
- 対象範囲: 店舗ユーザー/管理者向けGoogleログイン導線、セッション確認、ログアウト導線、運用手順整備

## 2. 実装方針
- 認証コアは既存 `src/lib/auth/server.ts` を継続利用する。
- `src/app` は導線と表示に留め、認証呼び出しロジックは `src/features/auth/` に集約する。
- Google実連携は手動確認を主とし、E2Eは環境依存を避ける範囲で実施する。

## 3. 成果物
- 店舗ユーザー/管理者向けログイン/ログアウト導線UI
- セッション状態表示（未ログイン/ログイン済み）
- 認証エラー時のユーザー向け表示
- unit/e2eテスト
- セットアップ手順更新

## 4. 実装ステップ
1. 認証導線の要件を画面単位で定義（ログインボタン配置、状態表示位置）。
2. `src/features/auth/` にクライアント側認証操作（signIn/signOut/getSession）を実装。
3. ログイン画面またはヘッダー導線へ反映。
4. 認証失敗時表示を実装（503/失敗応答の表示）。
5. 公開導線がログイン不要で維持されることを確認。
6. unitテスト追加（環境分岐/エラーハンドリング）。
7. E2E追加（主要導線の表示確認、ログイン状態UI分岐）。
8. `lint + unit + e2e + build` を実行してDoD確認。

## 5. テスト計画
- lint: `bun run lint`
- unit: `bun run test`
- e2e: `bun run e2e`（Google実ログインは手動確認を補完）
- build: `bun run build`

## 6. リスクと対策
- リスク: Google OAuth実連携は環境依存で自動テストが不安定。
- 対策: 自動E2Eは導線/状態表示中心、実ログイン成功は手動確認手順を明記。

- リスク: 環境ごとのredirect URI不一致。
- 対策: `.env.example` / `docs/setup.md` を正本としてURIを一元管理。

## 7. 完了条件（DoD）
- 仕様書の受け入れ条件 1-4 を満たす。
- `spec + plan + tasks` の整合が取れている。
- `bun run lint` / `bun run test` / 必要e2e / `bun run build` が通過。

## 8. 変更履歴
- 2026-02-18: 初版作成
