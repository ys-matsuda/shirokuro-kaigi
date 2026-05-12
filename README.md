# 白黒つけない会議

Discordなどの通話・配信で、正解や勝敗を決めずに感覚の分布と揺れを楽しむためのプロトタイプです。

## 起動

```powershell
npm install
npm run dev
```

PowerShellの実行ポリシーで止まる場合は、`npm.cmd` を使ってください。

```powershell
npm.cmd install
npm.cmd run dev
```

起動後、ブラウザで `http://localhost:3000` を開きます。

## 主なURL

- `/`: 会議作成ページ
- `/room/[roomId]`: 発行された会議URLのエントランス
- `/room/[roomId]/speaker`: その会議のスピーカー操作
- `/room/[roomId]/audience`: その会議の視聴者参加
- `/room/[roomId]/stage`: その会議の16:9画面共有
- `/speaker` `/audience` `/stage`: 従来の固定ルーム用ページ

## 構成

- `src/config/app.ts`: アプリ名、ルーム名、メーター角度、音量、色などの調整値
- `src/data/initialState.ts`: 初期お題、最大5人のスピーカー、サンプル分布
- `src/components`: 画面コンポーネント
- `src/components/RoomCreatePageView.tsx`: 会議URLの発行ページ
- `src/components/EntryPageView.tsx`: ルームごとのエントランス
- `src/hooks/useTickSound.ts`: Web Audio APIのカチカチ音
- `src/hooks/useSyncedMeetingState.ts`: ルームIDごとの同期状態
- `src/services/supabaseRooms.ts`: Supabaseへの会議作成処理
- `src/utils/meterMath.ts`: アークメーターの座標計算
- `src/utils/formatOpinionLabel.ts`: 表示ラベルや空気感の整形

## ルーム作成

トップページでホストキーを解除すると、48時間有効な会議URLを発行できます。

既存のSupabaseプロジェクトでは、会議の有効期限を保存するために一度だけ以下をSQL Editorで実行してください。

```sql
alter table public.rooms
  add column if not exists expires_at timestamptz;

create index if not exists rooms_expires_at_idx
  on public.rooms(expires_at)
  where expires_at is not null;
```

## 配信用画面

画面上部の配信用ステージは16:9固定です。Discordで画面共有するときは、このステージが収まるようにブラウザ幅やズームを調整してください。

「配信全画面」ボタンを押すと、操作パネルを隠して16:9ステージだけを表示します。可能なブラウザではそのままフルスクリーンになります。終了は右上の「終了」ボタン、またはEscキーです。

## 試作用キー

- ホストキー: `.env.local` の `NEXT_PUBLIC_HOST_KEY`
- スピーカーキー: `.env.local` の `NEXT_PUBLIC_SPEAKER_KEY`

ホスト操作は初期状態でロックされます。スピーカーページの「ホスト権限」にホストキーを入力すると、お題変更、初期化、スピーカー管理が使えます。
スピーカー操作も初期状態でロックされます。スピーカーページの「スピーカー権限」にスピーカーキーを入力すると、レバー操作が使えます。

本番ではこの簡易キーをSupabase Auth、Discord OAuth、ルームごとの招待トークンなどに差し替える想定です。

## スピーカー管理

ホスト操作の「スピーカー管理」から、スピーカーを1〜5人の範囲で追加・削除できます。表示名と丸アイコン内の文字も編集でき、削除したスピーカーは配信用ステージと操作レバーから表示されません。
