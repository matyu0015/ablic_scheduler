import { EventTemplate, Member } from '@/lib/types';

// サンプルのイベントテンプレート
export const eventTemplates: EventTemplate[] = [
  {
    id: 'template-1',
    name: '定例会議',
    summary: 'チーム定例会議',
    description: '週次の進捗共有とディスカッション',
    duration: 60,
    reminderMinutes: [30, 10],
    color: '#4285F4',
  },
  {
    id: 'template-2',
    name: '1on1ミーティング',
    summary: '1on1',
    description: '個別の進捗確認とフィードバック',
    duration: 30,
    reminderMinutes: [15],
    color: '#0B8043',
  },
  {
    id: 'template-3',
    name: 'プロジェクトMTG',
    summary: 'プロジェクト定例',
    description: 'プロジェクトの進捗共有と課題確認',
    location: 'Zoom: https://zoom.us/j/example',
    duration: 90,
    reminderMinutes: [30, 10],
    color: '#F4B400',
  },
  {
    id: 'template-4',
    name: 'レビュー会',
    summary: 'コードレビュー会',
    description: 'コードレビューとベストプラクティス共有',
    duration: 45,
    reminderMinutes: [15],
    color: '#E67C73',
  },
  {
    id: 'template-5',
    name: 'ブレストセッション',
    summary: 'アイデアブレスト',
    description: '新機能や改善案のブレインストーミング',
    duration: 120,
    reminderMinutes: [60, 10],
    color: '#9E69AF',
  },
];

// サンプルのメンバーデータ（実際のカレンダーIDは要設定）
export const sampleMembers: Member[] = [
  {
    id: 'member-1',
    name: '山田 太郎',
    email: 'yamada@example.com',
    calendarId: 'yamada@example.com', // 実際のGoogleカレンダーIDに置き換える
    color: '#4285F4',
  },
  {
    id: 'member-2',
    name: '佐藤 花子',
    email: 'sato@example.com',
    calendarId: 'sato@example.com',
    color: '#0B8043',
  },
  {
    id: 'member-3',
    name: '鈴木 一郎',
    email: 'suzuki@example.com',
    calendarId: 'suzuki@example.com',
    color: '#F4B400',
  },
  {
    id: 'member-4',
    name: '田中 美咲',
    email: 'tanaka@example.com',
    calendarId: 'tanaka@example.com',
    color: '#E67C73',
  },
  {
    id: 'member-5',
    name: '高橋 健太',
    email: 'takahashi@example.com',
    calendarId: 'takahashi@example.com',
    color: '#9E69AF',
  },
];
