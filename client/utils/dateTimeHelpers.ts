import { parseISO, isWithinInterval, isSameDay, format } from "date-fns";

interface BusySlot {
  start: string;
  end: string;
  status: string;
}

/**
 * Checks if a given date is within any of the busy slots
 */
export const isTimeSlotBusy = (date: Date, busySlots: BusySlot[]): boolean => {
  return busySlots.some((slot) => {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);

    // Compare UTC times
    const timeToCheck = date.getTime();
    return (
      timeToCheck >= slotStart.getTime() && timeToCheck <= slotEnd.getTime()
    );
  });
};

/**
 * Checks if a date has any busy slots during the day
 */
export const hasDateBusySlots = (
  date: Date,
  busySlots: BusySlot[]
): boolean => {
  // Convert input date to UTC midnight
  const utcDayStart = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
  );

  const utcDayEnd = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    )
  );

  return busySlots.some((slot) => {
    const slotStart = new Date(slot.start);
    const slotEnd = new Date(slot.end);

    return (
      (slotStart >= utcDayStart && slotStart <= utcDayEnd) ||
      (slotEnd >= utcDayStart && slotEnd <= utcDayEnd) ||
      (slotStart <= utcDayStart && slotEnd >= utcDayEnd)
    );
  });
};

/**
 * Gets all busy time ranges for a specific day
 */
export const getBusyRangesForDay = (
  day: Date,
  busySlots: BusySlot[]
): { start: Date; end: Date }[] => {
  return busySlots
    .filter((slot) => {
      const slotStart = parseISO(slot.start);
      return isSameDay(slotStart, day);
    })
    .map((slot) => ({
      start: parseISO(slot.start),
      end: parseISO(slot.end),
    }));
};

/**
 * Formats a date for display
 */
export const formatDateTime = (date: Date | null): string => {
  if (!date) return "";
  return format(date, "MMM dd, yyyy hh:mm a");
};

/**
 * Checks if a specific hour is completely unavailable
 */
export const isHourUnavailable = (
  date: Date,
  hour: number,
  busySlots: BusySlot[]
): boolean => {
  // Create 4 test dates at 0, 15, 30, and 45 minutes
  const testTimes = [0, 15, 30, 45].map((minutes) => {
    const testDate = new Date(date);
    testDate.setHours(hour, minutes, 0, 0);
    return testDate;
  });

  // If all 4 test times are busy, the hour is unavailable
  return testTimes.every((time) => isTimeSlotBusy(time, busySlots));
};

/**
 * Gets available time slots for a given day, in 15-minute increments
 */
export const getAvailableTimeSlots = (
  day: Date,
  busySlots: BusySlot[],
  startHour = 8,
  endHour = 20
): Date[] => {
  const availableSlots: Date[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeSlot = new Date(day);
      timeSlot.setHours(hour, minute, 0, 0);

      if (!isTimeSlotBusy(timeSlot, busySlots)) {
        availableSlots.push(timeSlot);
      }
    }
  }

  return availableSlots;
};
