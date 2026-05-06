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

## 構成

- `src/config/app.ts`: アプリ名、ルーム名、メーター角度、音量、色などの調整値
- `src/data/initialState.ts`: 初期お題、最大5人のスピーカー、サンプル分布
- `src/components`: 画面コンポーネント
- `src/hooks/useTickSound.ts`: Web Audio APIのカチカチ音
- `src/utils/meterMath.ts`: アークメーターの座標計算
- `src/utils/formatOpinionLabel.ts`: 表示ラベルや空気感の整形

## 配信用画面

画面上部の配信用ステージは16:9固定です。Discordで画面共有するときは、このステージが収まるようにブラウザ幅やズームを調整してください。

「配信全画面」ボタンを押すと、操作パネルを隠して16:9ステージだけを表示します。可能なブラウザではそのままフルスクリーンになります。終了は右上の「終了」ボタン、またはEscキーです。

## 試作用キー

- ホストキー: `host-demo`
- スピーカーキー: `speaker-demo`

本番ではこのローカルキーをSupabase Auth、Discord OAuth、ルームごとの招待トークンなどに差し替える想定です。

## スピーカー管理

ホスト操作の「スピーカー管理」から、スピーカーを1〜5人の範囲で追加・削除できます。表示名と丸アイコン内の文字も編集でき、削除したスピーカーは配信用ステージと操作レバーから表示されません。
