# 公開画面への空席反映機能 実装計画

## 1. 対象仕様
- 仕様書: `docs/specs/features/public-vacancy-reflection.md`
- 対象範囲: トップ/詳細の空席状態を更新履歴ベースで反映

## 2. 実装方針
- 反映ロジックは `src/features` 配下に共通化し、トップ/詳細から再利用する。
- データ取得層で `seat_status_updates` を参照し、`vacancyStatus` を導出して画面に渡す。
- レコード選択は `createdAt DESC, id DESC`、有効期限条件は `expiresAt > now` を採用する。
- レコードなし/期限切れ時は `unavailable` を返す。

## 3. 成果物
- 公開表示向け空席状態解決ユーティリティ
- トップ画面データ取得の反映対応
- 店舗詳細画面データ取得の反映対応
- unitテスト
- 主要導線E2E

## 4. 実装ステップ
1. 空席状態解決ロジックを `src/features` 配下へ新規作成。
2. トップ画面取得層に反映ロジックを適用。
3. 店舗詳細の店舗解決に反映ロジックを適用。
4. unitテストを追加（最新判定/期限判定/導出結果）。
5. E2Eを追加（トップと詳細の状態一致確認）。
6. lint + unit + e2e + build を実行。

## 5. テスト計画
- lint: `bun run lint`
- unit: `bun run test`
- e2e: `bun run e2e`
- build: `bun run build`

## 6. リスクと対策
- リスク: 既存モック構造とDB参照の接続で状態不整合が起きる。
- 対策: 画面表示前の共通導出関数を単一化し、unitで固定化する。

- リスク: e2eで認証/更新連携まで含めると不安定。
- 対策: 反映検証はモック応答で導線重視、統合は段階的に追加する。

## 7. 完了条件（DoD）
- 仕様書の受け入れ条件 1-5 を満たす。
- トップ/詳細で同一店の空席状態が一致する。
- `bun run lint` / `bun run test` / `bun run e2e` / `bun run build` が通過。
- `spec + plan + tasks` の整合が取れている。

## 8. 変更履歴
- 2026-02-17: 初版作成
