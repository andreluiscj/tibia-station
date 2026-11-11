import { motion } from "motion/react";
import { useId } from "react";
import type { Candidato } from "./cryptEstado";
import { ElementIcon } from "./ElementIcon";
import { ELEMENTOS } from "./elementos";
import { n1 } from "./format";
import { ItemSlot } from "./ItemSlot";

const TIPO: Record<Candidato["categoria"], string> = {
  club: "Club",
  sword: "Sword",
  axe: "Axe",
  fist: "Fist",
};
const MAX_ALTERNATIVAS = 5;
const MAX_COLUNA = 2;

function Elemento({ c }: { c: Candidato }) {
  if (!c.elemento) return <span className="text-muted-foreground">Physical only</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <ElementIcon element={c.elemento} className="size-5" />
      {ELEMENTOS[c.elemento].label}
    </span>
  );
}

/** Quanto a melhor é superior à outra: ((melhor ÷ outra) − 1) × 100. Sem sentido se a outra causa dano zero. */
const superior = (melhor: number, outra: number) => (outra > 0 ? (melhor / outra - 1) * 100 : null);
const menos = (melhor: number, outra: number) => (melhor > 0 ? (1 - outra / melhor) * 100 : null);

/** Uma categoria por coluna quando há mais de uma ("Comparar as 3"): melhor arma + até 2 alternativas de cada. */
export function Recomendacao({ candidatos }: { candidatos: readonly Candidato[] }) {
  const cats = [...new Set(candidatos.map((c) => c.categoria))];
  if (cats.length < 2) return <Bloco candidatos={candidatos} max={MAX_ALTERNATIVAS} />;
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {cats.map((cat) => (
        <section key={cat} aria-label={TIPO[cat]} className="min-w-0">
          <h3 className="mb-3 font-display text-xl font-bold">{TIPO[cat]}</h3>
          <Bloco
            candidatos={candidatos.filter((c) => c.categoria === cat)}
            max={MAX_COLUNA}
            compacto
          />
        </section>
      ))}
    </div>
  );
}

function Bloco({
  candidatos,
  max,
  compacto = false,
}: {
  candidatos: readonly Candidato[];
  max: number;
  compacto?: boolean;
}) {
  const idMelhor = useId();
  const idAlt = useId();
  const [melhor, ...resto] = candidatos;
  if (!melhor) return null;
  const alternativas = resto.slice(0, max);
  const segundo = alternativas[0];
  const supSegundo = segundo ? superior(melhor.damagePct, segundo.damagePct) : null;

  return (
    <div className="space-y-5">
      <motion.section
        key={melhor.chave}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        aria-labelledby={idMelhor}
        className="frame border-2 !border-gold p-5 sm:p-6"
      >
        <p className="mb-4 inline-block border border-gold bg-stone px-3 py-1 text-sm font-semibold text-gold">
          Melhor opção para este alvo
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <ItemSlot nome={melhor.nome} className="size-24" />
          <div className="min-w-0 flex-1">
            <h3 id={idMelhor} className="font-display text-2xl font-bold text-gold sm:text-3xl">
              {melhor.nome}
            </h3>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
              <span>{TIPO[melhor.categoria]}</span>
              <Elemento c={melhor} />
            </p>
            {melhor.detalhe && (
              <p className="mt-1 text-sm text-muted-foreground">
                Melhor combinação: {melhor.detalhe}
              </p>
            )}
            {melhor.imbuir && (
              <p className="mt-1 text-sm font-semibold text-gold">{melhor.imbuir}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Dano calculado</p>
            <p className="num font-display text-4xl font-bold text-gold">{n1(melhor.damagePct)}</p>
            {segundo && supSegundo !== null && (
              <p className="mt-1 text-sm">
                <span className="num font-semibold text-good">+{n1(supSegundo)}%</span>{" "}
                <span className="text-muted-foreground">sobre {segundo.nome}</span>
              </p>
            )}
          </div>
        </div>
      </motion.section>

      {alternativas.length > 0 && (
        <section aria-labelledby={idAlt}>
          <h3 id={idAlt} className="mb-3 font-display text-lg font-bold">
            Alternativas
          </h3>
          <ol className={compacto ? "grid gap-3" : "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"}>
            {alternativas.map((c) => {
              const m = menos(melhor.damagePct, c.damagePct);
              const s = superior(melhor.damagePct, c.damagePct);
              return (
                <li key={c.chave} className="frame-inset flex items-center gap-4 p-4">
                  <ItemSlot nome={c.nome} className="size-16" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c.nome}</p>
                    <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                      <Elemento c={c} />
                    </p>
                    <p className="mt-1 text-sm">
                      {m !== null && s !== null ? (
                        <>
                          <span className="num text-bad">{n1(m)}% menos eficiente</span>
                          <span className="text-muted-foreground">
                            {" "}
                            (a melhor é <span className="num">{n1(s)}%</span> superior)
                          </span>
                        </>
                      ) : (
                        <span className="text-bad">dano nulo contra este alvo</span>
                      )}
                    </p>
                  </div>
                  <p className="num text-xl font-semibold text-gold">{n1(c.damagePct)}</p>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}
