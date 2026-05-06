# Supabase Setup

この手順は、ローカル試作をSupabaseに接続する前の準備です。

## 1. Supabaseプロジェクトを作る

1. Supabaseにログインする
2. 新しいプロジェクトを作成する
3. Project name は例として `shirokuro-kaigi`
4. Region は日本に近いものを選ぶ
5. Database password は保管しておく
6. プロジェクトの作成完了まで待つ

## 2. SQLを実行する

Supabase Dashboardで対象プロジェクトを開きます。

1. 左メニューの SQL Editor を開く
2. New query を作成
3. このリポジトリの `supabase/schema.sql` をすべてコピーする
4. SQL Editorに貼り付ける
5. Run を押す

成功すると、以下のテーブルができます。

- `rooms`
- `speakers`
- `audience_votes`

初期データとして `main` 部屋とスピーカー5人も作成されます。

## 3. API情報を取得する

Supabase Dashboardで以下を取得します。

- Project URL
- Publishable key

取得場所は、プロジェクトの Connect dialog または Settings > API Keys です。

Supabaseの現在の推奨は `sb_publishable_...` 形式の publishable key です。
古い `anon` key でも動作しますが、これから接続するコードでは publishable key を使います。

## 4. `.env.local` を作る

プロジェクト直下に `.env.local` を作成し、以下を入れます。

```env
NEXT_PUBLIC_SUPABASE_URL=ここにProject URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=ここにPublishable key
```

例:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxx
```

`.env.local` はGitに保存しません。

## 5. Codexに伝えるもの

次の実装に進むとき、チャットには秘密情報を貼らなくて大丈夫です。

必要なのは次のどちらかです。

- `.env.local` を作成できた
- SQLを実行できた

この2つが終わったら、アプリ側に Supabase 接続コードを追加できます。

## 6. 接続後にやること

接続後は次の順番で進めます。

1. Supabaseクライアントを追加
2. `main` 部屋を読み込む
3. スピーカー値の更新をSupabaseへ保存
4. 視聴者投票をSupabaseへ保存
5. Realtime購読で別端末へ反映

`.env.local` を作成または変更した後は、Next.jsの開発サーバーを再起動します。

```powershell
Ctrl + C
npm run dev
```
