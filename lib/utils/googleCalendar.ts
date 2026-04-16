import { google } from 'googleapis';
import { CalendarEvent } from '@/lib/types';

/**
 * Google Calendar APIクライアントを初期化
 */
export function getCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

/**
 * 指定されたカレンダーのイベントを取得
 */
export async function getCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const calendar = getCalendarClient(accessToken);

  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];

    return events.map(event => ({
      id: event.id || '',
      summary: event.summary || '(タイトルなし)',
      start: new Date(event.start?.dateTime || event.start?.date || ''),
      end: new Date(event.end?.dateTime || event.end?.date || ''),
      attendees: event.attendees?.map(a => a.email || '') || [],
      description: event.description || undefined,
      location: event.location || undefined,
    }));
  } catch (error) {
    console.error('カレンダーイベント取得エラー:', error);
    throw new Error('カレンダーイベントの取得に失敗しました');
  }
}

/**
 * 複数カレンダーのイベントを取得
 */
export async function getMultipleCalendarEvents(
  accessToken: string,
  calendarIds: string[],
  timeMin: Date,
  timeMax: Date
): Promise<Map<string, CalendarEvent[]>> {
  const eventsMap = new Map<string, CalendarEvent[]>();

  await Promise.all(
    calendarIds.map(async (calendarId) => {
      try {
        const events = await getCalendarEvents(accessToken, calendarId, timeMin, timeMax);
        eventsMap.set(calendarId, events);
      } catch (error) {
        console.error(`カレンダー ${calendarId} の取得エラー:`, error);
        eventsMap.set(calendarId, []);
      }
    })
  );

  return eventsMap;
}

/**
 * カレンダーにイベントを作成
 */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: {
    summary: string;
    description?: string;
    location?: string;
    start: Date;
    end: Date;
    attendees?: string[];
    reminders?: number[];
    colorId?: string;
  }
) {
  const calendar = getCalendarClient(accessToken);

  try {
    const attendeesList = event.attendees?.map(email => ({ email }));
    console.log('イベント作成リクエスト:');
    console.log('- カレンダーID:', calendarId);
    console.log('- 参加者（元）:', event.attendees);
    console.log('- 参加者（変換後）:', attendeesList);
    console.log('- sendUpdates:', 'all');

    const response = await calendar.events.insert({
      calendarId,
      sendUpdates: 'all', // 全参加者に通知
      requestBody: {
        summary: event.summary,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: 'Asia/Tokyo',
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: 'Asia/Tokyo',
        },
        attendees: attendeesList,
        reminders: event.reminders
          ? {
              useDefault: false,
              overrides: event.reminders.map(minutes => ({
                method: 'popup' as const,
                minutes,
              })),
            }
          : { useDefault: true },
        colorId: event.colorId,
      },
    });

    console.log('イベント作成成功:');
    console.log('- イベントID:', response.data.id);
    console.log('- リンク:', response.data.htmlLink);
    console.log('- 作成された参加者:', response.data.attendees);

    return {
      id: response.data.id,
      htmlLink: response.data.htmlLink,
    };
  } catch (error) {
    console.error('イベント作成エラー:', error);
    throw new Error('イベントの作成に失敗しました');
  }
}

/**
 * FreeBusy情報を取得（空き状況の効率的な確認）
 */
export async function getFreeBusyInfo(
  accessToken: string,
  calendarIds: string[],
  timeMin: Date,
  timeMax: Date
) {
  const calendar = getCalendarClient(accessToken);

  try {
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: calendarIds.map(id => ({ id })),
      },
    });

    return response.data.calendars;
  } catch (error) {
    console.error('FreeBusy情報取得エラー:', error);
    throw new Error('空き状況の取得に失敗しました');
  }
}
