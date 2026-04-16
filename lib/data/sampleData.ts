import { EventTemplate, Member } from '@/lib/types';

// サンプルのイベントテンプレート
export const eventTemplates: EventTemplate[] = [
  {
    id: 'template-1',
    name: 'カジュアル面談',
    summary: 'カジュアル面談',
    description: '会社説明や質疑応答を含むカジュアルな面談',
    duration: 60,
    reminderMinutes: [30, 10],
    color: '#4285F4',
  },
  {
    id: 'template-2',
    name: '内定者面談',
    summary: '内定者面談',
    description: '入社前の面談とオリエンテーション',
    duration: 30,
    reminderMinutes: [15],
    color: '#0B8043',
  },
  {
    id: 'template-3',
    name: '技術面接',
    summary: '技術面接',
    description: '技術スキルの確認と質疑応答',
    location: 'Zoom: https://zoom.us/j/example',
    duration: 90,
    reminderMinutes: [30, 10],
    color: '#F4B400',
  },
  {
    id: 'template-4',
    name: '会社説明会',
    summary: '会社説明会',
    description: '会社概要や事業内容、働き方についての説明',
    duration: 45,
    reminderMinutes: [15],
    color: '#E67C73',
  },
  {
    id: 'template-5',
    name: '最終面接',
    summary: '最終面接',
    description: '役員面接および最終的な意思確認',
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
  {
    id: 'member-6',
    name: '中目 日南子',
    email: 'tohei0518@gmail.com',
    calendarId: 'tohei0518@gmail.com',
    color: '#D50000',
  },
  {
    id: 'member-7',
    name: 'テクノ 太郎',
    email: 'Nakanome.Hinako@tebrco.com',
    calendarId: 'Nakanome.Hinako@tebrco.com',
    color: '#039BE5',
  },
];
