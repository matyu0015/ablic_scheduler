'use client';

import { useState, useEffect } from 'react';
import { eventTemplates, sampleMembers } from '@/lib/data/sampleData';
import { Member, EventTemplate, Availability } from '@/lib/types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { signIn, signOut, useSession } from 'next-auth/react';

interface CalendarItem {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  accessRole?: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<{ start: string; end: string }>({
    start: '10:00',
    end: '11:00',
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [customDescription, setCustomDescription] = useState<string>('');
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);

  // カレンダーリストを取得
  useEffect(() => {
    const fetchCalendars = async () => {
      if (!session) return;

      setIsLoadingCalendars(true);
      try {
        const response = await fetch('/api/calendar/list');
        if (response.ok) {
          const data = await response.json();
          setCalendars(data.calendars);
        } else {
          console.error('カレンダーリスト取得エラー');
        }
      } catch (error) {
        console.error('カレンダーリスト取得エラー:', error);
      } finally {
        setIsLoadingCalendars(false);
      }
    };

    fetchCalendars();
  }, [session]);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // テンプレート選択時に招待文章を生成
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = eventTemplates.find(t => t.id === templateId);
    if (template && selectedMembers.length > 0) {
      const attendeeCalendar = calendars.find(c => selectedMembers.includes(c.id));
      const attendeeName = attendeeCalendar?.summary || '様';
      const description = `${attendeeName}様

お世話になっております。
テクノブレーン黒田です。

以下日程で調整をさせていただきました。
ご確認いただけますと幸いです。

${template.description || ''}`;
      setCustomDescription(description);
    } else if (template) {
      // 参加者が未選択の場合はデフォルトテキスト
      const description = `様

お世話になっております。
テクノブレーン黒田です。

以下日程で調整をさせていただきました。
ご確認いただけますと幸いです。

${template.description || ''}`;
      setCustomDescription(description);
    }
  };

  // 参加者が変更されたら招待文章を更新
  useEffect(() => {
    if (selectedTemplate && selectedMembers.length > 0) {
      const template = eventTemplates.find(t => t.id === selectedTemplate);
      if (template) {
        const attendeeCalendar = calendars.find(c => selectedMembers.includes(c.id));
        const attendeeName = attendeeCalendar?.summary || '様';
        const description = `${attendeeName}様

お世話になっております。
テクノブレーン黒田です。

以下日程で調整をさせていただきました。
ご確認いただけますと幸いです。

${template.description || ''}`;
        setCustomDescription(description);
      }
    }
  }, [selectedMembers, calendars]);

