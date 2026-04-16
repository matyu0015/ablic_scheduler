// メンバー情報の型定義
export interface Member {
  id: string;
  name: string;
  email: string;
  calendarId: string; // Googleカレンダーのカレンダ ID
  color?: string; // 表示用の色
}

// カレンダーイベントの型定義
export interface CalendarEvent {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  attendees?: string[];
  description?: string;
  location?: string;
}

// 空き状況の型定義
export interface Availability {
  memberId: string;
  memberName: string;
  isAvailable: boolean;
  busySlots: TimeSlot[];
}

// 時間帯の型定義
export interface TimeSlot {
  start: Date;
  end: Date;
}

// テンプレートの型定義
export interface EventTemplate {
  id: string;
  name: string; // テンプレート名（例: "定例会議", "1on1", "プロジェクトMTG"）
  summary: string; // イベントのタイトル
  description?: string; // イベントの説明
  location?: string; // 場所またはURL（Zoomリンクなど）
  duration: number; // デフォルトの所要時間（分）
  reminderMinutes?: number[]; // リマインダー設定（開始前の分数）
  color?: string; // カレンダー上の色
}

// 予定作成リクエストの型定義
export interface CreateEventRequest {
  templateId: string;
  startTime: Date;
  endTime: Date;
  attendeeIds: string[]; // 参加者のMember ID
  customTitle?: string; // テンプレートのタイトルをカスタマイズする場合
  customDescription?: string;
  customLocation?: string;
}

// 空き状況検索パラメータの型定義
export interface AvailabilitySearchParams {
  startDate: Date;
  endDate: Date;
  duration: number; // 必要な時間（分）
  memberIds: string[]; // 検索対象のメンバー
}
