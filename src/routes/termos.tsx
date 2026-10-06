import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({ component: TermsPage });

function TermsPage() {
  return <LegalPage title="Termos de Uso" version="2026-10-01">
    <p>Estes Termos regulam o uso do Laugh One, plataforma SaaS de gestão empresarial operada pela Laugh Company ou pela pessoa jurídica que constará na identificação legal do serviço.</p>
    <h2>1. Aceitação</h2><p>Ao criar uma conta, o usuário declara que possui capacidade e poderes para contratar o serviço em nome próprio ou da empresa indicada no cadastro e concorda com estes Termos.</p>
    <h2>2. Cadastro e informações</h2><p>O usuário deve fornecer informações verdadeiras, completas e atualizadas, inclusive CPF/CNPJ, identificação empresarial e dados do responsável quando solicitados. O usuário responde pela legitimidade das informações fornecidas e pela guarda de suas credenciais.</p>
    <h2>3. Uso permitido</h2><p>É proibido utilizar o serviço para atividades ilícitas, fraude, violação de direitos de terceiros, tentativa de acesso não autorizado, distribuição de malware ou qualquer finalidade que comprometa a segurança ou disponibilidade da plataforma.</p>
    <h2>4. Dados inseridos pelo cliente</h2><p>O cliente permanece responsável pelos dados que inserir no sistema e deverá possuir base legal e autorizações necessárias para coletá-los e compartilhá-los com o serviço. Quando aplicável, o Laugh One atuará como operador em relação aos dados tratados em nome do cliente.</p>
    <h2>5. Disponibilidade e segurança</h2><p>Adotamos medidas técnicas e administrativas razoáveis para segurança e continuidade do serviço, sem prometer disponibilidade absoluta ou risco zero.</p>
    <h2>6. Assinatura e teste</h2><p>Planos, período de teste, valores, renovação, cancelamento e condições comerciais serão apresentados no momento da contratação. O período inicial atualmente informado no cadastro é de 14 dias, sujeito às condições comerciais vigentes.</p>
    <h2>7. Propriedade intelectual</h2><p>O software, identidade visual, marcas e materiais do Laugh One permanecem protegidos pela legislação aplicável. O uso da plataforma não transfere propriedade intelectual ao cliente.</p>
    <h2>8. Suspensão e encerramento</h2><p>O acesso poderá ser suspenso ou encerrado nas hipóteses previstas nestes Termos, inclusive inadimplemento, abuso, risco de segurança ou determinação legal, observados os direitos aplicáveis.</p>
    <h2>9. Atendimento</h2><p>O canal oficial de atendimento e o endereço jurídico do controlador deverão constar nesta página antes da publicação definitiva.</p>
    <h2>10. Lei aplicável</h2><p>Aplicam-se as leis brasileiras, sem prejuízo dos direitos obrigatórios assegurados ao consumidor quando incidentes.</p>
    <p className="text-xs text-muted-foreground">Documento base técnico-jurídico. Deve ser revisado por advogado antes da publicação comercial definitiva.</p>
  </LegalPage>;
}

function LegalPage({ title, version, children }: { title: string; version: string; children: React.ReactNode }) {
  return <main className="min-h-screen bg-background px-4 py-12 text-foreground"><article className="mx-auto max-w-3xl space-y-6"><Link to="/auth" className="text-sm text-gold hover:underline">← Voltar</Link><header><h1 className="text-4xl font-bold">{title}</h1><p className="text-sm text-muted-foreground">Versão {version}</p></header><div className="space-y-4 text-sm leading-7 [&_h2]:pt-4 [&_h2]:text-lg [&_h2]:font-semibold">{children}</div></article></main>;
}
