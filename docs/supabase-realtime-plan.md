# Supabase Realtime Plan

このメモは、ローカル試作を公開アプリへ移すための設計メモです。

## 方針

- 画面上はまず `main` の1部屋だけで運用する
- DBは最初から `room_id` を持たせ、あとから部屋を追加できる形にする
- 状態の正本は Supabase Postgres に置く
- UIは Supabase Realtime の変更通知を受けて更新する
- スピーカーレバーの細かい移動だけ、必要なら Realtime Broadcast を併用する

## テーブル

- `rooms`
  - お題、左右ラベル、現在のアクティブスピーカー
- `speakers`
  - スピーカー名、丸文字、色、現在値、表示順
- `audience_votes`
  - 視聴者ごとの投票値

## アプリ側の対応予定

1. `@supabase/supabase-js` を追加する
2. `.env.local` に Supabase URL と anon key を入れる
3. `useSyncedMeetingState` の保存先を localStorage から Supabase に差し替える
4. `rooms`, `speakers`, `audience_votes` の変更を Realtime 購読する
5. レバー操作は値を間引いてDB更新する
6. 必要ならレバー操作中だけ Broadcast で即時感を足す

## 権限について

現時点の `supabase/schema.sql` は、まず動作確認しやすい公開プロトタイプ向けのRLSです。

- 誰でも読む
- 誰でも書く

本番で荒らし対策を強める場合は、次のどちらかに移行します。

- ホスト操作だけ Server Action 経由にする
- Supabase Auth / Discord OAuth を使って権限管理する

まずはDiscord内の限定共有で動作確認し、そのあと必要に応じて固くするのが現実的です。

## 追加ルーム

将来 `sub` などの部屋を追加する場合は、`rooms` に1行追加し、対応する `speakers` を追加します。

例:

```sql
insert into public.rooms (id, name, topic, left_label, right_label)
values ('sub', 'サブ会場', '今日のお題', '左', '右');
```
