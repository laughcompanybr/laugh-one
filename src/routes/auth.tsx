import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, Building2, User, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AuthHero } from "@/components/auth/AuthHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signInSchema,
  signUpSchema,
  forgotSchema,
  type SignInInput,
  type SignUpInput,
  type ForgotInput,
} from "@/features/auth/schemas";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: z.object({ period: z.enum(["monthly", "quarterly", "semiannual", "yearly"]).optional() }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { period } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  return (
    <AuthHero
      eyebrow="Plataforma de Gestão"
      title={mode === "forgot" ? "Recupere seu" : mode === "signup" ? "Comece sua" : "Tecnologia para"}
      highlight={mode === "forgot" ? "acesso." : mode === "signup" ? "evolução." : "evoluir."}
      tagline={
        mode === "forgot"
          ? "Enviaremos um link seguro para seu e-mail para redefinir sua senha em segundos."
          : "Bem-vindo ao Laugh One. Tecnologia criada para negócios que evoluem."
      }
    >
      <div className="bento-tile p-7 sm:p-8">
        <div className="mb-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
            {mode === "forgot" ? "Recuperar senha" : mode === "signup" ? "Criar conta" : "Entrar"}
          </p>
          <h2 className="mt-1 font-display text-2xl leading-tight">
            {mode === "forgot" ? "Enviaremos um link seguro" : mode === "signup" ? "Crie seu acesso ao Laugh One" : "Bem-vindo de volta"}
          </h2>
        </div>

        {mode === "forgot" ? (
          <ForgotForm onDone={() => setMode("signin")} />
        ) : mode === "signup" ? (
          <SignUpForm onDone={() => setMode("signin")} selectedPeriod={period} />
        ) : (
          <SignInForm onForgot={() => setMode("forgot")} onSignUp={() => setMode("signup")} />
        )}
      </div>
    </AuthHero>
  );
}

function SignInForm({ onForgot, onSignUp }: { onForgot: () => void; onSignUp: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: localStorage.getItem("laugh-one-login-email") ?? "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInInput) => {
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      toast.error("Não foi possível entrar", { description: error.message });
      return;
    }
    try {
      const { error: workspaceError } = await supabase.rpc("bootstrap_current_user_workspace");
      if (workspaceError) throw new Error(workspaceError.message);
    } catch (bootstrapError) {
      toast.error("Não foi possível preparar seu espaço de trabalho", {
        description: bootstrapError instanceof Error ? bootstrapError.message : "Tente novamente.",
      });
      await supabase.auth.signOut();
      return;
    }
    // If the account has an enrolled TOTP factor, prompt for the OTP before
    // landing on the dashboard. AAL2 upgrade happens on /mfa-verify.
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      navigate({ to: "/mfa-verify", replace: true });
      return;
    }
    toast.success("Bem-vindo!");
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Field
        icon={<Mail className="size-4" />}
        label="E-mail"
        id="email"
        type="email"
        autoComplete="email"
        {...form.register("email")}
        error={form.formState.errors.email?.message}
      />
      <Field
        icon={<Lock className="size-4" />}
        label="Senha"
        id="password"
        type="password"
        autoComplete="current-password"
        {...form.register("password")}
        error={form.formState.errors.password?.message}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgot}
          className="text-xs text-muted-foreground transition-colors hover:text-gold"
        >
          Esqueci minha senha
        </button>
      </div>
      <Button type="submit" className="h-11 w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Entrar"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Ainda não tem uma conta?{" "}
        <button type="button" onClick={onSignUp} className="font-medium text-gold hover:underline">Criar conta</button>
      </p>
    </form>
  );
}

