import { z } from 'zod';

export const passwordSchema = z
    .string()
    .min(8, "8자리 이상 입력해주세요.")
    .max(12, "12자리 이하로 입력해주세요.")
    .regex(/^[A-Za-z0-9!_@-]+$/, "영문/숫자/!, _, @, -만 사용할 수 있어요.")
    .regex(/[!_@-]/, "특수문자(!, _, @, -)를 1개 이상 포함해주세요.")
    .regex(/[A-Za-z0-9]/, "영문 또는 숫자를 1개 이상 포함해주세요.")

export const passwordConfirmSchema = z
    .object({
        password: passwordSchema,
        confirm: z.string(),
    })
    .refine((data) => data.password === data.confirm, {
        message: "비밀번호가 일치하지 않습니다.",
        path: ['confirm']
    })

export type PasswordFormValues = z.infer<typeof passwordConfirmSchema>;