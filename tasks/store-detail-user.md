# 店舗詳細画面（公開ユーザー向け）実装TODO

## 参照
- 仕様: `docs/specs/features/store-detail-user.md`
- 計画: `plans/store-detail-user.md`

## タスク一覧

### TASK-SD-001: 詳細画面骨格と導線整備
- 内容:
  - `/stores/[storeId]` のUI骨格を仕様に合わせて整理
  - 一覧へ戻る導線、外部予約CTA（行動ボタン）を配置
  - バナー広告領域（仮置きプレースホルダー）を配置
  - 店舗画像を1〜10枚想定の横スクロール表示（ドット付き）で仮実装
  - `src/features/store-detail/` にコンポーネント分割
- ブランチ例: `feature/store-detail-layout`
- テスト:
  - unit: 任意（静的表示中心）
  - e2e: 不要（後続TASKで実施）
- DoD:
  - 仕様書の機能要件 3,4,5,7 を満たす
- ステータス:
  - 完了（2026-02-13）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass
  - build: pass

### TASK-SD-002: データ解決と地図表示領域実装
- 内容:
  - `storeId` 解決ロジックの明確化（存在/非存在）
  - 404処理を整備
  - 地図表示領域とフォールバックUIを実装
- ブランチ例: `feature/store-detail-data-map`
- テスト:
  - unit: 必須（存在判定、フォールバック判定）
  - e2e: 任意（主要導線はTASK-SD-003で実施）
- DoD:
  - 仕様書の機能要件 1,2,6 を満たす
  - 関連unitテストが通過
- ステータス:
  - 完了（2026-02-13）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass（`src/features/store-detail/store-detail.test.ts` を含む）
  - build: pass

### TASK-SD-003: 主要導線E2Eと仕上げ
- 内容:
  - `/` -> `/stores/[storeId]` -> 戻る/予約CTA（行動ボタン） のE2Eを追加
  - 広告領域プレースホルダー表示のE2E確認を追加
  - lint + unit + e2e + build 実行結果を記録
  - 残る未決定事項（地図表示方式・予約リンク仕様）の確定案を仕様へ反映
- ブランチ例: `feature/store-detail-main-flow-e2e`
- テスト:
  - unit: 必要に応じて追加
  - e2e: 必須（Playwright）
- DoD:
  - 仕様書の受け入れ条件 1-6 を主要導線として確認できる
  - `bun run lint` / 関連テスト / `bun run build` が通過
- ステータス:
  - 完了（2026-02-13）
- 実行コマンド:
  - `bun run lint`
  - `bun run test`
  - `bun run e2e`
  - `bun run build`
- 結果要約:
  - lint: pass
  - unit: pass
  - e2e: pass（一覧->詳細->戻る/予約CTA/広告表示、404表示を確認）
  - build: pass
- 仕様フィードバック:
  - 地図表示方式はGoogle Maps Embedで確定。
  - 外部予約リンク遷移は新規タブ固定で確定。

## 補足
- 地図API本接続は外部依存があるため、まずフォールバック成立を優先し段階導入する。
- 広告配信タグは未導入のため、初期は固定プレースホルダーで領域のみ確保する。

## 変更履歴
- 2026-02-13: 初版作成
- 2026-02-13: バナー広告領域（仮置き）タスクを追加
- 2026-02-13: TASK-SD-001 の完了判定（実行コマンド・結果）を追記
- 2026-02-13: TASK-SD-002 の完了判定（実行コマンド・結果）を追記
- 2026-02-13: TASK-SD-003 の完了判定（実行コマンド・結果・仕様フィードバック）を追記
