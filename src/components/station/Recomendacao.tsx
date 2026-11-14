import { useT } from "@/lib/i18n";
import { motion } from "motion/react";
import { useContext, useId } from "react";
import { MAX_ALTERNATIVAS, ProficienciaCtx, type Candidato, type ImbModo } from "./cryptEstado";
import { Switch } from "@/components/ui/switch";
import { ElementIcon } from "./ElementIcon";
import { ELEMENTOS } from "./elementos";
import { n1 } from "./format";
import { ItemSlot } from "./ItemSlot";
import { ProficienciaDialog } from "./ProficienciaDialog";

const TIPO: Record<Candidato["categoria"], string> = {
  club: "Club",
  sword: "Sword",
  axe: "Axe",
  fist: "Fist",
};

function Elemento({ c }: { c: Candidato }) {
  const t = useT();
  if (!c.elemento) return <span className="text-muted-foreground">{t("Physical only")}</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <ElementIcon element={c.elemento} className="size-5" />
      {ELEMENTOS[c.elemento].label}
    </span>
  );
}

/** "<ícone> Elemento - Level N - K Imbuiments"; o trecho que a arma não informa é omitido. */
function LinhaInfo({ c }: { c: Candidato }) {
  const t = useT();
  // A Crypt é sempre Physical; o elemento só aparece quando a melhor combinação imbui.
  const el = c.origem === "crypt" && !c.imbued ? "physical" : (c.elemento ?? "physical");
  const imb = c.imbuiments;
  return (
    <p
      data-linha-info
      className="flex min-w-0 flex-nowrap items-center gap-x-1.5 whitespace-nowrap text-xs sm:text-sm lg:text-xs xl:text-sm"
    >
      <ElementIcon element={el} className="size-4 shrink-0" />
      <span className="min-w-0 truncate">{ELEMENTOS[el].label}</span>
      {c.nivel !== undefined && <span className="num shrink-0">- Level {c.nivel}</span>}
      {imb !== undefined && (
        <span className="num shrink-0">
          - {imb} {t(imb === 1 ? "Imbuiment" : "Imbuiments")}
        </span>
      )}
    </p>
  );
}

/** Só Crypt: duas linhas fixas (combinação de pierce; imbuiment elemental). Nas outras armas reserva as mesmas duas linhas, para os cartões lado a lado terem a mesma altura. */
function LinhaCombinacao({ c }: { c: Candidato }) {
  const t = useT();
  const { imbRasc, rascunharImb, recalcular } = useContext(ProficienciaCtx);
  if (c.origem !== "crypt") return <div aria-hidden="true" className="min-h-12" />;
  const pierce = [
    c.pierce && c.pierce.elemental > 0 && c.elemento
      ? { el: c.elemento, pct: c.pierce.elemental }
      : null,
    c.pierce && c.pierce.physical > 0 ? { el: "physical" as const, pct: c.pierce.physical } : null,
  ].filter((x) => x !== null);
  return (
    <div className="min-h-12 min-w-0 break-words text-sm">
      <p className="flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-muted-foreground">{t("Combinação:")}</span>
        {pierce.map((p) => (
          <span key={p.el} className="inline-flex items-center gap-1">
            <ElementIcon element={p.el} className="size-4" />
            <span className="num font-semibold">{p.pct}%</span>
          </span>
        ))}
        {c.arma && <ProficienciaDialog c={c} />}
      </p>
      <p className="flex min-h-6 items-center gap-3">
        <span className="text-muted-foreground">{t("Imbuiment Elemental")}</span>
        {c.arma?.element ? (
          <Switch
            aria-label={t("Imbuiment elemental")}
            checked={c.arma.slug in imbRasc ? imbRasc[c.arma.slug] === "com" : c.imbued}
            // Nunca bloqueia: dá para calcular a arma com ou sem imbuiment, mesmo quando o ideal é o outro.
            onCheckedChange={(ligado) =>
              c.arma && rascunharImb(c.arma.slug, ligado ? "com" : "sem", c.imbued ? "com" : "sem")
            }
          />
        ) : (
          <span className="text-muted-foreground">{t("não se aplica")}</span>
        )}
        {c.arma && c.arma.slug in imbRasc && (
          <button
            type="button"
            onClick={recalcular}
            className="ml-auto font-bold text-primary underline underline-offset-4 transition-colors hover:text-accent"
          >
            {t("Recalcular")}
          </button>
        )}
      </p>
    </div>
  );
}

/** Diferença de dano de quem escolheu com ou sem imbuiment em relação ao cálculo ideal da mesma arma. */
function ImbuimentDiff({ modo, atual, otimo }: { modo: ImbModo; atual: number; otimo: number }) {
  const t = useT();
  const d = (atual / otimo - 1) * 100;
  return (
    <>
      {t(modo === "sem" ? "Sem o imbuiment:" : "Com o imbuiment:")}{" "}
      <span className={`num font-semibold ${d < 0 ? "text-bad" : "text-good"}`}>
        {d > 0 ? "+" : "−"}
        {n1(Math.abs(d))}%
      </span>{" "}
      {t("de dano (ideal:")} <span className="num">{n1(otimo)}</span>)
    </>
  );
}

/** Quanto a melhor é superior à outra: ((melhor ÷ outra) − 1) × 100. Sem sentido se a outra causa dano zero. */
const superior = (melhor: number, outra: number) => (outra > 0 ? (melhor / outra - 1) * 100 : null);
const menos = (melhor: number, outra: number) => (melhor > 0 ? (1 - outra / melhor) * 100 : null);

