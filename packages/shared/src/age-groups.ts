export type Sex = "M" | "K";
export type AgeGroup =
  | `UM20` | `UK20`
  | `M21` | `K21`
  | `M35` | `K35` | `M40` | `K40` | `M45` | `K45`
  | `M50` | `K50` | `M55` | `K55` | `M60` | `K60`
  | `M65` | `K65` | `M70` | `K70` | `M75` | `K75`
  | `M80` | `K80`;

export function calcAgeGroup(eventYear: number, birthYear: number, sex: Sex): AgeGroup {
  const age = eventYear - birthYear;
  if (age <= 20) return (`U${sex}20`) as AgeGroup; // UM20/UK20
  if (age <= 34) return (`${sex}21`) as AgeGroup;  // M21/K21
  const base = Math.floor(age / 5) * 5; // 35,40,45,...
  const cls = Math.max(35, base);
  return (`${sex}${cls}`) as AgeGroup;
}