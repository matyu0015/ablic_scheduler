# カレンダー調整システム

複数人のGoogleカレンダーと連携し、空き状況を確認しながら予定を調整できるWebアプリケーションです。

## 主な機能

- **複数人のカレンダー連携**: チームメンバーのGoogleカレンダーと連携
- **空き状況の確認**: 指定時間に誰が空いているかを一目で確認
- **テンプレート管理**: 予定内容ごとにカスタマイズ可能なテンプレート
- **予定の作成**: 選択したテンプレートで参加者全員に招待を送信

## 技術スタック

- **フロントエンド**: Next.js 16 + TypeScript + Tailwind CSS
- **カレンダー連携**: Google Calendar API
- **状態管理**: Zustand
- **日時処理**: date-fns

## セットアップ

### 1. プロジェクトのクローン

```bash
cd calendar-scheduler
npm install
```

### 2. Google Calendar APIの設定

詳細な手順は [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md) を参照してください。

簡単な手順:
1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Google Calendar APIを有効化
3. OAuth 2.0クライアントIDを作成
4. 認証情報をダウンロード

### 3. 環境変数の設定

`.env.local`ファイルを作成し、以下の内容を追加:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 使い方

### プロトタイプモード（現在の状態）

現在はプロトタイプモードで動作します。実際のGoogleカレンダー連携なしで、UIとフローを確認できます。

1. **日時を選択**: カレンダーから日付と時間帯を選択
2. **参加者を選択**: 参加させたいメンバーをチェック
3. **テンプレートを選択**: 予定の種類に応じたテンプレートを選択
4. **予定を作成**: 右サイドバーで内容を確認して作成

### 本番モード（Google Calendar連携後）

Google Calendar APIの設定完了後:
1. メンバー情報に実際のカレンダーIDを設定
2. OAuth認証を実装
3. API Routes (`app/api/*`) を実装
4. リアルタイムで空き状況を取得

## プロジェクト構造

```
calendar-scheduler/
├── app/                      # Next.js App Router
│   ├── page.tsx             # メインページ
│   ├── layout.tsx           # レイアウト
│   └── globals.css          # グローバルスタイル
├── lib/
│   ├── types/               # TypeScript型定義
│   │   └── index.ts
│   ├── data/                # サンプルデータ
│   │   └── sampleData.ts
│   └── utils/               # ユーティリティ関数
│       └── calendarUtils.ts
├── components/              # Reactコンポーネント
│   ├── calendar/           # カレンダー関連コンポーネント
│   └── templates/          # テンプレート関連コンポーネント
├── GOOGLE_CALENDAR_SETUP.md # Google Calendar API設定ガイド
└── README.md               # このファイル
```

## カスタマイズ

### メンバーの追加

`lib/data/sampleData.ts`を編集:

```typescript
export const sampleMembers: Member[] = [
  {
    id: 'member-1',
    name: '山田 太郎',
    email: 'yamada@example.com',
    calendarId: 'yamada@example.com', // 実際のGoogleカレンダーID
    color: '#4285F4',
  },
  // 新しいメンバーを追加
];
```

### テンプレートの追加

`lib/data/sampleData.ts`を編集:

```typescript
export const eventTemplates: EventTemplate[] = [
  {
    id: 'template-new',
    name: '新しいテンプレート',
    summary: 'カスタム会議',
    description: '説明文',
    duration: 60,
    reminderMinutes: [30],
    color: '#4285F4',
  },
  // 既存のテンプレート...
];
```

## 今後の実装予定

### Phase 2: Google Calendar API連携
- [ ] OAuth 2.0認証の実装
- [ ] カレンダーイベントの取得API
- [ ] リアルタイム空き状況確認
- [ ] イベント作成API

### Phase 3: 高度な機能
- [ ] 複数の時間帯候補の提案
- [ ] 全員が空いている時間帯の自動検索
- [ ] 定期的な予定の作成
- [ ] リマインダーのカスタマイズ
- [ ] カレンダービューの追加

### Phase 4: データベース連携
- [ ] メンバー情報の永続化
- [ ] テンプレートのCRUD操作
- [ ] 予定履歴の保存
- [ ] ユーザー認証

## トラブルシューティング

### ポート3000が使用中の場合

別のポートで起動:
```bash
PORT=3001 npm run dev
```

### TypeScriptエラーが出る場合

型定義を再生成:
```bash
npm run build
```

### スタイルが適用されない場合

Tailwind CSSの設定を確認:
```bash
npx tailwindcss init -p
```

## 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Google Calendar API](https://developers.google.com/calendar/api/guides/overview)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [date-fns](https://date-fns.org/)

## ライセンス

MIT

## 開発者

作成日: 2026-04-16
