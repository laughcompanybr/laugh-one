# Laugh One Architecture Documentation

## Overview
Laugh One is a Multi-Tenant SaaS platform built with TanStack Start, Supabase, and Tailwind CSS. The architecture follows a **Domain-Driven Design (DDD)** approach with clear separation of concerns between UI, Business Logic (Services), and Data Access (Repositories).

## Directory Structure
- `src/app/`: Global configuration, providers, and main router.
- `src/domains/`: Business domains. Each domain contains:
    - `components/`: Domain-specific UI components.
    - `hooks/`: Domain-specific React hooks.
    - `services/`: Business logic and rules.
    - `repositories/`: Data access layer (Supabase interactions).
    - `types/`: TypeScript definitions and DTOs.
    - `utils/`: Helper functions specific to the domain.
- `src/components/ui/`: Generic shadcn/ui components.
- `src/integrations/`: Third-party integration clients (Supabase, etc.).

## Multi-Tenancy
Every business entity is associated with a `company_id`. Tenant isolation is enforced at:
1. **Database Level**: Row Level Security (RLS) policies using `auth.uid()` and tenant lookup.
2. **Application Level**: All queries are scoped via the `useCompany` hook or server-side tenant context.

## Layers of Responsibility
1. **UI Layer**: React components using hooks for state and interaction.
2. **Hooks Layer**: Manages local state and coordinates Service calls.
3. **Service Layer**: Implements business rules, validation, and complex logic.
4. **Repository Layer**: The only layer allowed to perform direct database queries.

## Naming Conventions
- **Components**: `PascalCase.tsx`
- **Hooks**: `useCamelCase.ts`
- **Services**: `DomainService.ts`
- **Repositories**: `DomainRepository.ts`
- **Database Tables**: `snake_case`
- **JS/TS Variables**: `camelCase`

## Creating a New Module
1. Create a new directory under `src/domains/`.
2. Define the schema in Supabase with `company_id`.
3. Implement the Repository, Service, and Hooks.
4. Register the module in the Platform Registry if dynamic activation is required.
