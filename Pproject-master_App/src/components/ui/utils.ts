// src/components/ui/utils.ts
// React Native용 간단한 클래스 머지 유틸
// 남아 있는 웹 스타일 코드에서 cn(...)을 호출해도 에러 안 나게 하기 위함입니다.

export type ClassValue =
  | string
  | number
  | null
  | boolean
  | undefined
  | ClassValue[]
  | { [key: string]: any };

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const walk = (val: ClassValue) => {
    if (!val) return;
    if (typeof val === 'string' || typeof val === 'number') {
      classes.push(String(val));
      return;
    }
    if (Array.isArray(val)) {
      val.forEach(walk);
      return;
    }
    if (typeof val === 'object') {
      for (const key in val) {
        if ((val as any)[key]) {
          classes.push(key);
        }
      }
    }
  };

  inputs.forEach(walk);
  return classes.join(' ');
}
