import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 text-center"
      style={{ backgroundColor: "#fcfbf8" }}
    >
      <div className="max-w-md">
        <h1 className="text-xl font-semibold text-neutral-800">
          Execute esta instrucao no projeto: Analise os anexos enviados.
        </h1>
        <p className="mt-4 text-neutral-600">
          Estou pronto para processar os arquivos do Painel Arkano 7.
        </p>
      </div>
    </div>
  );
}