function SignUpForm({ onDone, selectedPeriod }: { onDone: () => void; selectedPeriod?: "monthly" | "quarterly" | "semiannual" | "yearly" }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const periodLabels = { monthly: "Mensal", quarterly: "Trimestral", semiannual: "Semestral", yearly: "Anual" } as const;
  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", companyName: "", legalName: "", tradeName: "", documentType: "CNPJ", documentNumber: "", cpf: "", phone: "", email: "", password: "", confirm: "", acceptedTerms: false, acceptedPrivacy: false },
  });

  const onSubmit = async (values: SignUpInput) => {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName, company_name: values.companyName, legal_name: values.legalName, trade_name: values.tradeName, document_type: values.documentType, document_number: values.documentNumber, cpf: values.cpf, phone: values.phone, terms_version: "2026-10-01", privacy_version: "2026-10-01", selected_billing_period: selectedPeriod ?? "monthly" } },
    });
    if (error) {
      toast.error("Não foi possível criar a conta", { description: error.message });
      return;
    }
    if (data.session) {
      toast.success("Conta criada!", { description: "Sua empresa foi criada. Vamos configurar seu ambiente." });
      window.location.href = "/dashboard";
      return;
    }
    toast.success("Confirme seu e-mail", { description: "Enviamos um link para ativar sua conta. Depois, entre com seu e-mail e senha." });
    onDone();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Field icon={<User className="size-4" />} label="Seu nome" id="fullName" autoComplete="name"
        {...form.register("fullName")} error={form.formState.errors.fullName?.message} />
      <Field icon={<Building2 className="size-4" />} label="Nome da empresa" id="companyName" autoComplete="organization"
        {...form.register("companyName")} error={form.formState.errors.companyName?.message} />
      {selectedPeriod ? <div className="rounded-lg border border-gold/20 bg-gold/5 px-3 py-2 text-xs text-gold">Período escolhido: <strong>{periodLabels[selectedPeriod]}</strong>. Sua conta começa com 14 dias de teste.</div> : null}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="documentType" className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tipo de documento</Label>
          <select id="documentType" className="h-11 w-full rounded-md border border-input bg-secondary/30 px-3 text-sm" {...form.register("documentType")}>
            <option value="CNPJ">CNPJ — empresa</option>
            <option value="CPF">CPF — profissional/autônomo</option>
          </select>
        </div>
        <Field label="CNPJ ou CPF" id="documentNumber" inputMode="numeric" {...form.register("documentNumber")} error={form.formState.errors.documentNumber?.message} />
      </div>
      <Field icon={<Building2 className="size-4" />} label="Razão social / nome legal" id="legalName" autoComplete="organization" {...form.register("legalName")} error={form.formState.errors.legalName?.message} />
      <Field icon={<Building2 className="size-4" />} label="Nome fantasia" id="tradeName" autoComplete="organization" {...form.register("tradeName")} error={form.formState.errors.tradeName?.message} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="CPF do responsável" id="cpf" inputMode="numeric" {...form.register("cpf")} error={form.formState.errors.cpf?.message} />
        <Field label="Telefone / WhatsApp" id="phone" type="tel" autoComplete="tel" {...form.register("phone")} error={form.formState.errors.phone?.message} />
      </div>
      <Field icon={<Mail className="size-4" />} label="E-mail" id="email" type="email" autoComplete="email"
        {...form.register("email")} error={form.formState.errors.email?.message} />
      <Field icon={<Lock className="size-4" />} label="Senha" id="password" type="password" autoComplete="new-password"
        {...form.register("password")} error={form.formState.errors.password?.message} />
      <Field icon={<Lock className="size-4" />} label="Confirmar senha" id="confirm" type="password" autoComplete="new-password"
        {...form.register("confirm")} error={form.formState.errors.confirm?.message} />
      <Button type="submit" className="h-11 w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Criar minha conta"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Já possui acesso?{" "}
        <button type="button" onClick={onDone} className="font-medium text-gold hover:underline">Entrar</button>
      </p>
      <p className="text-center text-[11px] text-muted-foreground">Inclui um período inicial de teste de 14 dias do Plano Completo.</p>
    </form>
  );
}

function ForgotForm({ onDone }: { onDone: () => void }) {
  const form = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: ForgotInput) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error("Erro ao enviar", { description: error.message });
      return;
    }
    toast.success("E-mail enviado", { description: "Verifique sua caixa de entrada." });
    onDone();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Field
        icon={<Mail className="size-4" />}
        label="E-mail"
        id="email"
        type="email"
        {...form.register("email")}
        error={form.formState.errors.email?.message}
      />
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="h-11 flex-1" onClick={onDone}>
          Voltar
        </Button>
        <Button type="submit" className="h-11 flex-1" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Enviar link"
          )}
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Lembrou?{" "}
        <Link to="/auth" className="text-gold hover:underline">
          Voltar ao login
        </Link>
      </p>
    </form>
  );
}

function PasswordStrength({ password, confirm }: { password: string; confirm: string }) {
  const checks = [
    ["12 caracteres ou mais", password.length >= 12],
    ["Letra maiúscula", /[A-Z]/.test(password)],
    ["Letra minúscula", /[a-z]/.test(password)],
    ["Número", /[0-9]/.test(password)],
    ["Caractere especial", /[^A-Za-z0-9\s]/.test(password)],
    ["Sem espaços", password.length > 0 && !/\s/.test(password)],
  ] as const;
  const score = checks.filter(([, ok]) => ok).length;
  const strength = score <= 2 ? "Fraca" : score <= 4 ? "Média" : score === 5 ? "Forte" : "Muito forte";
  const tone = score <= 2 ? "text-rose-400" : score <= 4 ? "text-amber-400" : "text-emerald-400";
  return (
    <div className="rounded-lg border border-border/50 bg-secondary/20 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Força da senha</span>
        <span className={`text-xs font-bold ${tone}`}>{password ? strength : "Digite uma senha"}</span>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        {checks.map(([label, ok]) => (
          <div key={label} className={ok ? "text-emerald-400" : "text-muted-foreground"}>
            {ok ? <CheckCircle2 className="mr-1 inline size-3.5" /> : <XCircle className="mr-1 inline size-3.5" />}{label}
          </div>
        ))}
      </div>
      {confirm ? <p className={`text-[11px] ${password === confirm ? "text-emerald-400" : "text-rose-400"}`}>{password === confirm ? "As senhas coincidem." : "As senhas ainda não coincidem."}</p> : null}
    </div>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const Field = Object.assign(
  (props: FieldProps) => {
    const { label, error, icon, id, className, showPasswordToggle, showPassword, onTogglePassword, ...rest } = props;
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </Label>
        <div className="relative">
          {icon ? (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors">
              {icon}
            </span>
          ) : null}
          <Input
            id={id}
            className={`h-11 bg-secondary/30 ${icon ? "pl-10" : ""} ${showPasswordToggle ? "pr-11" : ""} ${className ?? ""}`}
            {...rest}
          />
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    );
  },
  { displayName: "Field" },
);
