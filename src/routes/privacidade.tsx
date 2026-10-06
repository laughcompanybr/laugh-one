import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({ component: PrivacyPage });

function PrivacyPage() {
  return <main className="min-h-screen bg-background px-4 py-12 text-foreground"><article className="mx-auto max-w-3xl space-y-6"><Link to="/auth" className="text-sm text-gold hover:underline">← Voltar</Link><header><h1 className="text-4xl font-bold">Política de Privacidade</h1><p className="text-sm text-muted-foreground">Versão 2026-10-01</p></header><div className="space-y-4 text-sm leading-7 [&_h2]:pt-4 [&_h2]:text-lg [&_h2]:font-semibold">
    <p>Esta Política explica como o Laugh One trata dados pessoais no contexto do cadastro, autenticação, suporte e prestação do serviço.</p>
    <h2>1. Dados tratados</h2><p>Podemos tratar nome, e-mail, telefone, CPF/CNPJ, razão social, nome fantasia, endereço empresarial, dados de uso, registros de segurança, dados de autenticação e informações inseridas pelo cliente na plataforma.</p>
    <h2>2. Finalidades</h2><p>Os dados são utilizados para criar e administrar contas, prestar o serviço, segurança e prevenção a fraude, atendimento, faturamento, cumprimento de obrigações legais e regulatórias e melhoria do produto, conforme a base legal aplicável.</p>
    <h2>3. Cookies</h2><p>Cookies estritamente necessários podem ser utilizados para funcionamento e segurança. Cookies analíticos, de preferências e marketing serão tratados conforme as escolhas realizadas no banner e na Política de Cookies.</p>
    <h2>4. Compartilhamento</h2><p>Dados podem ser compartilhados com fornecedores necessários à operação, como infraestrutura, autenticação, comunicação, pagamentos e suporte, sempre observadas as finalidades e medidas de segurança aplicáveis.</p>
    <h2>5. Retenção e segurança</h2><p>Os dados são mantidos pelo período necessário às finalidades informadas e às obrigações legais. Aplicamos controles de acesso, isolamento por empresa, políticas de banco de dados e medidas de segurança compatíveis com o serviço.</p>
    <h2>6. Direitos do titular</h2><p>O titular pode solicitar confirmação, acesso, correção, eliminação quando aplicável, informação sobre compartilhamento e demais direitos previstos na LGPD, pelos canais oficiais informados pelo controlador.</p>
    <h2>7. Solicitações do titular</h2>
    <p>Solicitações relacionadas aos direitos previstos na LGPD devem ser encaminhadas pelo canal de privacidade indicado pelo controlador. O Laugh One poderá solicitar informações necessárias para confirmar a identidade do solicitante e evitar atendimento indevido.</p>
    <h2>8. Incidentes de segurança</h2>
    <p>Incidentes relevantes envolvendo dados pessoais serão tratados por procedimento interno de segurança e comunicação, quando aplicável, conforme a legislação e regulamentação da ANPD.</p>
    <h2>9. Controlador, operador e encarregado</h2>
    <p>A definição de controlador, operador e demais responsabilidades dependerá do contexto de cada tratamento. No SaaS, a empresa cliente normalmente determina as finalidades dos dados que insere na plataforma, enquanto o Laugh One presta a infraestrutura e os serviços conforme contrato e instruções aplicáveis.</p>
    <p><strong>Dados jurídicos do controlador:</strong> devem ser preenchidos com a razão social, CNPJ, endereço e canal oficial de privacidade antes da publicação comercial definitiva.</p>
    <p className="text-xs text-muted-foreground">Documento base técnico-jurídico. Deve ser revisado por advogado e pelo responsável de privacidade antes da publicação comercial definitiva.</p>
  </div></article></main>;
}
