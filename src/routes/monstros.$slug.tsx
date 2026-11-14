import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Carregando, Erro, NaoEncontrado } from "@/components/station/Estados";
import { ELEMENTOS_EXTRAS, ELEMENTOS_PRINCIPAIS } from "@/components/station/elementos";
import { inteiro } from "@/components/station/format";
import { useT } from "@/lib/i18n";
import { Cont } from "@/components/station/Layout";
import { PageIntro } from "@/components/station/PageIntro";
import { ResistanceBar } from "@/components/station/ResistanceBar";
import { useCreature, useHunts } from "@/components/station/useDados";
import { wikiUrl } from "@/components/station/wiki";

export const Route = createFileRoute("/monstros/$slug")({
  head: () => ({ meta: [{ title: "Criatura | Tibia Station" }] }),
  component: MonstroPage,
});

const MAX_HUNTS = 12;

function MonstroPage() {
  const t = useT();
  const { slug } = Route.useParams();
  const q = useCreature(slug);
  const hunts = useHunts();
  const c = q.data;

  useEffect(() => {
    if (c) document.title = `${c.name} | Tibia Station`;
  }, [c]);

  if (q.isPending)
    return (
      <Cont className="pt-10">
        <Carregando rotulo="Carregando a criatura…" />
      </Cont>
    );
  if (q.isError)
    return (
      <Cont className="pt-10">
        <Erro onTentar={() => void q.refetch()} />
      </Cont>
    );
  if (!c)
    return (
      <NaoEncontrado
        titulo="Criatura não encontrada"
        texto="Não existe uma criatura com esse endereço. Volte ao início e escolha uma ferramenta."
        voltarPara="/"
        voltarRotulo="Ir para o início"
      />
    );

  const naHunt = (hunts.data ?? []).filter((h) =>
    h.creatures.some((x) => x.creatureSlug === c.slug),
  );
  const naoConf = new Set(c.resistUnconfirmed);
  const info: [string, string][] = [
    ["Vida", c.hp === null ? "não informado" : inteiro(c.hp)],
    ["Experiência", c.exp === null ? "não informado" : inteiro(c.exp)],
    ["Classe do bestiário", c.bestiaryClass ?? "não informado"],
    ["Dificuldade do bestiário", c.bestiaryLevel ?? "não informado"],
  ];

  return (
    <>
      <PageIntro titulo={c.name}>
        Resistências no formato da TibiaWiki: 100 é dano neutro, abaixo disso a criatura resiste,
        acima disso é fraca, e negativo significa que ela absorve o elemento.
      </PageIntro>

      <Cont className="mt-8">
        <dl className="frame grid grid-cols-2 gap-4 p-5 lg:grid-cols-4">
          {info.map(([k, v]) => (
            <div key={k}>
              <dt className="text-muted-foreground">{t(k)}</dt>
              <dd className={v === "não informado" ? "text-muted-foreground" : "num text-xl"}>
                {v === "não informado" ? t(v) : v}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4">
          <a
            href={wikiUrl(c.wikiTitle, c.sourceUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline underline-offset-4"
          >
            {t("Ver na TibiaWiki")}
          </a>
        </p>

        <p className="mt-4">
          <Link
            to="/crypt"
            search={{ monster: c.slug }}
            className="inline-flex min-h-11 items-center border border-gold bg-accent px-5 font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            {t("Ver Crypt para esta criatura")}
          </Link>
        </p>
      </Cont>

      <Cont className="mt-10">
        <h2 className="font-display text-2xl font-bold">{t("Resistências")}</h2>
        <ul className="mt-5 grid gap-x-10 gap-y-5 md:grid-cols-2">
          {ELEMENTOS_PRINCIPAIS.map((e, i) => (
            <li key={e}>
              <ResistanceBar
                element={e}
                value={c.resist[e]}
                assumed={naoConf.has(e)}
                delay={i * 0.07}
              />
            </li>
          ))}
        </ul>
        <h3 className="mt-8 font-display text-xl font-bold">{t("Outros danos")}</h3>
        <ul className="mt-4 grid gap-x-10 gap-y-5 md:grid-cols-2">
          {ELEMENTOS_EXTRAS.map((e) => (
            <li key={e}>
              <ResistanceBar element={e} value={c.resist[e]} assumed={naoConf.has(e)} />
            </li>
          ))}
        </ul>
      </Cont>

      {naHunt.length > 0 && (
        <Cont className="mt-10">
          <h2 className="font-display text-2xl font-bold">{t("Hunts onde aparece")}</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {naHunt.slice(0, MAX_HUNTS).map((h) => (
              <li key={h.slug}>
                <Link
                  to="/hunts/$slug"
                  params={{ slug: h.slug }}
                  className="frame-link inline-flex min-h-11 items-center border border-border bg-metal px-4"
                >
                  {h.name}
                </Link>
              </li>
            ))}
          </ul>
          {naHunt.length > MAX_HUNTS && (
            <p className="mt-3 text-muted-foreground">
              {t("E mais {n}. Veja a lista completa em", { n: naHunt.length - MAX_HUNTS })}{" "}
              <Link to="/hunts" className="text-gold underline underline-offset-4">
                Hunts
              </Link>
              .
            </p>
          )}
        </Cont>
      )}
    </>
  );
}
