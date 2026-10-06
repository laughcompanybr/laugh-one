import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "Mínimo de 6 caracteres").max(72),
});

const isValidDocument = (value: string, type: "CPF" | "CNPJ") => {
  const digits = value.replace(/\D/g, "");
  if (type === "CPF") {
    if (digits.length !== 11 || /^([0-9])\1+$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
    let check = (sum * 10) % 11;
    if (check === 10) check = 0;
    if (check !== Number(digits[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
    check = (sum * 10) % 11;
    if (check === 10) check = 0;
    return check === Number(digits[10]);
  }

  if (digits.length !== 14 || /^([0-9])\1+$/.test(digits)) return false;
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += Number(digits[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let check = sum % 11;
  check = check < 2 ? 0 : 11 - check;
  if (check !== Number(digits[12])) return false;
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += Number(digits[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  check = sum % 11;
  check = check < 2 ? 0 : 11 - check;
  return check === Number(digits[13]);
};

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Informe seu nome").max(120),
    companyName: z.string().trim().min(2, "Informe o nome da empresa").max(120),
    legalName: z.string().trim().min(2, "Informe a razão social").max(180),
    tradeName: z.string().trim().min(2, "Informe o nome fantasia").max(120),
    documentType: z.enum(["CNPJ", "CPF"]),
    documentNumber: z.string().trim().min(11, "Informe um CNPJ ou CPF válido").max(18),
    cpf: z.string().trim().min(11, "Informe o CPF do responsável").max(14),
    phone: z.string().trim().min(10, "Informe um telefone válido").max(20),
    email: z.string().trim().email("E-mail inválido").max(255),
    password: z.string().min(12, "Use pelo menos 12 caracteres").max(72).regex(/[a-z]/, "Inclua pelo menos uma letra minúscula").regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula").regex(/[0-9]/, "Inclua pelo menos um número").regex(/[^A-Za-z0-9\s]/, "Inclua pelo menos um caractere especial").regex(/^\S+$/, "A senha não pode conter espaços"),
    confirm: z.string(),
    acceptedTerms: z.boolean().refine((value) => value === true, { message: "Você precisa aceitar os Termos de Uso" }),
    acceptedPrivacy: z.boolean().refine((value) => value === true, { message: "Você precisa aceitar a Política de Privacidade" }),
  })
  .refine((d) => isValidDocument(d.documentNumber, d.documentType), {
    path: ["documentNumber"],
    message: "Documento inválido",
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
    password: z.string().min(12, "Use pelo menos 12 caracteres").max(72).regex(/[a-z]/, "Inclua pelo menos uma letra minúscula").regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula").regex(/[0-9]/, "Inclua pelo menos um número").regex(/[^A-Za-z0-9\s]/, "Inclua pelo menos um caractere especial").regex(/^\S+$/, "A senha não pode conter espaços"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "As senhas não coincidem" });

export type SignInInput = z.infer<typeof signInSchema>;
export type ForgotInput = z.infer<typeof forgotSchema>;
export type ResetInput = z.infer<typeof resetSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual").max(72),
    password: z.string().min(12, "Use pelo menos 12 caracteres").max(72).regex(/[a-z]/, "Inclua pelo menos uma letra minúscula").regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula").regex(/[0-9]/, "Inclua pelo menos um número").regex(/[^A-Za-z0-9\s]/, "Inclua pelo menos um caractere especial").regex(/^\S+$/, "A senha não pode conter espaços"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "As senhas não coincidem" })
  .refine((d) => d.password !== d.currentPassword, {
    path: ["password"],
    message: "A nova senha deve ser diferente da atual",
  });
