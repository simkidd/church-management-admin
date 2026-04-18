// hooks/useCalendar.ts

import { useMemo } from "react";

export function useCalendar(currentDate: Date) {
  return useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = firstDayOfMonth.getDay(); // 0 = Sunday

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonthDays = new Date(year, month, 0).getDate();

    const dates: Date[] = [];

    // 🔹 Previous month filler
    for (let i = startDay - 1; i >= 0; i--) {
      dates.push(new Date(year, month - 1, prevMonthDays - i));
    }

    // 🔹 Current month
    for (let i = 1; i <= daysInMonth; i++) {
      dates.push(new Date(year, month, i));
    }

    // 🔹 Next month filler (to complete 6 rows)
    while (dates.length % 7 !== 0) {
      dates.push(new Date(year, month + 1, dates.length));
    }

    return dates;
  }, [currentDate]);
}
