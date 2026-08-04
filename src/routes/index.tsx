import { createFileRoute } from "@tanstack/react-router";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 text-center"
      style={{ backgroundColor: "#fcfbf8" }}
    >
      <div className="max-w-md">
        <h1 className="text-xl font-semibold text-neutral-800">
          Execute esta instrução no projeto: Analise os anexos enviados.
        </h1>
        <p className="mt-4 text-neutral-600">
          Estou pronto para processar os arquivos do Painel Arkano 7.
        </p>
      </div>
    </div>
  );
}
