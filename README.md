# 食う・寝る・起きる

生活リズムをワンボタンで記録するシンプルなWebアプリケーション。

## 機能

- **ログイン/新規登録**: メールアドレスとパスワードでの認証
- **メイン画面**: 「食う」「寝る」「起きる」のワンボタン記録
- **履歴画面**: 記録の閲覧、編集、削除、新規登録
- **レスポンシブデザイン**: スマートフォン・タブレット・PC対応

## 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript
- **バックエンド**: Node.js + Express
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **ホスティング**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトのURLと匿名キーを取得
3. `.env`ファイルを作成:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
```

### 3. データベース設定

SupabaseのSQLエディタで `database.sql` を実行:

```sql
-- database.sqlの内容を実行
```

### 4. ローカル開発サーバーの起動

```bash
npm run dev
```

アプリが `http://localhost:3000` で起動します。

## デプロイ

### Vercelへのデプロイ

1. Vercelにプロジェクトをインポート
2. 環境変数を設定:
   - `SUPABASE_URL`: SupabaseプロジェクトURL
   - `SUPABASE_ANON_KEY`: Supabase匿名キー

3. デプロイが自動的に実行されます

## ファイル構成

```
├── public/
│   ├── index.html          # ログイン画面
│   ├── main.html           # メイン画面
│   ├── history.html        # 履歴画面
│   ├── auth.js             # 認証機能
│   ├── main.js             # メイン画面機能
│   ├── history.js          # 履歴画面機能
│   └── styles.css          # スタイルシート
├── for-dev/
│   ├── prompt.md           # 開発要件
│   ├── task.md             # 開発タスク
│   └── report.md           # 仮の値レポート
├── server.js               # Expressサーバー
├── package.json            # 依存関係
├── vercel.json             # Vercel設定
├── database.sql            # データベーススキーマ
└── README.md               # このファイル
```

## 使用方法

1. **新規登録**: メールアドレスとパスワードでアカウント作成
2. **ログイン**: 登録したメールアドレスとパスワードでログイン
3. **記録**: メイン画面で「食う」「寝る」「起きる」ボタンをタップ
4. **管理**: 履歴画面で過去の記録を編集・削除・新規登録

## 注意事項

- 仮の値 (`xxxxx`) は実際のSupabase設定に置き換える必要があります
- 本番環境では適切な環境変数を設定してください
- データベースのRLS（行レベルセキュリティ）が有効になっています

## ライセンス

MIT License
