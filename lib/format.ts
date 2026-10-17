const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "28 September 2026" — publication dates on cards and single templates. */
export function formatDate(date: string): string {
  return dateFormat.format(new Date(date));
}
