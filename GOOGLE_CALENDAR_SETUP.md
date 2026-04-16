# Google Calendar API 設定ガイド

このドキュメントでは、Google Calendar APIを使用してカレンダー連携を行うための設定手順を説明します。

## 1. Google Cloud Projectの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト名を入力（例: "Calendar Scheduler"）

## 2. Google Calendar APIの有効化

1. Google Cloud Consoleのダッシュボードで「APIとサービス」→「ライブラリ」を選択
2. 「Google Calendar API」を検索
3. 「有効にする」をクリック

## 3. OAuth 2.0クライアントIDの作成

### 3.1 OAuth同意画面の設定

1. 「APIとサービス」→「OAuth同意画面」を選択
2. ユーザータイプを選択（内部利用の場合は「内部」）
3. アプリ情報を入力:
   - アプリ名: Calendar Scheduler
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先情報: あなたのメールアドレス
4. スコープの追加:
   - `https://www.googleapis.com/auth/calendar.readonly` (カレンダーの読み取り)
   - `https://www.googleapis.com/auth/calendar.events` (イベントの作成・編集)

### 3.2 認証情報の作成

1. 「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuth クライアント ID」を選択
3. アプリケーションの種類で「ウェブアプリケーション」を選択
4. 名前を入力（例: "Calendar Scheduler Web Client"）
5. 承認済みのJavaScript生成元を追加:
   - `http://localhost:3000`
   - `http://localhost:3000/` (本番環境のURLも追加)
6. 承認済みのリダイレクトURIを追加:
   - `http://localhost:3000/api/auth/callback/google`
7. 「作成」をクリック

### 3.3 認証情報のダウンロード

1. 作成したOAuth 2.0クライアントIDの横にあるダウンロードアイコンをクリック
2. JSONファイルがダウンロードされます
3. ファイル名を`credentials.json`に変更

## 4. 環境変数の設定

プロジェクトのルートディレクトリに`.env.local`ファイルを作成し、以下の内容を追加:

```env
# Google Calendar API認証情報
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# NextAuth設定（使用する場合）
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

`credentials.json`から以下の情報を取得して設定してください:
- `GOOGLE_CLIENT_ID`: `web.client_id`の値
- `GOOGLE_CLIENT_SECRET`: `web.client_secret`の値

## 5. APIの使用例

### カレンダーイベントの取得

```typescript
import { google } from 'googleapis';

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

const response = await calendar.events.list({
  calendarId: 'primary',
  timeMin: new Date().toISOString(),
  maxResults: 10,
  singleEvents: true,
  orderBy: 'startTime',
});

const events = response.data.items;
```

### イベントの作成

```typescript
const event = {
  summary: 'チーム会議',
  location: 'Zoom',
  description: '週次の進捗共有',
  start: {
    dateTime: '2025-04-20T10:00:00+09:00',
    timeZone: 'Asia/Tokyo',
  },
  end: {
    dateTime: '2025-04-20T11:00:00+09:00',
    timeZone: 'Asia/Tokyo',
  },
  attendees: [
    { email: 'member1@example.com' },
    { email: 'member2@example.com' },
  ],
  reminders: {
    useDefault: false,
    overrides: [
      { method: 'email', minutes: 24 * 60 },
      { method: 'popup', minutes: 10 },
    ],
  },
};

await calendar.events.insert({
  calendarId: 'primary',
  resource: event,
  sendUpdates: 'all', // 参加者全員に通知
});
```

## 6. 複数カレンダーの取得

チーム全員のカレンダーを取得するには、各メンバーが:
1. Google Workspaceの管理者によってカレンダー共有設定を行う
2. またはOAuth認証を各自で行う

### カレンダーIDの取得

```typescript
const calendarList = await calendar.calendarList.list();
const calendars = calendarList.data.items;

calendars.forEach(cal => {
  console.log(`Name: ${cal.summary}, ID: ${cal.id}`);
});
```

## 7. サービスアカウントの使用（推奨）

チーム全体でカレンダーを管理する場合は、サービスアカウントの使用を推奨します。

### 7.1 サービスアカウントの作成

1. Google Cloud Consoleで「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「サービスアカウント」を選択
3. サービスアカウント名を入力
4. 作成後、JSONキーファイルをダウンロード
5. ファイルを`service-account-key.json`として保存

### 7.2 カレンダーの共有

各メンバーは自分のGoogleカレンダーをサービスアカウントと共有する必要があります:
1. Googleカレンダーを開く
2. 左側のメニューで共有したいカレンダーの設定を開く
3. 「特定のユーザーと共有」でサービスアカウントのメールアドレスを追加
4. 権限を「予定の表示（すべての予定の詳細）」または「予定の変更」に設定

### 7.3 サービスアカウントでの認証

```typescript
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  keyFile: 'service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });
```

## 8. テスト

設定が完了したら、APIエンドポイントをテストしてください:

```bash
npm run dev
```

ブラウザで`http://localhost:3000`にアクセスし、カレンダー連携機能をテストします。

## トラブルシューティング

### エラー: "Access blocked: This app's request is invalid"

- OAuth同意画面の設定を確認
- テストユーザーを追加（外部公開でない場合）

### エラー: "Invalid grant"

- リダイレクトURIが正しく設定されているか確認
- タイムゾーンの設定を確認

### カレンダーが取得できない

- カレンダーの共有設定を確認
- APIスコープが正しいか確認
- カレンダーIDが正しいか確認

## 参考リンク

- [Google Calendar API ドキュメント](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 認証](https://developers.google.com/identity/protocols/oauth2)
- [googleapis Node.js クライアント](https://github.com/googleapis/google-api-nodejs-client)
