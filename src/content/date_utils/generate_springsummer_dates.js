import getVictoriaDay from "./calc_vic_day.js";
import getCivicHoliday from "./calc_civic_holiday.js";

export default function getSpringSummerDates(year) {
  let dates = [];
  dates.push(getVictoriaDay(year));
  dates.push(new Date(year, 6, 1));
  dates.push(getCivicHoliday(year));

  return dates;
}
