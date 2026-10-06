import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo de 6 caracteres").max(72),
});

const isValidDocument = (value: string, type: "CPF" | "CNPJ") => {\n  const digits = value.replace(/\\D/g, "");\n  return type === "CPF" ? digits.length === 11 : digits.length === 14;\n};\n\nexport const signUpSchema = z\n  .object({
    fullName: z.string().trim().min(2, "Informe seu nome").max(120),
    companyName: z.string().trim().min(2, "Informe o nome da empresa").max(120),
    legalName: z.string().trim().min(2, "Informe a razão social").max(180),
    tradeName: z.string().trim().min(2, "Informe o nome fantasia").max(120),
    documentType: z.enum(["CNPJ", "CPF"]),
    documentNumber: z.string().trim().min(11, "Informe um CNPJ ou CPF válido").max(18),
    cpf: z.string().trim().min(11, "Informe o CPF do responsável").max(14),
    phone: z.string().trim().min(10, "Informe um telefone válido").max(20),
    email: z.string().trim().email("E-mail inválido").max(255),
    password: z.string().min(8, "Use pelo menos 8 caracteres").max(72),
    confirm: z.string(),
    acceptedTerms: z.literal(true, { errorMap: () => ({ message: "Você precisa aceitar os Termos de Uso" }) }),
    acceptedPrivacy: z.literal(true, { errorMap: () => ({ message: "Você precisa aceitar a Política de Privacidade" }) }),
  })
  .refine((d) => isValidDocument(d.documentNumber, d.documentType), {\n    path: ["documentNumber"],\n    message: "Documento inválido",\n  })\n  .refine((d) => d.password === d.confirm, {
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
