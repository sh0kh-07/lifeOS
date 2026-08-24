// Current simulated base date: 2026-08-24
export function getTodayDateString(): string {
  const d = new Date();
  // Ensure we get YYYY-MM-DD
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const MONTH_NAMES_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export const MONTH_NAMES_GENITIVE_RU = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
];

export const WEEKDAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const WEEKDAYS_FULL_RU = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export function parseDateSafe(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(dateStr);
}

export function formatDateReadable(dateStr: string, includeYear = false): string {
  if (!dateStr) return '';
  const d = parseDateSafe(dateStr);
  const day = d.getDate();
  const month = MONTH_NAMES_GENITIVE_RU[d.getMonth()];
  if (includeYear) {
    return `${day} ${month} ${d.getFullYear()}`;
  }
  return `${day} ${month}`;
}

export function formatRelativeDate(dateStr: string, timeStr?: string): string {
  if (!dateStr) return '';
  const todayStr = getTodayDateString();
  
  const targetDate = parseDateSafe(dateStr);
  const todayDate = parseDateSafe(todayStr);
  
  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  let label = '';
  if (diffDays === 0) {
    label = 'Сегодня';
  } else if (diffDays === 1) {
    label = 'Завтра';
  } else if (diffDays === -1) {
    label = 'Вчера';
  } else if (diffDays > 1 && diffDays <= 6) {
    // Weekday name
    const dayOfWeek = (targetDate.getDay() + 6) % 7; // Monday = 0
    label = WEEKDAYS_FULL_RU[dayOfWeek];
  } else {
    label = formatDateReadable(dateStr, targetDate.getFullYear() !== todayDate.getFullYear());
  }

  if (timeStr) {
    return `${label}, ${timeStr}`;
  }
  return label;
}

export function isDateToday(dateStr: string): boolean {
  return dateStr === getTodayDateString();
}

export function isDateOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  const todayStr = getTodayDateString();
  return dateStr < todayStr;
}

export function getDaysRemaining(dateStr: string): number {
  if (!dateStr) return 0;
  const targetDate = parseDateSafe(dateStr);
  const todayDate = parseDateSafe(getTodayDateString());
  const diffTime = targetDate.getTime() - todayDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getMonthMatrix(year: number, month: number, startOnMonday = true) {
  // month: 0-indexed
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  let startingDay = firstDayOfMonth.getDay(); // 0 is Sunday
  if (startOnMonday) {
    startingDay = (startingDay + 6) % 7; // 0 is Monday
  }
  
  const totalDays = lastDayOfMonth.getDate();
  const weeks: Array<Array<{ day: number; dateStr: string; isCurrentMonth: boolean }>> = [];
  
  let currentWeek: Array<{ day: number; dateStr: string; isCurrentMonth: boolean }> = [];
  
  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDay - 1; i >= 0; i--) {
    const prevDay = prevMonthLastDay - i;
    const prevMonthNum = month === 0 ? 12 : month;
    const prevYearNum = month === 0 ? year - 1 : year;
    const dateStr = `${prevYearNum}-${String(prevMonthNum).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
    currentWeek.push({ day: prevDay, dateStr, isCurrentMonth: false });
  }
  
  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    currentWeek.push({ day, dateStr, isCurrentMonth: true });
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Next month padding
  if (currentWeek.length > 0) {
    let nextDay = 1;
    while (currentWeek.length < 7) {
      const nextMonthNum = month === 11 ? 1 : month + 2;
      const nextYearNum = month === 11 ? year + 1 : year;
      const dateStr = `${nextYearNum}-${String(nextMonthNum).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
      currentWeek.push({ day: nextDay, dateStr, isCurrentMonth: false });
      nextDay++;
    }
    weeks.push(currentWeek);
  }
  
  return weeks;
}
