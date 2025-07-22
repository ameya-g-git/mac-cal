export default function getFallRecess(year) {
  const o = new Date(2025, 9, 1);

  const d = o.getDay() > 1 ? 8 - o.getDay() : 1 - o.getDay();

  const t = new Date(year, 9, 1 + d + 7);

  const r = [t];

  for (let i = 1; i <= 6; i++) {
    const tmp = new Date(t);
    tmp.setDate(tmp.getDate() + i);
    r.push(tmp);
  }

  return r;
}
