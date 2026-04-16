import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMultipleCalendarEvents } from '@/lib/utils/googleCalendar';
import { checkMultipleAvailability } from '@/lib/utils/calendarUtils';

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
    const { memberIds, startTime, endTime } = body;

    if (!memberIds || !Array.isArray(memberIds)) {
      return NextResponse.json(
        { error: 'memberIdsが必要です' },
        { status: 400 }
      );
    }

    const targetStart = new Date(startTime);
    const targetEnd = new Date(endTime);

    // memberIdsは実際にはカレンダーID（email）なので、そのまま使用
    const calendarIds = memberIds;

    // カレンダーイベントを取得
    const eventsMap = await getMultipleCalendarEvents(
      session.accessToken,
      calendarIds,
      targetStart,
      targetEnd
    );

    // カレンダーIDごとの仮想メンバーを作成
    const calendarsAsMembers = calendarIds.map(id => ({
      id,
      name: id,
      email: id,
      calendarId: id,
    }));

    // カレンダーIDをキーにしたMapを作成
    const memberEventsMap = new Map();
    calendarIds.forEach(calendarId => {
      const events = eventsMap.get(calendarId) || [];
      memberEventsMap.set(calendarId, events);
    });

    // 空き状況を確認
    const availability = checkMultipleAvailability(
      calendarsAsMembers,
      memberEventsMap,
      targetStart,
      targetEnd
    );

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('空き状況確認エラー:', error);
    return NextResponse.json(
      { error: '空き状況の確認に失敗しました' },
      { status: 500 }
    );
  }
}
