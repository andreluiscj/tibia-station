import type { Element, ElementKey } from "@/lib/data/types";
import type { Creature } from "@/lib/data/types";
import type { Target } from "@/lib/crypt/types";
import { CreatureSprite } from "./CreatureSprite";
import { ElementIcon } from "./ElementIcon";
import { ELEMENTOS } from "./elementos";

/** Ordem pedida: Physical, Earth, Fire, Energy, Ice, Holy, Death (e Drown, quando houver). */
const ORDEM: ElementKey[] = ["physical", "earth", "fire", "energy", "ice", "holy", "death"];

interface Linha {
  el: Element;
  valor: number;
  incerto: boolean;
}

/** Formato da wiki: 100 neutro; acima de 100 a criatura RECEBE MAIS dano (bom para você); abaixo, recebe menos. */
function estilo(v: number) {
  if (v < 0) return { cor: "text-bad", borda: "border-bad", nota: "absorve (cura)" };
  if (v > 100) return { cor: "text-good", borda: "border-good", nota: "recebe mais dano" };
  if (v < 100) return { cor: "text-bad", borda: "border-bad", nota: "recebe menos dano" };
  return { cor: "text-muted-foreground", borda: "border-border", nota: "neutro" };
}

function linhasDe(criatura: Creature): Linha[] {
  const incerto = (e: Element) => criatura.resistUnconfirmed.includes(e);
  const base = ORDEM.map((el) => ({ el, valor: criatura.resist[el], incerto: incerto(el) }));
  // Drown só aparece quando a wiki confirma o valor.
  const drown = { el: "drown" as const, valor: criatura.resist.drown, incerto: incerto("drown") };
  const todas: { el: Element; valor: number | null; incerto: boolean }[] = [
    ...base,
    ...(drown.valor !== null && !drown.incerto ? [drown] : []),
  ];
  return todas.filter((l): l is Linha => l.valor !== null);
}

/** Média ponderada dos alvos de uma hunt (os 7 elementos). */
function linhasDeHunt(alvos: readonly Target[]): Linha[] {
  const peso = alvos.reduce((s, t) => s + t.weight, 0);
  return ORDEM.map((el) => ({
    el,
    valor: Math.round((alvos.reduce((s, t) => s + t.weight * t.resist[el], 0) / peso) * 10) / 10,
    incerto: false,
  }));
}

export function CriaturaCard({
  criatura,
  huntNome,
  alvos,
}: {
  /** Monstro escolhido; ausente quando o alvo é uma hunt. */
  criatura?: Creature;
  huntNome?: string;
  alvos: readonly Target[];
}) {
  const linhas = criatura ? linhasDe(criatura) : linhasDeHunt(alvos);
  const titulo = criatura?.name ?? huntNome ?? "";
  return (
    <section className="frame p-5 sm:p-6" aria-label={`Informações de ${titulo}`}>
      <div className="grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr]">
        <div className="flex flex-col items-center gap-4 border-b border-border pb-5 text-center md:border-r md:border-b-0 md:pb-0 md:pr-6">
          {criatura ? (
            <CreatureSprite
              slug={criatura.slug}
              name={criatura.name}
              className="size-32 text-5xl"
            />
          ) : (
            <ul className="flex max-w-sm flex-wrap justify-center gap-3">
              {alvos.slice(0, 12).map((a) => (
                <li key={a.id}>
                  <CreatureSprite slug={a.id} name={a.name} className="size-20 text-3xl" />
                </li>
              ))}
            </ul>
          )}
          <div>
            <h3 className="font-display text-2xl font-bold text-gold">{titulo}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {criatura
                ? [
                    criatura.hp !== null && `${criatura.hp.toLocaleString("pt-BR")} HP`,
                    criatura.bestiaryClass,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : `Média da hunt · ${alvos.length} criaturas`}
            </p>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-display text-lg font-bold">Resistências elementais</h4>
          <ul className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            {linhas.map((l) => {
              const s = estilo(l.valor);
              return (
                <li
                  key={l.el}
                  className={`frame-inset flex items-center gap-3 border-l-2 px-3 py-2.5 ${s.borda}`}
                >
                  <ElementIcon element={l.el} className="size-7" />
                  <span className="min-w-0">
                    <span className="block break-words text-sm text-muted-foreground">
                      {ELEMENTOS[l.el].label}
                    </span>
                    <span className={`num block text-xl font-semibold ${s.cor}`}>
                      {l.valor}%{l.incerto && <span aria-hidden="true">?</span>}
                    </span>
                    <span className="sr-only">
                      {s.nota}
                      {l.incerto ? ", não confirmado" : ""}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
