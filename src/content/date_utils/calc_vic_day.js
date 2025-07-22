export default function getVictoriaDay(year) {
  const i = new Date(year, 4, 18);

  const d = i.getDay() > 1 ? 8 - i.getDay() : 1 - i.getDay();

  const vd = new Date(year, 4, 18 + d);

  return vd;
}
