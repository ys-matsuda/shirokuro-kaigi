# GitHub / Vercel Deploy Guide

## 現在の前提

- GitHubアカウント作成済み
- Supabaseプロジェクト作成済み
- Supabase SQL実行済み
- ローカル同期確認済み
- `.env.local` はローカル専用で、GitHubには上げない

## 1. GitHubでリポジトリを作る

1. GitHubで New repository を開く
2. Repository name を決める
   - 例: `shirokuro-kaigi`
3. Visibility は最初は `Private` 推奨
4. README / .gitignore / license は追加しない
5. Create repository を押す

作成後、GitHubに表示される HTTPS URL を使います。

例:

```text
https://github.com/ユーザー名/shirokuro-kaigi.git
```

## 2. ローカルからGitHubへpushする

PowerShellで実行します。

```powershell
cd C:\Users\owoox\Desktop\codex\consensus-meter
git remote add origin https://github.com/ユーザー名/shirokuro-kaigi.git
git branch -M main
git push -u origin main
```

すでに `origin` があると言われた場合:

```powershell
git remote set-url origin https://github.com/ユーザー名/shirokuro-kaigi.git
git push -u origin main
```

## 3. VercelでImportする

1. VercelにGitHubでログインする
2. Add New Project を押す
3. GitHubの `shirokuro-kaigi` リポジトリをImportする
4. Framework Preset が `Next.js` になっていることを確認する
5. Build Command は `npm run build`
6. Install Command は `npm install`

## 4. Vercelに環境変数を入れる

VercelのProject Settings > Environment Variables に追加します。

```env
NEXT_PUBLIC_SUPABASE_URL=SupabaseのProject URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SupabaseのPublishable key
```

Environmentはまず `Production` / `Preview` / `Development` すべてに入れておくと楽です。

## 5. Deployする

Deployを実行します。

成功すると以下のようなURLができます。

```text
https://shirokuro-kaigi.vercel.app
```

## 6. 公開後テスト

- `/speaker` をPCで開く
- `/stage` を別タブで開く
- `/audience` をスマホで開く
- レバー、投票、お題変更が同期するか確認する

## 注意

- `.env.local` はGitHubにpushしない
- Supabaseの `service_role` key とDB passwordは絶対に公開しない
- 最初はGitHubリポジトリをPrivateにする
