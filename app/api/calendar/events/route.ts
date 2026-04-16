import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMultipleCalendarEvents } from '@/lib/utils/googleCalendar';

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
    const { calendarIds, startDate, endDate } = body;

    if (!calendarIds || !Array.isArray(calendarIds)) {
      return NextResponse.json(
        { error: 'calendarIdsが必要です' },
        { status: 400 }
      );
    }

    const timeMin = new Date(startDate);
    const timeMax = new Date(endDate);

    // 複数カレンダーのイベントを取得
    const eventsMap = await getMultipleCalendarEvents(
      session.accessToken,
      calendarIds,
      timeMin,
      timeMax
    );

    // Mapをオブジェクトに変換
    const eventsObject: Record<string, any[]> = {};
    eventsMap.forEach((events, calendarId) => {
      eventsObject[calendarId] = events;
    });

    return NextResponse.json({ events: eventsObject });
  } catch (error) {
    console.error('イベント取得エラー:', error);
    return NextResponse.json(
      { error: 'イベントの取得に失敗しました' },
      { status: 500 }
    );
  }
}
