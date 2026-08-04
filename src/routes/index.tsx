import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import logoAsset from "@/assets/laughone.png.asset.json";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-12 text-center selection:bg-gold selection:text-gold-foreground">
      {/* Aurora Background Effect */}
      <div className="noir-aurora animate-aurora pointer-events-none absolute inset-0 opacity-40" />
      
      <div className="relative z-10 flex max-w-2xl flex-col items-center">
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold shadow-gold/10">
          <Sparkles className="size-3" />
          <span>Laugh One</span>
        </div>
        
        <img 
          src={logoAsset.url} 
          alt="Laugh One Logo" 
          className="mb-8 size-32 object-contain drop-shadow-2xl"
        />
        
        <h1 className="font-display text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Laugh One
        </h1>
        
        <div className="mt-8 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
          <p className="mb-4 font-semibold text-foreground">SaaS Infrastructure Initialized</p>
          <p>Execute esta instrucao no projeto: PROMPT DE REFATORAÇÃO ARQUITETURAL — LAUGH ONE CRM

Antes de adicionar novas funcionalidades, faça uma revisão arquitetural completa do projeto atual.

IMPORTANTE:
- Não alterar o design visual atual.
- Não remover funcionalidades existentes.
- Não mudar regras de negócio sem necessidade.
- Manter compatibilidade com todos os fluxos atuais.
- Fazer mudanças estruturais visando escalabilidade, manutenção e performance.

OBJETIVO:
Transformar o projeto em uma arquitetura profissional preparada para crescimento como SaaS Multi-Tenant.

====================================
1. AUDITORIA COMPLETA DO PROJETO
====================================

Analise toda a aplicação:

- Estrutura de pastas atual.
- Componentes React.
- Hooks personalizados.
- Serviços.
- Integrações com Supabase.
- Queries existentes.
- Estados globais.
- Tipagens TypeScript.
- Fluxo de autenticação.
- Controle Multi-Tenant.
- Permissões e níveis de acesso.

Identifique:

- Código duplicado.
- Componentes com muitas responsabilidades.
- Funções repetidas.
- Queries ineficientes.
- Hooks mal organizados.
- Arquivos muito grandes.
- Dependências desnecessárias.
- Problemas de escalabilidade.

====================================
2. NOVA ORGANIZAÇÃO POR DOMÍNIO
====================================

Estruture o projeto seguindo um Domain-Driven Design leve.

Organize por domínio de negócio:

src/

├── app/
│   ├── routes
│   ├── providers
│   └── config

├── domains/

│   ├── auth/
│   ├── tenants/
│   ├── users/
│   ├── clients/
│   ├── sales/
│   ├── finance/
│   ├── products/
│   ├── reports/
│   └── settings/

Cada domínio deve conter:

- components
- hooks
- services
- repositories
- types
- schemas
- utils

Evitar uma estrutura baseada apenas em "components", "pages" e "utils".

====================================
3. CRIAR CAMADAS DE RESPONSABILIDADE
====================================

Implementar uma separação clara:

UI Layer:
Responsável apenas pela interface.

↓

Services Layer:
Responsável pelas regras de negócio.

↓

Repositories Layer:
Responsável pelo acesso ao banco.

↓

Database:
Supabase/PostgreSQL.

Exemplo:

Componente React NÃO deve fazer:

- Query direta no Supabase.
- Manipulação complexa de dados.
- Regras de permissão.

Essas responsabilidades devem estar nos services/repositories.

====================================
4. PADRONIZAÇÃO TYPESCRIPT
====================================

Revisar toda tipagem.

Objetivos:

- Remover "any".
- Criar interfaces consistentes.
- Criar tipos compartilhados.
- Padronizar nomes.

Exemplo:

Antes:

clientData
customerInfo
user_client

Depois:

Client
TenantUser
Organization

Criar um padrão único para:

- entidades.
- DTOs.
- respostas da API.
- estados.
- formulários.

====================================
5. REVISÃO DO BANCO SUPABASE
====================================

Auditar:

- Estrutura das tabelas.
- Relacionamentos.
- Foreign keys.
- Índices.
- Campos redundantes.
- Campos sem utilização.

Garantir arquitetura Multi-Tenant correta:

Todas as entidades devem estar relacionadas ao tenant_id.

Validar:

- RLS ativo em todas tabelas sensíveis.
- Policies corretas.
- Isolamento entre empresas.
- Usuário nunca consegue acessar dados de outro tenant.

Criar índices quando necessário para:

- tenant_id
- created_at
- status
- relacionamentos frequentes

====================================
6. PERFORMANCE
====================================

Revisar:

- Queries repetidas.
- N+1 queries.
- Carregamentos desnecessários.
- Renderizações excessivas.
- Componentes sem memoização quando necessário.

Aplicar:

- React Query corretamente.
- Cache adequado.
- Lazy loading.
- Paginação onde necessário.

====================================
7. PADRÃO DE NOMENCLATURA
====================================

Criar um padrão global:

Componentes:

PascalCase

Ex:
ClientCard.tsx

Hooks:

use + Nome

Ex:
useClients.ts

Services:

Nome + Service

Ex:
ClientService.ts

Repositories:

Nome + Repository

Ex:
ClientRepository.ts


Banco:

snake_case

Código:

camelCase

====================================
8. DOCUMENTAÇÃO DA ARQUITETURA
====================================

Criar documentação:

/docs

Com:

- Arquitetura geral.
- Fluxo de autenticação.
- Estrutura Multi-Tenant.
- Fluxo de dados.
- Como criar novos módulos.
- Padrões utilizados.

Criar também:

ARCHITECTURE.md

Explicando:
- Como o sistema funciona.
- Onde cada tipo de código deve ficar.
- Como adicionar novas funcionalidades.

====================================
9. SEGURANÇA
====================================

Auditar:

- Autenticação.
- Autorização.
- Sessões.
- Tokens.
- Permissões.

Garantir:

- Nenhuma informação sensível exposta no frontend.
- Nenhum tenant acessa dados de outro tenant.
- Validação no backend sempre que necessário.

====================================
10. RESULTADO ESPERADO
====================================

Ao final:

O Laugh One deve estar preparado para:

- Crescer para milhares de empresas.
- Receber novos módulos.
- Possuir API pública.
- Ter integração com IA.
- Ter aplicativo mobile.
- Possuir marketplace.
- Suportar múltiplos planos SaaS.

Faça a refatoração em etapas seguras.

Antes de modificar arquivos críticos, analise dependências e preserve todas as funcionalidades existentes.</p>
        </div>
        
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <div className="h-px w-12 bg-gold/30" />
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
            Automation Central & Workflow Engine Active
          </span>
          <div className="h-px w-12 bg-gold/30" />
        </div>
      </div>
      
      {/* Decorative hairline */}
      <div className="gold-hairline absolute bottom-0 left-0 h-[1px] w-full opacity-30" />
    </div>
  );
}
