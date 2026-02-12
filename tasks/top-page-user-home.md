# トップ画面（公開ユーザー向け）実装TODO

## 参照
- 仕様: `docs/specs/features/top-page-user-home.md`
- 計画: `plans/top-page-user-home.md`

## タスク一覧

### TASK-TP-001: 画面骨格とデザイン実装
- 内容:
  - `src/app/page.tsx` をトップ画面仕様に沿って再構成
  - ヒーロー、検索UI、店舗一覧、空状態UIを実装
  - `src/features/top-page/` にUIコンポーネントを分割
  - 固定モックデータで一覧表示を成立させる
  - 検索初期値を「空席のみ: ON」「市区町村/ジャンル: 未選択」に設定
- ブランチ例: `feature/top-page-home-layout`
- テスト:
  - unit: 実施済み（レビュー指摘対応として `utils` の回帰テストを追加）
  - e2e: 不要（後続TASKで主要導線をまとめて実施）
- DoD:
  - 画面構成が仕様書の「機能要件 1,4,5」を満たす
- ステータス:
  - 完了（2026-02-12）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
- 結果要約:
  - lint: pass
  - unit: pass（`src/features/top-page/utils.test.ts` を含む）
- E2E不要判断（TASK-TP-001時点）:
  - 本タスクは画面骨格とデザイン実装が目的であり、主要導線E2Eは `TASK-TP-003` で実施する計画のため、現時点では未実施として妥当。

### TASK-TP-002: 検索・並び順ロジック実装
- 内容:
  - 市区町村/ジャンル/空席のみの条件処理を実装
  - 空席優先 + 更新日時降順の並び順ロジックを実装
  - 0件時判定を実装
  - 取得層を差し替え可能な構成に整理し、モック依存を解消
- ブランチ例: `feature/top-page-filter-sort`
- テスト:
  - unit: 必須（Vitest）
  - e2e: 任意（主要導線はTASK-TP-003で実施）
- DoD:
  - 仕様書の「機能要件 2,3,5」を満たす
  - 関連unitテストが通過
- ステータス:
  - 完了（2026-02-12）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass（`src/features/top-page/utils.test.ts` で条件正規化と並び順を検証）
  - build: pass
- E2E実施有無（TASK-TP-002時点）:
  - 未実施（任意）。主要導線のE2Eは `TASK-TP-003` で実施予定。

### TASK-TP-003: 主要導線E2Eと仕上げ
- 内容:
  - `/` -> 条件指定 -> `/stores/[storeId]` 遷移のE2Eを追加
  - 未確定仕様を整理し、必要なら仕様へフィードバック
  - lint + unit + e2e を実行して結果を記録
- ブランチ例: `feature/top-page-main-flow-e2e`
- テスト:
  - unit: 必要に応じて追加
  - e2e: 必須（Playwright）
- DoD:
  - 仕様書の受け入れ条件 1-5 を主要導線として確認できる
  - `bun run lint` と関連テストが通過
- ステータス:
  - 完了（2026-02-12）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run e2e`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass
  - e2e: pass（`/` -> 条件指定 -> `/stores/3` 遷移を確認）
  - build: pass
- 仕様フィードバック:
  - 地図表示位置は「店舗詳細画面で表示」として仕様確定済み。

## 補足
- 仕様未確定事項はTASK単位で最終確認し、確定できない場合は別タスクを起票する。

## 変更履歴
- 2026-02-12: 初版作成
- 2026-02-12: 店舗詳細URL確定、検索初期値、モック先行方針をタスクへ反映
- 2026-02-12: TASK-TP-001 の完了判定（実行コマンド・結果・E2E不要判断）を追記
- 2026-02-12: TASK-TP-002 の完了判定（実行コマンド・結果・E2E実施有無）を追記
- 2026-02-12: TASK-TP-003 の完了判定（実行コマンド・結果・仕様フィードバック）を追記
- 2026-02-12: 地図表示位置の仕様確定（店舗詳細画面）を反映
