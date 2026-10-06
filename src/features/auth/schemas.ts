import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo de 6 caracteres").max(72),
});

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Informe seu nome").max(120),
    companyName: z.string().trim().min(2, "Informe o nome da empresa").max(120),
    email: z.string().trim().email("E-mail inválido").max(255),
    password: z.string().min(8, "Use pelo menos 8 caracteres").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "As senhas não coincidem",
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const forgotSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
});

export const resetSchema = z
  .object({
    password: z.string().min(8, "Use pelo menos 8 caracteres").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "As senhas não coincidem" });

export type SignInInput = z.infer<typeof signInSchema>;

export type ForgotInput = z.infer<typeof forgotSchema>;
export type ResetInput = z.infer<typeof resetSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual").max(72),
    password: z.string().min(8, "Use pelo menos 8 caracteres").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "As senhas não coincidem" })
  .refine((d) => d.password !== d.currentPassword, {
    path: ["password"],
    message: "A nova senha deve ser diferente da atual",
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
