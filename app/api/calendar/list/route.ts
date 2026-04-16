import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    // セッション確認
    const session = await auth();
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // Google Calendar APIクライアントを初期化
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // カレンダーリストを取得
    const response = await calendar.calendarList.list({
      showHidden: false, // 非表示のカレンダーは除外
    });

    const calendars = response.data.items || [];

    // 自分のプライマリカレンダー以外のカレンダーを抽出
    const accessibleCalendars = calendars
      .filter(cal => {
        // プライマリカレンダーは除外
        if (cal.primary) return false;

        // 閲覧権限以上があるカレンダーのみ
        const accessRole = cal.accessRole;
        return accessRole === 'owner' ||
               accessRole === 'writer' ||
               accessRole === 'reader' ||
               accessRole === 'freeBusyReader';
      })
      .map(cal => ({
        id: cal.id || '',
        summary: cal.summary || cal.summaryOverride || '(名前なし)',
        description: cal.description,
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor,
        accessRole: cal.accessRole,
      }));

    return NextResponse.json({
      success: true,
      calendars: accessibleCalendars,
    });
  } catch (error) {
    console.error('カレンダーリスト取得エラー:', error);
    return NextResponse.json(
      { error: 'カレンダーリストの取得に失敗しました' },
      { status: 500 }
    );
  }
}
