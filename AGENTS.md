# AGENTS.md

このファイルは、AIエージェントが本プロジェクトで作業する際の実行ルールです。  
開発方針の正本は `docs/development-policy.md` とし、ここでは実行時の要点のみ定義します。

## 1. 基本方針
- `docs/development-policy.md` を最優先で参照する。
- 仕様未確定の機能は実装しない。まず仕様策定を行う。
- パス表記はプロジェクトルート基準の相対パスで記載する。

## 2. 開発フロー（必須）
1. `docs/specs/features/` に機能仕様書を作成・合意
2. `plans/` に機能実装計画を作成
3. `tasks/` に実装TODOを作成
4. 上記3点が揃ってから実装

## 3. ブランチ運用
- 1ブランチ = 1タスク
- 命名: `feature/<feature-name>-<task-name>`
- 命名は kebab-case

## 4. テスト方針
- Unit: `Vitest`（テストファイルは実コード直近）
- E2E: `Playwright`（初期は主要導線のみ）
- タスクごとに unit/e2e の要否を `tasks/` に明記

## 5. DoD / レビュー
- DoDはタスク単位
- `spec + plan + tasks` の整合を必須
- 検証は `lint + 関連unit + 必要e2e`
- AIレビューを全PRで必須
- マージ条件はAIレビュー完了
- PR本文に以下を必須記載
  - 実行コマンド
  - 結果要約
  - AIレビュー所見と対応結果

## 6. リリース運用
- 環境区分: `dev / demo / prod`
- 日常確認は `dev`
- クライアント確認・中間成果物提出は `demo`
- 本番公開は `prod`
- 詳細手順は `docs/development-policy.md` の 6.7 を参照

## 7. 例外運用
- Hotfixでも事前AIレビュー必須
- AIブロック指摘の例外マージは、理由とフォローアップ記録を必須とする
