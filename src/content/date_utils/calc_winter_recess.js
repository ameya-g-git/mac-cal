export default function getWinterRecess(year) {
  const f = new Date(year, 1, 1);

  const d = f.getDay() > 1 ? 8 - f.getDay() : 1 - f.getDay();

  const fd = new Date(year, 1, 1 + d + 14);

  const r = [fd];

  for (let i = 1; i <= 6; i++) {
    const tmp = new Date(fd);
    tmp.setDate(tmp.getDate() + i);
    r.push(tmp);
  }

  return r;
}
