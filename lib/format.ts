const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "12/11/2026" from "2026-11-12" — no time zone shift, unlike new Date(). */
export function formatDayMonthYear(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * True once the whole of `isoDate` has passed in Viet Nam (UTC+7), so a
 * deadline of the 12th stays open until midnight Ha Noi time.
 */
export function isPastDay(isoDate: string, now = Date.now()): boolean {
  const endOfDay = Date.parse(`${isoDate}T23:59:59+07:00`);
  return !Number.isNaN(endOfDay) && now > endOfDay;
}

/** "28 September 2026" — publication dates on cards and single templates. */
export function formatDate(date: string): string {
  return dateFormat.format(new Date(date));
}
