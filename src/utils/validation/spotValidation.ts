import type { SpotCreate } from 'src/types/SpotTypes';
import { z } from 'zod';

export const spotFormSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력해주세요.'),
  name: z.string().trim().min(1, '위치를 입력해주세요.'),
  description:  z.string().trim().min(1, '내용을 입력해주세요.'),
});

export type SpotFieldErrors = Partial<Record<'title' | 'name' | 'description', string>>;

export function getSpotErrors(input: Pick<SpotCreate, 'title' | 'name' | 'description'>): SpotFieldErrors {
  const r = spotFormSchema.safeParse(input);
  if (r.success) return {};
  const errs: SpotFieldErrors = {};
  for (const i of r.error.issues) {
    const k = i.path[0] as keyof SpotFieldErrors;
    if (!errs[k]) errs[k] = i.message;
  }
  return errs;
}

// 토스트용 한 줄 메시지
export function buildSpotErrorMessage(errs: SpotFieldErrors) {
  const messages = [errs.title, errs.name, errs.description].filter(Boolean);
  if (messages.length > 1) return '입력하지 않은 항목이 있어요.';
  return messages[0] ?? '필수 값을 확인해주세요.';
};
