import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createCalendarEvent } from '@/lib/utils/googleCalendar';
import { sampleMembers, eventTemplates } from '@/lib/data/sampleData';

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
      customDescription,
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

    // 参加者のメールアドレスを取得
    const attendees = sampleMembers
      .filter(m => attendeeIds.includes(m.id))
      .map(m => m.email);

    if (attendees.length === 0) {
      return NextResponse.json(
        { error: '参加者が見つかりません' },
        { status: 400 }
      );
    }

    // イベントを作成
    const result = await createCalendarEvent(
      session.accessToken,
      'primary', // ログインユーザーのカレンダー
      {
        summary: customTitle || template.summary,
        description: customDescription || template.description,
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