  // 空き状況を確認
  const checkAvailability = async () => {
    if (selectedMembers.length === 0 || !session) return;

    setIsCheckingAvailability(true);
    try {
      const [hours, minutes] = selectedTime.start.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const [endHours, endMinutes] = selectedTime.end.split(':');
      const endTime = new Date(selectedDate);
      endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      const response = await fetch('/api/calendar/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberIds: selectedMembers,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAvailability(data.availability);
      } else {
        console.error('空き状況確認エラー');
      }
    } catch (error) {
      console.error('空き状況確認エラー:', error);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // メンバー選択が変わったら空き状況を確認
  useEffect(() => {
    if (selectedMembers.length > 0 && session) {
      checkAvailability();
    }
  }, [selectedMembers, selectedDate, selectedTime, session]);

  const handleCreateEvent = async () => {
    if (!selectedTemplate || selectedMembers.length === 0 || !session) {
      alert('テンプレートと参加者を選択してください');
      return;
    }

    setIsCreating(true);
    try {
      const [hours, minutes] = selectedTime.start.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const [endHours, endMinutes] = selectedTime.end.split(':');
      const endTime = new Date(selectedDate);
      endTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

      const response = await fetch('/api/calendar/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          attendeeIds: selectedMembers,
          customDescription: customDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          `予定を作成しました!\n\n${data.message}\n\nGoogleカレンダーで確認: ${data.eventLink}`
        );
        // リセット
        setSelectedMembers([]);
        setSelectedTemplate('');
        setAvailability([]);
        setCustomDescription('');
      } else {
        const error = await response.json();
        alert(`エラー: ${error.error}`);
      }
    } catch (error) {
      console.error('予定作成エラー:', error);
      alert('予定の作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  // 認証中の表示
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未認証の場合
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            エイブリック調整システム
          </h1>
          <p className="text-gray-600 mb-8">
            面倒臭い調整のお手伝い
          </p>
          <button
            onClick={() => signIn('google')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Googleでログイン
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Googleカレンダーへのアクセス権限が必要です
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              エイブリック調整システム
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              面倒臭い調整のお手伝い
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">ログイン中</p>
              <p className="text-sm font-medium text-gray-900">{session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム: 日時選択 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 日付選択 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                1. 日時を選択
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    日付
                  </label>
                  <input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={e => setSelectedDate(new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      開始時刻
                    </label>
                    <input
                      type="time"
                      value={selectedTime.start}
                      onChange={e =>
                        setSelectedTime(prev => ({ ...prev, start: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      終了時刻
                    </label>
                    <input
                      type="time"
                      value={selectedTime.end}
                      onChange={e =>
                        setSelectedTime(prev => ({ ...prev, end: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* メンバー選択 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  2. 参加者を選択
                </h2>
                {isCheckingAvailability && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    確認中...
                  </div>
                )}
              </div>

              {isLoadingCalendars ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">カレンダーを読み込み中...</p>
                </div>
              ) : calendars.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-600">
                    閲覧・編集権限のあるカレンダーが見つかりませんでした。
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    他の人のGoogleカレンダーへのアクセス権限を確認してください。
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {calendars.map(calendar => {
                    const memberAvailability = availability.find(a => a.memberId === calendar.id);
                    return (
                      <label
                        key={calendar.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(calendar.id)}
                          onChange={() => handleMemberToggle(calendar.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                            style={{ backgroundColor: calendar.backgroundColor || '#4285F4' }}
                          >
                            {calendar.summary.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{calendar.summary}</p>
                            <p className="text-xs text-gray-500">{calendar.id}</p>
                          </div>
                        </div>
                        {/* 空き状況バッジ */}
                        {memberAvailability && (
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              memberAvailability.isAvailable
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {memberAvailability.isAvailable ? '空き' : '予定あり'}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* テンプレート選択 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                3. テンプレートを選択
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {eventTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: template.color }}
                      />
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.summary}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{template.duration}分</span>
                      {template.location && (
                        <>
                          <span className="mx-2">•</span>
                          <span>オンライン</span>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* 招待文章の編集エリア */}
              {selectedTemplate && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    招待文章（編集可能）
                  </label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    placeholder="招待文章を入力してください..."
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    参加者名や学生さんの情報などを追加・編集できます
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 右カラム: サマリーと実行ボタン */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                予定のサマリー
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">日時</p>
                  <p className="font-medium text-gray-900">
                    {format(selectedDate, 'yyyy年M月d日(E)', { locale: ja })}
                  </p>
                  <p className="font-medium text-gray-900">
                    {selectedTime.start} - {selectedTime.end}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    参加者 ({selectedMembers.length}人)
                  </p>
                  {selectedMembers.length > 0 ? (
                    <div className="space-y-1">
                      {selectedMembers.map(id => {
                        const calendar = calendars.find(c => c.id === id);
                        const memberAvailability = availability.find(a => a.memberId === id);
                        return (
                          <div key={id} className="flex items-center justify-between">
                            <p className="text-sm text-gray-900">{calendar?.summary}</p>
                            {memberAvailability && (
                              <span
                                className={`text-xs ${
                                  memberAvailability.isAvailable
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {memberAvailability.isAvailable ? '✓' : '✗'}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">未選択</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">テンプレート</p>
                  {selectedTemplate ? (
                    <p className="text-sm text-gray-900">
                      {eventTemplates.find(t => t.id === selectedTemplate)?.name}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">未選択</p>
                  )}
                </div>

                <button
                  onClick={handleCreateEvent}
                  disabled={!selectedTemplate || selectedMembers.length === 0 || isCreating}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    !selectedTemplate || selectedMembers.length === 0 || isCreating
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isCreating ? '作成中...' : '予定を作成'}
                </button>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    予定を作成すると、参加者全員にGoogleカレンダーの招待が送信されます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
