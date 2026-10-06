import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies" as never)({ component: CookiesPage });

function CookiesPage() {
  return <main className="min-h-screen bg-background px-4 py-12 text-foreground"><article className="mx-auto max-w-3xl space-y-6"><Link to="/auth" className="text-sm text-gold hover:underline">← Voltar</Link><header><h1 className="text-4xl font-bold">Política de Cookies</h1><p className="text-sm text-muted-foreground">Versão 2026-10-01</p></header><div className="space-y-4 text-sm leading-7 [&_h2]:pt-4 [&_h2]:text-lg [&_h2]:font-semibold">
    <p>O Laugh One utiliza cookies e tecnologias semelhantes para garantir o funcionamento do serviço e, quando autorizado, medir utilização, lembrar preferências ou realizar ações de marketing.</p>
    <h2>Cookies necessários</h2><p>São necessários para autenticação, segurança, sessão e funcionamento básico. Não dependem de consentimento quando estritamente necessários à prestação do serviço.</p>
    <h2>Cookies de preferências</h2><p>Podem guardar escolhas de interface e configurações para melhorar a experiência.</p>
    <h2>Cookies analíticos</h2><p>Podem ser utilizados para compreender uso e desempenho do produto, somente conforme a escolha do titular quando exigido.</p>
    <h2>Cookies de marketing</h2><p>Somente devem ser ativados quando houver finalidade de marketing e autorização válida, quando esta for a base legal aplicável.</p>
    <h2>Gerenciamento</h2><p>O banner permite recusar cookies não essenciais ou personalizar categorias. A escolha deve poder ser alterada posteriormente, sem custo e por procedimento facilitado.</p>
    <p className="text-xs text-muted-foreground">A lista final de cookies, fornecedores, nomes, finalidades, duração e transferências internacionais deve ser atualizada conforme as ferramentas efetivamente instaladas no Laugh One.</p>
  </div></article></main>;
}
