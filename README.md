# RISTORANTE MITSUHIKO - 食べログスタイル口コミサイト

イタリアンレストラン「RISTORANTE MITSUHIKO（リストランテ ミツヒコ）」の口コミサイトです。Tabelog 風のデザインで、ユーザーはログインなしで口コミを投稿できます。

![Restaurant Hero](/assets/restaurant-interior.png)

## 技術スタック

- **フロントエンド**: HTML, CSS, JavaScript (Vanilla)
- **バックエンド**: Cloudflare Pages Functions (Workers)
- **データベース**: Cloudflare D1 (SQLite)
- **ホスティング**: Cloudflare Pages

## 機能

✅ レストラン情報の表示  
✅ シェフプロフィール  
✅ メニュー紹介  
✅ 口コミ一覧表示  
✅ ログインなしで口コミ投稿  
✅ 5 段階評価システム  
✅ レスポンシブデザイン  
✅ データ永続化（D1 データベース）

## ローカル開発環境のセットアップ

### 1. Wrangler のインストール

```bash
npm install -g wrangler
```

### 2. Cloudflare アカウントでログイン

```bash
wrangler login
```

### 3. D1 データベースの作成

```bash
wrangler d1 create mitsuhiko-reviews
```

作成後、表示される`database_id`を`wrangler.toml`の該当箇所に記入してください。

### 4. データベーススキーマの作成

```bash
wrangler d1 execute mitsuhiko-reviews --local --file=schema.sql
```

### 5. シードデータの投入

```bash
wrangler d1 execute mitsuhiko-reviews --local --file=seed.sql
```

### 6. ローカル開発サーバーの起動

```bash
wrangler pages dev . --d1=DB=mitsuhiko-reviews
```

ブラウザで `http://localhost:8788` を開いてサイトを確認できます。

## Cloudflare へのデプロイ

### 1. D1 データベースの作成（本番環境）

```bash
wrangler d1 create mitsuhiko-reviews
```

### 2. 本番環境のスキーマとシードデータを作成

```bash
# スキーマ作成
wrangler d1 execute mitsuhiko-reviews --remote --file=schema.sql

# シードデータ投入
wrangler d1 execute mitsuhiko-reviews --remote --file=seed.sql
```

### 3. Cloudflare Pages へのデプロイ

#### オプション A: Wrangler 経由

```bash
wrangler pages deploy . --project-name=restaurante-mitsuhiko
```

#### オプション B: Cloudflare Dashboard 経由

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Pages** → **Create a project** → **Connect to Git** または **Direct Upload**
3. プロジェクトをアップロード
4. **Settings** → **Functions** → **D1 database bindings**
5. 変数名: `DB`、D1 データベース: `mitsuhiko-reviews` を選択
6. 保存してデプロイ

### 4. D1 データベースのバインディング設定

Cloudflare Dashboard で:

1. Pages プロジェクトを選択
2. **Settings** → **Functions**
3. **D1 database bindings** で以下を追加:
   - Variable name: `DB`
   - D1 database: `mitsuhiko-reviews`

## プロジェクト構造

```
/
├── index.html              # メインHTML
├── styles.css              # スタイルシート
├── script.js               # フロントエンドJavaScript
├── wrangler.toml          # Cloudflare設定
├── schema.sql             # データベーススキーマ
├── seed.sql               # 初期データ
├── assets/                # 画像ファイル
│   ├── chef-mitsuhiko.jpg
│   ├── restaurant-exterior.png
│   ├── restaurant-interior.png
│   ├── dish-pasta.png
│   ├── dish-risotto.png
│   └── dish-dessert.png
└── functions/
    └── api/
        └── reviews.js     # API エンドポイント
```

## API エンドポイント

### GET /api/reviews

全ての口コミを取得

**レスポンス:**

```json
{
  "reviews": [
    {
      "id": 1,
      "reviewer_name": "田中 美香",
      "rating": 5,
      "comment": "記念日ディナーで利用しました...",
      "visit_date": "2025-01-15",
      "created_at": "2025-01-16 10:30:00"
    }
  ]
}
```

### POST /api/reviews

新しい口コミを投稿

**リクエストボディ:**

```json
{
  "reviewer_name": "山田太郎",
  "rating": 5,
  "comment": "素晴らしいレストランでした",
  "visit_date": "2025-01-20"
}
```

**レスポンス:**

```json
{
  "success": true,
  "id": 16
}
```

## データベーススキーマ

```sql
CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reviewer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    visit_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Cloudflare 無料枠の制限

- **D1**: 5GB ストレージ、5M reads/日、100K writes/日
- **Workers**: 100K リクエスト/日
- **Pages**: 無制限の静的リクエスト

この制限内で十分に運用可能です。

## 開発のヒント

### ローカルで D1 データをリセットする

```bash
wrangler d1 execute mitsuhiko-reviews --local --command="DROP TABLE IF EXISTS reviews"
wrangler d1 execute mitsuhiko-reviews --local --file=schema.sql
wrangler d1 execute mitsuhiko-reviews --local --file=seed.sql
```

### D1 データベースの中身を確認

```bash
wrangler d1 execute mitsuhiko-reviews --local --command="SELECT * FROM reviews"
```

## トラブルシューティング

### 「DB is not defined」エラー

- `wrangler.toml`に D1 バインディングが正しく設定されているか確認
- ローカル開発時は `--d1=DB=mitsuhiko-reviews` オプションを付けているか確認

### 口コミが表示されない

- ブラウザの開発者ツールで API 呼び出しを確認
- データベースにデータが入っているか確認

## ライセンス

This project is for demonstration purposes only.

---

**注意**: この店舗は架空のレストランです。
