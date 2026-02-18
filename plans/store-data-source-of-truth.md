# 店舗情報のDB正本化 実装計画

## 1. 対象仕様
- 仕様書: `docs/specs/features/store-data-source-of-truth.md`
- 対象範囲: storesスキーマ拡張と画面参照元のDB統一

## 2. 実装方針
- `stores` に必要カラムを追加し、既存画面はDB由来モデルを経由して描画する。
- `mockStoreRepository` はテスト/開発補助用途に限定し、本番導線の参照元から除外する。
- 変換ロジックは `src/features/store-data/` に集約し、トップ/詳細/店舗ユーザー画面で再利用する。

## 3. 成果物
- DBマイグレーション（stores拡張）
- stores -> 表示モデル変換ユーティリティ
- トップ/詳細/店舗ユーザー画面の参照元切替
- unit/e2eテスト

## 4. 実装ステップ
1. `stores` スキーマとマイグレーションを追加。
2. `image_urls` パースを含む変換ユーティリティを実装。
3. 公開トップ画面のデータ取得をDB正本化。
4. 店舗詳細画面のデータ取得をDB正本化。
5. 店舗ユーザー空席更新画面の店舗表示情報をDB正本化。
6. モック補完ロジックを撤去し、フォールバック表示を整理。
7. unit/e2e追加、lint/test/e2e/build実行。

## 5. テスト計画
- lint: `bun run lint`
- unit: `bun run test`
- e2e: `bun run e2e`
- build: `bun run build`

## 6. リスクと対策
- リスク: 既存データに新カラムがなく表示崩れ
- 対策: 全新カラムをnullableで導入し、UIフォールバックで吸収

- リスク: `image_urls` JSON不整合
- 対策: 変換層で安全パースし、失敗時は空配列へフォールバック

## 7. 完了条件（DoD）
- 仕様書の受け入れ条件 1-5 を満たす。
- 主要画面がDB正本のみで成立する。
- `bun run lint` / `bun run test` / `bun run e2e` / `bun run build` が通過する。
- `spec + plan + tasks` の整合が取れている。

## 8. 変更履歴
- 2026-02-17: 初版作成
