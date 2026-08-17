export type MoodGradeCode = "BALBADAK" | "DDUBUCKI" | "OREUMKKUN" | "HALLAMAN" | "TAMLAWANG";

export type MoodGradeInfo = {
  code: MoodGradeCode;
  name: string;
  minSteps: number;
};

// 백엔드 MoodGrade enum(steps/entity/MoodGrade.java)과 값을 맞춰야 한다.
export const MOOD_GRADES: MoodGradeInfo[] = [
  { code: "BALBADAK", name: "발바닥", minSteps: 0 },
  { code: "DDUBUCKI", name: "뚜벅이", minSteps: 20_000 },
  { code: "OREUMKKUN", name: "오름꾼", minSteps: 40_000 },
  { code: "HALLAMAN", name: "한라맨", minSteps: 60_000 },
  { code: "TAMLAWANG", name: "탐라왕", minSteps: 80_000 },
];

export function gradeNameOf(code?: string): string {
  return MOOD_GRADES.find((grade) => grade.code === code)?.name ?? MOOD_GRADES[0].name;
}

export function gradeOfSteps(totalSteps: number): MoodGradeInfo {
  let current = MOOD_GRADES[0];
  for (const grade of MOOD_GRADES) {
    if (totalSteps >= grade.minSteps) current = grade;
  }
  return current;
}
