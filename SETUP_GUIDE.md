# エイブリック調整システム - セットアップガイド

このガイドでは、Google Calendar APIと連携してシステムを動作させる手順を説明します。

## 前提条件

- Node.js 18以上
- Googleアカウント
- Google Cloud Projectへのアクセス権限

## ステップ1: Google Cloud Projectの設定

### 1.1 プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成または既存のプロジェクトを選択
3. プロジェクト名: `calendar-scheduler` (任意)

### 1.2 Google Calendar APIの有効化

1. 左メニューから「APIとサービス」→「ライブラリ」を選択
2. 検索ボックスに「Google Calendar API」と入力
3. 「Google Calendar API」をクリック
4. 「有効にする」ボタンをクリック

### 1.3 OAuth 2.0認証情報の作成

#### OAuth同意画面の設定

1. 「APIとサービス」→「OAuth同意画面」を選択
2. **User Type**:
   - 内部利用のみ: 「内部」を選択
   - 外部ユーザーも使用: 「外部」を選択
3. アプリ情報を入力:
   - **アプリ名**: エイブリック調整システム
   - **ユーザーサポートメール**: あなたのメールアドレス
   - **デベロッパーの連絡先情報**: あなたのメールアドレス
4. 「保存して次へ」をクリック

#### スコープの設定

1. 「スコープを追加または削除」をクリック
2. 以下のスコープを選択:
   - `https://www.googleapis.com/auth/calendar.readonly` (カレンダーの読み取り)
   - `https://www.googleapis.com/auth/calendar.events` (イベントの作成・編集)
3. 「更新」→「保存して次へ」をクリック

#### テストユーザーの追加（外部を選択した場合）

1. テストユーザーのメールアドレスを追加
2. システムを使用する全員のメールアドレスを登録

#### OAuth 2.0 クライアントIDの作成

1. 「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuth クライアント ID」をクリック
3. **アプリケーションの種類**: 「ウェブアプリケーション」を選択
4. **名前**: Calendar Scheduler Web Client
5. **承認済みのJavaScript生成元**に追加:
   ```
   http://localhost:3000
   ```
6. **承認済みのリダイレクトURI**に追加:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. 「作成」をクリック
8. 表示されるダイアログで:
   - **クライアントID**をコピー
   - **クライアントシークレット**をコピー

## ステップ2: プロジェクトのセットアップ

### 2.1 依存パッケージのインストール

```bash
cd calendar-scheduler
npm install
```

### 2.2 環境変数の設定

プロジェクトルートの`.env.local`ファイルを編集:

```env
# Google Cloud Consoleから取得した情報を設定
GOOGLE_CLIENT_ID=あなたのクライアントID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=あなたのクライアントシークレット

# NextAuth設定（既に設定されています）
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=hPCy2CM/br/TF5CQpozm2qjuyzy5Mrn4ZjNftp3szAs=

# 開発環境
NODE_ENV=development
```

**重要**:
- `GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`を実際の値に置き換えてください
- `.env.local`はGitにコミットしないでください（`.gitignore`に含まれています）

## ステップ3: メンバー情報の設定

実際のカレンダーと連携するため、メンバー情報を更新します。

`lib/data/sampleData.ts`を編集:

```typescript
export const sampleMembers: Member[] = [
  {
    id: 'member-1',
    name: '山田 太郎',
    email: 'yamada@yourcompany.com',  // 実際のGmailアドレス
    calendarId: 'yamada@yourcompany.com',  // 通常はメールアドレスと同じ
    color: '#4285F4',
  },
  // チームメンバーを追加...
];
```

**カレンダーIDの確認方法**:
1. Googleカレンダーを開く
2. 左側のカレンダーリストで対象カレンダーの設定を開く
3. 「カレンダーの統合」セクションの「カレンダーID」をコピー

## ステップ4: 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## ステップ5: 初回ログイン

1. 「Googleでログイン」ボタンをクリック
2. Googleアカウントを選択
3. 権限のリクエストを確認:
   - Googleカレンダーの予定を表示
   - Googleカレンダーのイベントを作成・編集
