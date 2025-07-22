export default function getGoodFriday(year) {
  // find first full moon after mar 21
  // then first sunday after : )
  // then 2 days before that   :    )

  const NM = new Date(2025, 5, 25, 6, 31); // known new moon date + time from https://www.timeanddate.com/moon/phases/
  const VE = new Date(year, 2, 21);
  const DAY = 24 * 60 * 60 * 1000;

  const d = Math.abs(VE - NM) / DAY;

  const c = (d / 29.53) % 1;

  // days until next full moon
  const nf = (c > 0.5 ? 1.5 - c : 0.5 - c) * 29.53;

  const e = new Date(VE);
  e.setDate(e.getDate() + nf); // set easter date (temp) to the first full moon after vernal equinox

  const sun = e.getDay == 0 ? 0 : 7 - e.getDay();
  e.setDate(e.getDate() + sun); // set easter date (final) to the first sunday after

  const gf = new Date(e);

  gf.setDate(gf.getDate() - 2); // good friday is just 2 days before easter :  )

  return gf;
}
