import getFallRecess from './calc_fall_recess.js';

export default function getFallDates(year) {
  const tar = new Date(year, 8, 30);

  let dates = [];
  dates.push(tar);
  dates.push(...getFallRecess(year));

  return dates;
}
