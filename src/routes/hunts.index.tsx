import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { localDaHunt } from "@/components/station/format";
import { normalizar } from "@/components/station/busca";
import { Chip } from "@/components/station/Chip";
import { Carregando, Erro, Vazio } from "@/components/station/Estados";
import {
  NIVEL_ALVO,
  filtrarHunts,
  nivelDaHunt,
  type VocFiltro,
} from "@/components/station/huntsFiltro";
import { Cont } from "@/components/station/Layout";
import { PageIntro } from "@/components/station/PageIntro";
import { useHunts } from "@/components/station/useDados";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/hunts/")({
  head: () => ({
    meta: [
      { title: "Hunts | Tibia Station" },
      {
        name: "description",
        content:
          "Encontre hunts por nome, cidade, vocação e nível, com prioridade para o nível 450 ou mais, e veja as criaturas de cada uma.",
      },
    ],
  }),
  component: HuntsPage,
});

const VOCACOES: [VocFiltro, string][] = [
  ["todas", "Todas"],
  ["knight", "Knight"],
  ["paladin", "Paladin"],
  ["mage", "Mage"],
  ["monk", "Monk"],
];
const NIVEIS_ROTULO = [
  ["Knight", "levelKnights"],
  ["Paladin", "levelPaladins"],
  ["Mage", "levelMages"],
  ["Monk", "levelMonks"],
] as const;
const PAGINA = 11;
const pagBtn =
  "min-h-11 border border-border bg-metal px-4 font-semibold transition-colors enabled:hover:border-gold-dim enabled:hover:bg-metal-high disabled:cursor-not-allowed disabled:opacity-50";

function HuntsPage() {
  const q = useHunts();
  const [busca, setBusca] = useState("");
  const [voc, setVoc] = useState<VocFiltro>("todas");
  const [so450, setSo450] = useState(false);
  const [pag, setPag] = useState(0);

  const textos = useMemo(
    () =>
      new Map(
        (q.data ?? []).map((h) => [
          h.slug,
          normalizar(`${h.name} ${h.city ?? ""} ${h.location ?? ""}`),
        ]),
      ),
    [q.data],
  );
  const lista = useMemo(() => {
    const nq = normalizar(busca);
    return filtrarHunts(q.data ?? [], { voc, so450 }).filter(
      (h) => !nq || (textos.get(h.slug) ?? "").includes(nq),
    );
  }, [q.data, voc, so450, busca, textos]);

  const ultima = Math.max(0, Math.ceil(lista.length / PAGINA) - 1);
  const inicio = Math.min(pag, ultima) * PAGINA;
  const pagina = lista.slice(inicio, inicio + PAGINA);

  const limpar = () => {
    setBusca("");
    setVoc("todas");
    setSo450(false);
    setPag(0);
  };

  return (
    <>
      <PageIntro titulo="Hunts" eyebrow="O ATLAS" numeral="IV">
        Encontre sua próxima hunt e conheça as criaturas de cada lugar.
      </PageIntro>

      <Cont className="mt-8">
        <div className="frame-inset grid gap-5 p-5 md:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="busca-hunt" className="mb-1.5 block text-sm text-muted-foreground">
              Buscar hunt
            </label>
            <Input
              id="busca-hunt"
              type="search"
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPag(0);
              }}
              placeholder="Nome, cidade ou local"
              className="h-11 rounded-none bg-background text-base"
            />
          </div>
          <fieldset>
            <legend className="mb-1.5 text-sm text-muted-foreground">Vocação</legend>
            <div className="flex flex-wrap gap-2">
              {VOCACOES.map(([chave, rotulo]) => (
                <Chip
                  key={chave}
                  ativo={voc === chave}
                  onClick={() => {
                    setVoc(chave);
                    setPag(0);
                  }}
                >
                  {rotulo}
                </Chip>
              ))}
            </div>
          </fieldset>
          <label className="flex min-h-11 items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={so450}
              onChange={(e) => {
                setSo450(e.target.checked);
                setPag(0);
              }}
              className="size-5 accent-gold"
            />
            Só hunts de nível {NIVEL_ALVO} ou mais
          </label>
        </div>

        <div className="mt-6">
          {q.isPending ? (
            <Carregando rotulo="Carregando as hunts…" linhas={6} />
          ) : q.isError ? (
            <Erro onTentar={() => void q.refetch()} />
          ) : lista.length === 0 ? (
            <Vazio
              titulo="Nenhuma hunt encontrada"
              texto="Nenhuma hunt bate com esses filtros. Tire algum filtro ou confira a grafia da busca."
            >
              <button
                type="button"
                onClick={limpar}
                className="min-h-11 border border-border bg-metal px-5 font-semibold hover:border-gold-dim"
              >
                Limpar filtros
              </button>
            </Vazio>
          ) : (
            <>
              <p aria-live="polite" className="mb-3 text-muted-foreground">
                {lista.length} {lista.length === 1 ? "hunt" : "hunts"}
              </p>
              <div className="overflow-x-auto border border-border bg-card">
                <table className="w-full min-w-[40rem] border-collapse text-left">
                  <thead className="surface-dark">
                    <tr className="micro">
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Hunt
                      </th>
                      <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">
                        Localização
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Nível por vocação
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">
                        Criaturas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagina.map((h) => (
                      <tr
                        key={h.slug}
                        className="group relative border-t border-border transition-colors duration-200 even:bg-muted/60 hover:bg-gold-light/30"
                      >
                        <th
                          scope="row"
                          className="px-4 py-3 align-top font-display text-base font-bold"
                        >
                          <Link
                            to="/hunts/$slug"
                            params={{ slug: h.slug }}
                            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-ring"
                          >
                            {h.name}
                          </Link>
                          <span className="mt-0.5 block font-sans text-sm font-normal text-muted-foreground md:hidden">
                            {localDaHunt(h.city, h.location) || "Local não informado"}
                          </span>
                        </th>
                        <td className="hidden px-4 py-3 align-top text-muted-foreground md:table-cell">
                          {localDaHunt(h.city, h.location) || "Local não informado"}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className="flex flex-wrap gap-1.5">
                            {NIVEIS_ROTULO.map(([nome, campo]) => {
                              const n = h[campo];
                              if (n === null) return null;
                              if (voc !== "todas" && nivelDaHunt(h, voc) !== n) return null;
                              return (
                                <span
                                  key={campo}
                                  className={`border px-2 py-0.5 text-sm ${n >= NIVEL_ALVO ? "border-gold-dim text-gold" : "border-border text-muted-foreground"}`}
                                >
                                  {nome} <span className="num">{n}</span>
                                </span>
                              );
                            })}
                          </span>
                        </td>
                        <td className="num px-4 py-3 text-right align-top">
                          {h.creatures.length}
                          <span
                            aria-hidden="true"
                            className="ml-1 text-gold transition-transform group-hover:translate-x-0.5 inline-block"
                          >
                            ›
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <nav aria-label="Paginação" className="mt-4 flex items-center justify-between gap-3">
                <p className="text-muted-foreground">
                  Exibindo <span className="num">{inicio + 1}</span>–
                  <span className="num">{Math.min(inicio + PAGINA, lista.length)}</span> de{" "}
                  <span className="num">{lista.length}</span> hunts
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pag === 0}
                    onClick={() => setPag(pag - 1)}
                    className={pagBtn}
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    disabled={pag >= ultima}
                    onClick={() => setPag(pag + 1)}
                    className={pagBtn}
                  >
                    Próxima →
                  </button>
                </div>
              </nav>
            </>
          )}
        </div>
      </Cont>
    </>
  );
}
