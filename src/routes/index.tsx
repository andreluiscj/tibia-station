import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { CryptPreview } from "@/components/station/CryptPreview";
import { ElementLegend } from "@/components/station/ElementLegend";
import { TOOLS } from "@/components/station/nav";

export const Route = createFileRoute("/")({
  component: Home,
});

const delay = (i: number) => ({ "--i": i }) as CSSProperties;

function Status({ pronta }: { pronta: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-sm ${pronta ? "text-gold" : "text-muted-foreground"}`}
    >
      <span
        aria-hidden="true"
        className={`size-2 rotate-45 ${pronta ? "bg-gold" : "bg-gold-dim"}`}
      />
      {pronta ? "Disponível" : "Em obras"}
    </span>
  );
}

function Home() {
  const crypt = TOOLS.find((t) => t.to === "/crypt")!; // cartão em destaque
  const outras = TOOLS.filter((t) => t !== crypt);

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pt-10 sm:px-6 sm:pt-14 md:grid-cols-[1fr_15rem] md:items-end">
        <div>
          <h1 className="text-gold-glow max-w-2xl text-balance font-display text-4xl font-bold leading-[1.1] text-gold sm:text-5xl lg:text-6xl">
            Descubra o que levar para a próxima hunt
          </h1>
          <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-muted-foreground">
            Monte seu set, compare as armas da Crypt e confira a que cada criatura resiste. Dados da
            TibiaWiki, em português.
          </p>
        </div>
        <ElementLegend />
      </section>

      <section
        aria-label="Ferramentas"
        className="mx-auto mt-12 grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:grid-cols-5"
      >
        <article
          className="frame frame-link rise-in relative flex flex-col gap-5 p-6 md:col-span-3 lg:row-span-3"
          style={delay(0)}
        >
          <div className="flex items-center gap-4">
            <crypt.icon
              className="size-9 shrink-0 text-gold"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <h2 className="font-display text-2xl font-bold">
              <Link
                to={crypt.to}
                className="after:absolute after:inset-0 focus-visible:outline-none"
              >
                {crypt.titulo}
              </Link>
            </h2>
          </div>
          <p className="max-w-[52ch] leading-relaxed text-muted-foreground">{crypt.resumo}</p>
          <Status pronta={crypt.pronta} />
          <CryptPreview />
        </article>

        {outras.map((t, i) => (
          <article
            key={t.to}
            className="frame frame-link rise-in relative flex flex-col justify-between gap-4 p-6 lg:col-span-2"
            style={delay(i + 1)}
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <t.icon
                className="size-7 shrink-0 lg:size-8 text-gold"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <h2 className="font-display text-lg font-bold lg:text-xl">
                <Link to={t.to} className="after:absolute after:inset-0 focus-visible:outline-none">
                  {t.titulo}
                </Link>
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">{t.resumo}</p>
            <Status pronta={t.pronta} />
          </article>
        ))}
      </section>
    </>
  );
}
