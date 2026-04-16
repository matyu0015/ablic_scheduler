import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createCalendarEvent } from '@/lib/utils/googleCalendar';
import { eventTemplates } from '@/lib/data/sampleData';

export async function POST(request: NextRequest) {
  try {
    // セッション確認
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      templateId,
      startTime,
      endTime,
      attendeeIds,
      customTitle,
      customDescription: providedCustomDescription,
      customLocation,
    } = body;

    if (!templateId || !startTime || !endTime || !attendeeIds) {
      return NextResponse.json(
        { error: '必要なパラメータが不足しています' },
        { status: 400 }
      );
    }

    // テンプレートを取得
    const template = eventTemplates.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'テンプレートが見つかりません' },
        { status: 404 }
      );
    }

    // attendeeIdsは実際にはカレンダーID（email）なので、そのまま使用
    const attendees = attendeeIds;

    console.log('参加者リスト:', attendees);
    console.log('参加者の型:', typeof attendees, Array.isArray(attendees));

    if (attendees.length === 0) {
      return NextResponse.json(
        { error: '参加者が見つかりません' },
        { status: 400 }
      );
    }

    // 説明文を決定（カスタム文章が提供されていればそれを使用、なければデフォルトを生成）
    let description = providedCustomDescription;
    if (!description) {
      // カレンダーIDから名前を抽出（@の前の部分）
      const attendeeName = attendees[0]?.split('@')[0] || '様';
      description = `${attendeeName}様

お世話になっております。
テクノブレーン黒田です。

以下日程で調整をさせていただきました。
ご確認いただけますと幸いです。

${template.description || ''}`;
    }

    // イベントを作成
    const result = await createCalendarEvent(
      session.accessToken,
      'primary', // ログインユーザーのカレンダー
      {
        summary: customTitle || template.summary,
        description: description,
        location: customLocation || template.location,
        start: new Date(startTime),
        end: new Date(endTime),
        attendees,
        reminders: template.reminderMinutes,
      }
    );

    return NextResponse.json({
      success: true,
      eventId: result.id,
      eventLink: result.htmlLink,
      message: 'イベントを作成し、参加者に招待を送信しました',
    });
  } catch (error) {
    console.error('イベント作成エラー:', error);
    return NextResponse.json(
      { error: 'イベントの作成に失敗しました' },
      { status: 500 }
    );
  }
}
