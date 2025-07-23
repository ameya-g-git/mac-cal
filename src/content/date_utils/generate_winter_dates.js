import getGoodFriday from './calc_good_friday.js';
import getWinterRecess from './calc_winter_recess.js';

export default function getWinterDates(year) {
  const dates = getWinterRecess(year);
  dates.push(getGoodFriday(year));

  return dates;
}
