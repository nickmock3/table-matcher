# 店舗ユーザー向け画像管理 実装TODO

## 参照
- 仕様: `docs/specs/features/store-user-image-management.md`
- 計画: `plans/store-user-image-management.md`

## タスク一覧

### TASK-SUIM-001: 画像管理API基盤（認可・バリデーション）
- 内容:
  - `src/features/store-user-image-management/` に画像入力スキーマを追加
  - 店舗ユーザー認可つき画像アップロードAPIを実装（R2保存）
  - 店舗ユーザー認可つき画像取得/更新APIを実装
  - `stores.image_urls` の配列/JSON変換を共通化
- ブランチ例: `feature/store-user-image-management-api-foundation`
- テスト:
  - unit: 必須（スキーマ、認可、変換、アップロード制約）
  - e2e: 不要
- DoD:
  - 仕様書の機能要件 1,2,3,4,7,8,9 を満たす
- ステータス:
  - 完了（2026-02-25）
- 実行コマンド:
  - `bun run test -- src/features/store-user-image-management/image-management-input.test.ts src/features/store-user-image-management/image-storage.test.ts src/features/store-user-image-management/store-image-access.test.ts`
  - `bun run lint -- src/app/api/shop/images/route.ts src/app/api/shop/images/upload/route.ts 'src/app/api/store-images/[...path]/route.ts' src/features/store-user-image-management/image-management-input.ts src/features/store-user-image-management/image-storage.ts src/features/store-user-image-management/store-image-access.ts`
  - `bun run build`
- 結果要約:
  - unit: pass（17 tests）
  - lint: pass
  - build: pass

### TASK-SUIM-002: 店舗ユーザー画像管理画面
- 内容:
  - `/shop/images` 画面を実装
  - 画像アップロード/削除/並び替え（ドラッグ&ドロップ）/保存を実装
  - バリデーションエラー・保存成功メッセージを実装
- ブランチ例: `feature/store-user-image-management-ui`
- テスト:
  - unit: 必須（表示モデル、操作ロジック）
  - e2e: 任意（主要導線は次タスク）
- DoD:
  - 仕様書の機能要件 3,4,5 を満たす

### TASK-SUIM-003: 公開反映E2Eと仕上げ
- 内容:
  - 店舗ユーザー画像アップロード/更新 -> 店舗詳細反映のE2Eを追加
  - 未ログイン/他ロール拒否（401/403）の主要ケースを追加
  - lint + unit + e2e + build 実行結果を記録
- ブランチ例: `feature/store-user-image-management-e2e`
- テスト:
  - unit: 必要に応じて追加
  - e2e: 必須
- DoD:
  - 仕様書の受け入れ条件 1-6 を主要導線として確認できる
  - `bun run lint` / `bun run test` / `bun run e2e` / `bun run build` が通過

## 補足
- 本タスクでR2アップロードを扱う（MVPはAPI経由アップロード）。
- 将来の改善候補として、署名付きURL方式を検討する。

## 変更履歴
- 2026-02-25: 初版作成
- 2026-02-25: 画像追加方式をR2アップロード前提に更新
