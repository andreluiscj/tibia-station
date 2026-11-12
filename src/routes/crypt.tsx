import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CryptCalculator, type Patch } from "@/components/station/CryptCalculator";
import { parseSearch, type CryptSearch } from "@/components/station/cryptEstado";
import { Cont } from "@/components/station/Layout";
import { PageIntro } from "@/components/station/PageIntro";

export const Route = createFileRoute("/crypt")({
  validateSearch: (raw: Record<string, unknown>): CryptSearch => parseSearch(raw),
  head: () => ({
    meta: [
      { title: "Crypt Calculator | Tibia Station" },
      {
        name: "description",
        content:
          "Descubra qual arma da Crypt rende mais contra uma criatura ou uma hunt, com Elemental Pierce nas regras oficiais da TibiaWiki.",
      },
    ],
  }),
  component: CryptPage,
});

function CryptPage() {
  const bruto = Route.useSearch();
  // O router mescla o search validado com o cru herdado: valida de novo para nenhum valor inválido chegar à tela.
  const estado = useMemo(() => parseSearch(bruto as Record<string, unknown>), [bruto]);
  const navigate = Route.useNavigate();
  // null no patch remove o parâmetro (volta ao padrão): a URL fica curta e compartilhável.
  const onChange = (patch: Patch) =>
    void navigate({
      search: (prev: CryptSearch) => parseSearch({ ...prev, ...patch }),
      replace: true,
    });

  return (
    <>
      <PageIntro titulo="Crypt Calculator" eyebrow="A FORJA" numeral="II">
        Compare as armas da Crypt e prepare sua próxima batalha.
      </PageIntro>
      <Cont className="mt-8">
        <CryptCalculator estado={estado} onChange={onChange} />
      </Cont>
    </>
  );
}
