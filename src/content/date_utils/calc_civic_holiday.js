export default function getCivicHoliday(year) {
  const i = new Date(year, 7, 1);

  const d = i.getDay() > 1 ? 8 - i.getDay() : 1 - i.getDay();

  const ch = new Date(year, 7, 1 + d);

  return ch;
}