/** Uma categoria por coluna quando há mais de uma ("Comparar as 3"): melhor arma + as 3 seguintes de cada. */
export function Recomendacao({ candidatos }: { candidatos: readonly Candidato[] }) {
  const cats = [...new Set(candidatos.map((c) => c.categoria))];
  if (cats.length < 2) return <Bloco candidatos={candidatos} />;
  // Subgrid: as 3 colunas dividem as mesmas linhas (título, melhor, alternativas), então os cartões e os títulos
  // "Alternativas" alinham mesmo com nomes de 1 ou 2 linhas.
  return (
    <div className="grid gap-x-5 gap-y-5 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto]">
      {cats.map((cat) => (
        <section
          key={cat}
          aria-label={TIPO[cat]}
          className="grid min-w-0 gap-y-5 lg:row-span-3 lg:grid-rows-subgrid"
        >
          <h3 className="font-display text-xl font-bold">{TIPO[cat]}</h3>
          <Bloco candidatos={candidatos.filter((c) => c.categoria === cat)} compacto />
        </section>
      ))}
    </div>
  );
}

function Bloco({
  candidatos,
  compacto = false,
}: {
  candidatos: readonly Candidato[];
  compacto?: boolean;
}) {
  const t = useT();
  const { profs, imbForcado, aplicar, aplicarImb } = useContext(ProficienciaCtx);
  const idMelhor = useId();
  const idAlt = useId();
  const [melhor, ...resto] = candidatos;
  if (!melhor) return null;
  // Armas que o jogador editou ficam visíveis (com o botão de resetar) mesmo que caiam abaixo do top.
  const alternativas = resto.filter((c, i) => i < MAX_ALTERNATIVAS || c.editado);
  const segundo = alternativas[0];
  const supSegundo = segundo ? superior(melhor.damagePct, segundo.damagePct) : null;

  const conteudo = (
    <>
      <motion.section
        key={melhor.chave}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        aria-labelledby={idMelhor}
        className="frame flex min-h-72 min-w-0 flex-col !border-accent"
      >
        <p className="micro bg-accent px-4 py-2 text-accent-foreground">
          {t("Melhor opção para este alvo")}
        </p>
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-5">
          <ItemSlot nome={melhor.nome} className="h-32 w-full shrink-0" />
          <h3
            id={idMelhor}
            className="min-h-[2.5em] break-words font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl"
          >
            {melhor.nome}
          </h3>
          <LinhaInfo c={melhor} />
          <LinhaCombinacao c={melhor} />
          <div className="mt-auto min-w-0 border-t border-border pt-3">
            <p className="micro text-muted-foreground">{t("Dano calculado")}</p>
            <p className="num text-4xl font-semibold text-foreground">{n1(melhor.damagePct)}</p>
            {segundo && supSegundo !== null && (
              <p className="mt-1 break-words text-sm">
                <span className="num font-semibold text-good">+{n1(supSegundo)}%</span>{" "}
                <span className="text-muted-foreground">
                  {t("sobre {nome}", { nome: segundo.nome })}
                </span>
              </p>
            )}
            {/* Linha sempre reservada (2 linhas de texto): o cartão não muda de altura com ou sem o aviso. */}
            <p className="mt-1 min-h-10 break-words text-sm text-muted-foreground">
              {melhor.modoImb && melhor.otimo !== undefined && melhor.otimo > 0 && (
                <ImbuimentDiff
                  modo={melhor.modoImb}
                  atual={melhor.damagePct}
                  otimo={melhor.otimo}
                />
              )}
            </p>
          </div>
        </div>
      </motion.section>

      {alternativas.length > 0 && (
        <section aria-labelledby={idAlt} className="min-w-0">
          <h3 id={idAlt} className="mb-3 font-display text-lg font-bold">
            {t("Alternativas")}
          </h3>
          <ol
            className={
              compacto
                ? "grid auto-rows-fr gap-3"
                : "grid auto-rows-fr items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3"
            }
          >
            {alternativas.map((c) => {
              const m = menos(melhor.damagePct, c.damagePct);
              return (
                <li
                  key={c.chave}
                  className="frame-inset flex h-full min-h-40 min-w-0 items-center gap-4 p-4"
                >
                  <ItemSlot nome={c.nome} className="size-[4.5rem] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold">{c.nome}</p>
                    <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                      <Elemento c={c} />
                    </p>
                    <p className="mt-1 text-sm">
                      {m !== null ? (
                        <span className="num text-bad">
                          {n1(m)}% {t("menos eficiente")}
                        </span>
                      ) : (
                        <span className="text-bad">{t("dano nulo contra este alvo")}</span>
                      )}
                    </p>
                    {c.origem === "crypt" && (profs[c.chave] || imbForcado[c.chave]) && (
                      <button
                        type="button"
                        onClick={() => {
                          aplicar(c.chave, null);
                          aplicarImb(c.chave, null);
                        }}
                        className="mt-1 text-sm font-bold text-primary underline underline-offset-4 transition-colors hover:text-accent"
                      >
                        {t("Resetar proficiência")}
                      </button>
                    )}
                  </div>
                  <p className="num shrink-0 text-xl font-semibold text-gold">{n1(c.damagePct)}</p>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </>
  );
  return compacto ? conteudo : <div className="flex flex-col gap-5">{conteudo}</div>;
}
