import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMultipleCalendarEvents } from '@/lib/utils/googleCalendar';
import { checkMultipleAvailability } from '@/lib/utils/calendarUtils';
import { sampleMembers } from '@/lib/data/sampleData';

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

    // 対象メンバーを取得
    const members = sampleMembers.filter(m => memberIds.includes(m.id));
    const calendarIds = members.map(m => m.calendarId);

    // カレンダーイベントを取得
    const eventsMap = await getMultipleCalendarEvents(
      session.accessToken,
      calendarIds,
      targetStart,
      targetEnd
    );

    // メンバーIDをキーにしたMapに変換
    const memberEventsMap = new Map();
    members.forEach(member => {
      const events = eventsMap.get(member.calendarId) || [];
      memberEventsMap.set(member.id, events);
    });

    // 空き状況を確認
    const availability = checkMultipleAvailability(
      members,
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
