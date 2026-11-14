import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import { CryptPreview } from "@/components/station/CryptPreview";
import { btnPrimario, btnSecundario } from "@/components/station/estilos";
import { HeroCastle } from "@/components/station/HeroCastle";
import { useT } from "@/lib/i18n";
import { emptySlotUrl } from "@/lib/storage";
import { TOOLS } from "@/components/station/nav";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Tibia Station" }] }),
  component: Home,
});

const delay = (i: number) => ({ "--i": i }) as CSSProperties;
const NUMERAIS = ["II / A FORJA", "I / O ARSENAL"];
// Casas do set vazio na mesma grade 3 colunas do Set Builder (null = espaço).
const SET_VAZIO = [
  "amulet",
  "helmet",
  "backpack",
  "weapon",
  "armor",
  "shield",
  "ring",
  "legs",
  "trinket",
  null,
  "boots",
  null,
] as const;
const ORDEM: ToolTo[] = ["/damage-calculator", "/set-builder"];
type ToolTo = (typeof TOOLS)[number]["to"];

function Home() {
  const t = useT();
  const tools = ORDEM.map((to) => TOOLS.find((x) => x.to === to)!);
  const [crypt, ...outras] = tools;

  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-10 sm:px-6 sm:pt-14 md:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="micro mb-4 text-gold">{t("Seu companheiro para explorar Tibia")}</p>
          <h1 className="text-balance font-display text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl lg:text-6xl">
            {t("Descubra o que levar para a próxima hunt.")}
          </h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
            {t("Monte seu set, compare as armas da Crypt e confira a que cada criatura resiste.")}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/damage-calculator" className={btnPrimario}>
              {t("Comparar armas →")}
            </Link>
            <Link to="/set-builder" className={btnSecundario}>
              {t("Montar meu set")}
            </Link>
          </div>
        </div>
        <div className="frame overflow-hidden p-2">
          <HeroCastle />
        </div>
      </section>

      <section aria-label={t("Ferramentas")} className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
        <p className="micro text-gold">{t("Mais preparo. Menos achismo.")}</p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
          {t("Escolha sua ferramenta")}
        </h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-5">
          <article
            className="frame frame-link rise-in surface-dark relative flex flex-col gap-4 p-6 lg:col-span-3"
            style={delay(0)}
          >
            <p className="micro text-gold">{t(NUMERAIS[0])}</p>
            <h3 className="font-display text-2xl font-bold">
              <Link
                to={crypt.to}
                className="after:absolute after:inset-0 focus-visible:outline-none"
              >
                {t(crypt.titulo)}
              </Link>
            </h3>
            <p className="max-w-[52ch] leading-relaxed text-muted-foreground">{t(crypt.resumo)}</p>
            <CryptPreview />
            <span className="mt-auto font-semibold text-gold">{t("Abrir calculadora →")}</span>
          </article>

          {outras.map((tool, i) => (
            <article
              key={tool.to}
              className="frame frame-link rise-in relative order-first flex flex-col gap-3 p-6 lg:col-span-2"
              style={delay(i + 1)}
            >
              <p className="micro text-gold">{t(NUMERAIS[i + 1])}</p>
              <h3 className="font-display text-xl font-bold">
                <Link
                  to={tool.to}
                  className="after:absolute after:inset-0 focus-visible:outline-none"
                >
                  {t(tool.titulo)}
                </Link>
              </h3>
              <p className="leading-relaxed text-muted-foreground">{t(tool.resumo)}</p>
              <ul
                aria-hidden="true"
                className="mx-auto my-2 grid w-full max-w-56 grid-cols-3 gap-2"
              >
                {SET_VAZIO.map((n, k) => (
                  <li key={k} className={n ? "frame-inset aspect-square p-1.5" : undefined}>
                    {n && (
                      <img
                        src={emptySlotUrl(n)}
                        alt=""
                        className="size-full object-contain opacity-70 [image-rendering:pixelated]"
                      />
                    )}
                  </li>
                ))}
              </ul>
              <span className="mt-auto font-semibold text-gold">
                {tool.to === "/hunts" ? t("Explorar hunts →") : t("Montar meu set →")}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 grid max-w-6xl gap-5 px-4 sm:px-6 ">
        <div className="frame frame-link surface-dark relative flex flex-col justify-between gap-3 p-6">
          <p className="micro text-gold">{t("III / O Grimório")}</p>
          <h2 className="font-display text-xl font-bold">
            <Link
              to="/como-calculamos"
              className="after:absolute after:inset-0 focus-visible:outline-none"
            >
              {t("Conheça as regras.")}
            </Link>
          </h2>
          <p className="text-muted-foreground">{t("Pierce, resistências e dano relativo.")}</p>
          <span className="font-semibold text-gold">{t("Como calculamos →")}</span>
        </div>
      </section>
    </>
  );
}
