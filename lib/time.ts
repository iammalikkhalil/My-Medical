import { addDays, differenceInCalendarDays, isBefore } from "date-fns";

export function isExpired(expiryDate: Date) {
  return isBefore(expiryDate, new Date());
}

export function isExpiringSoon(expiryDate: Date, withinDays = 30) {
  return isBefore(expiryDate, addDays(new Date(), withinDays));
}

export function calculateDurationDays(startDate: Date, recoveryDate: Date) {
  return Math.max(1, differenceInCalendarDays(recoveryDate, startDate) + 1);
}

export function hoursSince(date: Date) {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