4. 「許可」をクリック

## 使い方

### 基本的な流れ

1. **日時を選択**: カレンダーと時刻を指定
2. **参加者を選択**: チェックボックスで参加者を選ぶ
   - 自動的に空き状況が表示されます
   - 「空き」= その時間帯に予定なし
   - 「予定あり」= その時間帯に既存の予定がある
3. **テンプレートを選択**: 予定の種類を選ぶ
4. **予定を作成**: 右サイドバーで確認して作成ボタンをクリック

### 予定作成後

- 参加者全員にGoogleカレンダーの招待メールが送信されます
- ログインユーザーのカレンダーに予定が作成されます
- 各参加者は招待を承諾・辞退できます

## トラブルシューティング

### 「認証エラー」が表示される

**原因**: OAuth設定が正しくない

**解決方法**:
1. Google Cloud Consoleで認証情報を確認
2. リダイレクトURIが `http://localhost:3000/api/auth/callback/google` と完全一致しているか確認
3. `.env.local`の`GOOGLE_CLIENT_ID`と`GOOGLE_CLIENT_SECRET`が正しいか確認

### 「カレンダーイベントの取得に失敗しました」

**原因**: カレンダーへのアクセス権限がない

**解決方法**:
1. メンバーのカレンダーIDが正しいか確認
2. メンバーが自分のカレンダーをログインユーザーと共有しているか確認
3. Google Calendar APIのスコープが正しく設定されているか確認

### 空き状況が表示されない

**原因**: カレンダー共有設定の問題

**解決方法**:

**方法1: カレンダーを共有する**
1. 各メンバーがGoogleカレンダーを開く
2. 左側のカレンダーリストで自分のカレンダーの設定を開く
3. 「特定のユーザーと共有」でログインユーザーを追加
4. 権限を「予定の表示（すべての予定の詳細）」に設定

**方法2: サービスアカウントを使用する**（推奨: チーム利用の場合）
1. Google Cloud Consoleでサービスアカウントを作成
2. 各メンバーがカレンダーをサービスアカウントと共有
3. `auth.ts`でサービスアカウント認証に切り替え

詳細は [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md) を参照してください。

### 「イベントの作成に失敗しました」

**原因**: カレンダーの書き込み権限がない

**解決方法**:
1. ログインユーザーが自分のカレンダーに書き込み権限を持っているか確認
2. OAuth スコープに `calendar.events` が含まれているか確認
3. 一度ログアウトして再度ログインし、権限を再承認

### ポート3000が使用中

**解決方法**:
```bash
PORT=3001 npm run dev
```

その後、`.env.local`の`NEXTAUTH_URL`も更新:
```env
NEXTAUTH_URL=http://localhost:3001
```

## 本番環境へのデプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com)でプロジェクトをインポート
2. 環境変数を設定:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_URL` (例: `https://your-domain.vercel.app`)
   - `NEXTAUTH_SECRET`
3. Google Cloud Consoleで承認済みのリダイレクトURIを追加:
   - `https://your-domain.vercel.app/api/auth/callback/google`

### その他のホスティングサービス

Next.js対応の任意のプラットフォームで動作します:
- Netlify
- AWS Amplify
- Railway
- Render

環境変数の設定とリダイレクトURIの更新を忘れずに行ってください。

## セキュリティ上の注意

1. `.env.local`は絶対にGitリポジトリにコミットしないでください
2. `NEXTAUTH_SECRET`は本番環境で別の値に変更してください
3. OAuth同意画面を「公開」にする前に、セキュリティレビューを実施してください
4. サービスアカウントのJSONキーファイルは安全に保管してください

## サポート

問題が発生した場合:
1. [Google Calendar API ドキュメント](https://developers.google.com/calendar/api/guides/overview)
2. [NextAuth.js ドキュメント](https://next-auth.js.org/)
3. プロジェクトの `GOOGLE_CALENDAR_SETUP.md` を参照
