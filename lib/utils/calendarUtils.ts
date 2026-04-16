import { Availability, TimeSlot, Member, CalendarEvent } from '@/lib/types';
import { addMinutes, isWithinInterval, areIntervalsOverlapping } from 'date-fns';

/**
 * 指定された時間帯に対してメンバーの空き状況を確認
 */
export function checkAvailability(
  member: Member,
  events: CalendarEvent[],
  targetStart: Date,
  targetEnd: Date
): Availability {
  const busySlots: TimeSlot[] = events
    .filter(event => {
      // 指定時間帯と重複するイベントを抽出
      return areIntervalsOverlapping(
        { start: event.start, end: event.end },
        { start: targetStart, end: targetEnd }
      );
    })
    .map(event => ({
      start: event.start,
      end: event.end,
    }));

  const isAvailable = busySlots.length === 0;

  return {
    memberId: member.id,
    memberName: member.name,
    isAvailable,
    busySlots,
  };
}

/**
 * 複数メンバーの空き状況をまとめて確認
 */
export function checkMultipleAvailability(
  members: Member[],
  eventsMap: Map<string, CalendarEvent[]>,
  targetStart: Date,
  targetEnd: Date
): Availability[] {
  return members.map(member => {
    const events = eventsMap.get(member.id) || [];
    return checkAvailability(member, events, targetStart, targetEnd);
  });
}

/**
 * 時間帯候補を生成（例: 9:00-18:00の間で30分刻み）
 */
export function generateTimeSlots(
  date: Date,
  startHour: number = 9,
  endHour: number = 18,
  intervalMinutes: number = 30
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const baseDate = new Date(date);
  baseDate.setHours(startHour, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(endHour, 0, 0, 0);

  let current = baseDate;

  while (current < endDate) {
    const slotEnd = addMinutes(current, intervalMinutes);
    if (slotEnd <= endDate) {
      slots.push({
        start: new Date(current),
        end: slotEnd,
      });
    }
    current = slotEnd;
  }

  return slots;
}

/**
 * 全員が空いている時間帯を見つける
 */
export function findCommonAvailableSlots(
  members: Member[],
  eventsMap: Map<string, CalendarEvent[]>,
  date: Date,
  durationMinutes: number
): TimeSlot[] {
  const slots = generateTimeSlots(date, 9, 18, 30);
  const availableSlots: TimeSlot[] = [];

  for (const slot of slots) {
    const slotEnd = addMinutes(slot.start, durationMinutes);

    // 全メンバーがこの時間帯に空いているかチェック
    const allAvailable = members.every(member => {
      const events = eventsMap.get(member.id) || [];
      const availability = checkAvailability(member, events, slot.start, slotEnd);
      return availability.isAvailable;
    });

    if (allAvailable) {
      availableSlots.push({
        start: slot.start,
        end: slotEnd,
      });
    }
  }

  return availableSlots;
}

/**
 * 日時を読みやすい形式にフォーマット
 */
export function formatTimeSlot(slot: TimeSlot): string {
  const startTime = slot.start.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTime = slot.end.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${startTime} - ${endTime}`;
}

/**
 * 日付を読みやすい形式にフォーマット
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}
