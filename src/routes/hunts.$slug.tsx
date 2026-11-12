import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Carregando, Erro, NaoEncontrado } from "@/components/station/Estados";
import { localDaHunt } from "@/components/station/format";
import { Cont } from "@/components/station/Layout";
import { CreatureSprite } from "@/components/station/CreatureSprite";
import { NIVEL_ALVO } from "@/components/station/huntsFiltro";
import { refazerFalhas } from "@/components/station/retry";
import { PageIntro } from "@/components/station/PageIntro";
import { ResistCells } from "@/components/station/ResistCells";
import { useCreatures, useHunt } from "@/components/station/useDados";
import { wikiUrl } from "@/components/station/wiki";

export const Route = createFileRoute("/hunts/$slug")({
  head: () => ({ meta: [{ title: "Hunt | Tibia Station" }] }),
  component: HuntPage,
});

const NIVEIS = [
  ["Knight", "levelKnights"],
  ["Paladin", "levelPaladins"],
  ["Mage", "levelMages"],
  ["Monk", "levelMonks"],
] as const;

function HuntPage() {
  const { slug } = Route.useParams();
  const hunt = useHunt(slug);
  const criaturas = useCreatures();
  const h = hunt.data;

  useEffect(() => {
    if (h) document.title = `${h.name} | Tibia Station`;
  }, [h]);

  if (hunt.isPending)
    return (
      <Cont className="pt-10">
        <Carregando rotulo="Carregando a hunt…" />
      </Cont>
    );
  if (hunt.isError)
    return (
      <Cont className="pt-10">
        <Erro onTentar={() => refazerFalhas([hunt, criaturas])} />
      </Cont>
    );
  if (!h)
    return (
      <NaoEncontrado
        titulo="Hunt não encontrada"
        texto="Não existe uma hunt com esse endereço. Ela pode ter mudado de nome na TibiaWiki."
        voltarPara="/hunts"
        voltarRotulo="Ver todas as hunts"
      />
    );

  const porSlug = new Map((criaturas.data ?? []).map((c) => [c.slug, c]));
  const lista = [...h.creatures].sort((a, b) => b.weight - a.weight);

  return (
    <>
      <Cont className="pt-8">
        <Link
          to="/hunts"
          className="inline-flex min-h-11 items-center text-gold underline underline-offset-4"
        >
          Todas as hunts
        </Link>
      </Cont>
      <PageIntro titulo={h.name} compacto>
        {localDaHunt(h.city, h.location) || "Local não informado na TibiaWiki."}
      </PageIntro>

      <Cont className="mt-8">
        <dl className="frame grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
          {NIVEIS.map(([nome, campo]) => {
            const n = h[campo];
            return (
              <div key={campo}>
                <dt className="text-muted-foreground">Nível {nome}</dt>
                {n === null ? (
                  <dd className="text-muted-foreground">não informado</dd>
                ) : (
                  <dd className={`num text-2xl ${n >= NIVEL_ALVO ? "text-gold" : ""}`}>{n}</dd>
                )}
              </div>
            );
          })}
        </dl>
        <p className="mt-4 text-muted-foreground">
          {h.expRaw && <>Experiência: {h.expRaw}. </>}
          {h.lootRaw && <>Loot: {h.lootRaw}. </>}
          <a
            href={wikiUrl(h.wikiTitle, h.sourceUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline underline-offset-4"
          >
            Ver na TibiaWiki
          </a>
        </p>

        <p className="mt-4">
          <Link
            to="/crypt"
            search={{ hunt: h.slug }}
            className="inline-flex min-h-11 items-center border border-gold bg-accent px-5 font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Ver Crypt para esta hunt
          </Link>
        </p>
      </Cont>

      <Cont className="mt-10">
        <h2 className="font-display text-2xl font-bold">Criaturas ({lista.length})</h2>
        <p className="mt-2 max-w-[70ch] text-muted-foreground">
          Resistências no formato da wiki: 100 é dano neutro, 0 é imune, abaixo de 100 a criatura
          resiste, acima disso é fraca, e negativo significa que ela absorve o elemento. O peso é
          quantas vezes a criatura aparece na página da hunt.
        </p>
        {criaturas.isPending ? (
          <div className="mt-5">
            <Carregando rotulo="Carregando as criaturas…" />
          </div>
        ) : criaturas.isError ? (
          <div className="mt-5">
            <Erro onTentar={() => refazerFalhas([hunt, criaturas])} />
          </div>
        ) : lista.length === 0 ? (
          <p className="frame-inset mt-5 p-5 text-muted-foreground">
            Nenhuma criatura foi detectada para esta hunt. Consulte a página na TibiaWiki.
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {lista.map((hc) => {
              const c = porSlug.get(hc.creatureSlug);
              if (!c) return null;
              return (
                <li key={hc.creatureSlug} className="frame-inset p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <CreatureSprite slug={c.slug} name={c.name} />
                    <Link
                      to="/monstros/$slug"
                      params={{ slug: c.slug }}
                      className="font-display text-lg font-bold text-gold underline-offset-4 hover:underline"
                    >
                      {c.name}
                    </Link>
                    <span className="ml-auto text-muted-foreground">
                      peso <span className="num text-foreground">{hc.weight}</span>
                    </span>
                  </div>
                  <ResistCells criatura={c} />
                </li>
              );
            })}
          </ul>
        )}
      </Cont>
    </>
  );
}
