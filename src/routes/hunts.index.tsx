import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
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
const PAGINA = 40;

function HuntsPage() {
  const q = useHunts();
  const [busca, setBusca] = useState("");
  const [voc, setVoc] = useState<VocFiltro>("todas");
  const [so450, setSo450] = useState(false);
  const [mostrar, setMostrar] = useState(PAGINA);

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

  const limpar = () => {
    setBusca("");
    setVoc("todas");
    setSo450(false);
    setMostrar(PAGINA);
  };

  return (
    <>
      <PageIntro titulo="Hunts" />

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
                setMostrar(PAGINA);
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
                    setMostrar(PAGINA);
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
                setMostrar(PAGINA);
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
              <ul className="space-y-2">
                {lista.slice(0, mostrar).map((h, i) => (
                  <motion.li
                    key={h.slug}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(i, 10) * 0.03 }}
                  >
                    <Link
                      to="/hunts/$slug"
                      params={{ slug: h.slug }}
                      className="frame-link flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border border-border bg-card px-4 py-3"
                    >
                      <span className="min-w-0">
                        <span className="block font-display text-lg font-bold">{h.name}</span>
                        <span className="block text-muted-foreground">
                          {localDaHunt(h.city, h.location) || "Local não informado"}
                        </span>
                      </span>
                      <span className="flex flex-wrap gap-x-4 gap-y-1">
                        {NIVEIS_ROTULO.map(([nome, campo]) => {
                          const n = h[campo];
                          if (n === null) return null;
                          if (voc !== "todas" && nivelDaHunt(h, voc) !== n) return null;
                          return (
                            <span
                              key={campo}
                              className={n >= NIVEL_ALVO ? "text-gold" : "text-muted-foreground"}
                            >
                              {nome} <span className="num">{n}</span>
                            </span>
                          );
                        })}
                        <span className="text-muted-foreground">
                          <span className="num">{h.creatures.length}</span> criaturas
                        </span>
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              {lista.length > mostrar && (
                <button
                  type="button"
                  onClick={() => setMostrar((m) => m + PAGINA)}
                  className="mt-4 min-h-11 border border-border bg-metal px-5 font-semibold hover:border-gold-dim"
                >
                  Mostrar mais {Math.min(PAGINA, lista.length - mostrar)}
                </button>
              )}
            </>
          )}
        </div>
      </Cont>
    </>
  );
}
