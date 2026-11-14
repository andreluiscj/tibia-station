import { createFileRoute, redirect } from "@tanstack/react-router";

// Endereço antigo: links salvos continuam funcionando e levam à Damage Calculator com a mesma busca.
export const Route = createFileRoute("/crypt")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/damage-calculator", search: search as never, replace: true });
  },
});
