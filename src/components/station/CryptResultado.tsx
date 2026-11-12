import { motion } from "motion/react";
import type { Patch } from "./CryptCalculator";
import { labelCombo, modosDe, perksDoCombo, quemAbsorve, type Calculo } from "./cryptEstado";
import { ELEMENTOS } from "./elementos";
import { Carregando, Erro, Vazio } from "./Estados";
import { n1 } from "./format";
import { Recomendacao } from "./Recomendacao";
import { ResultCard } from "./ResultCard";

const botao = "min-h-11 border border-border bg-metal px-5 font-semibold hover:border-gold-dim";

export function Resultado({
  carregando,
  erro,
  onTentar,
  calculo,
  onChange,
}: {
  carregando: boolean;
  erro: boolean;
  onTentar: () => void;
  calculo: Calculo | null;
  onChange: (patch: Patch) => void;
}) {
  if (erro) return <Erro onTentar={onTentar} />;
  if (carregando || !calculo)
    return <Carregando rotulo="Carregando armas e criaturas…" linhas={6} />;

  if (calculo.tipo === "erro")
    return <Erro titulo="Não foi possível calcular" texto={calculo.mensagem} />;
  if (calculo.tipo === "vazio")
    return (
      <Vazio
        titulo="Escolha uma criatura ou uma hunt"
        texto="O ranking das armas aparece aqui, ao vivo, assim que você escolher o alvo no passo 4. Quer ver um exemplo?"
      >
        <button
          type="button"
          className={botao}
          onClick={() => onChange({ monster: "hellflayer", hunt: null })}
        >
          Criatura: Hellflayer
        </button>
        <button
          type="button"
          className={botao}
          onClick={() => onChange({ hunt: "crystal-enigma", monster: null })}
        >
          Hunt: Crystal Enigma
        </button>
      </Vazio>
    );
  if (calculo.tipo === "nao-encontrado")
    return (
      <Vazio
        titulo={calculo.oque === "hunt" ? "Hunt não encontrada" : "Criatura não encontrada"}
        texto="O endereço aponta para algo que não existe nos dados. Escolha o alvo de novo no passo 4."
      >
        <button
          type="button"
          className={botao}
          onClick={() => onChange({ monster: null, hunt: null })}
        >
          Limpar o alvo
        </button>
      </Vazio>
    );
  if (calculo.tipo === "sem-criaturas")
    return (
      <Vazio
        titulo="Esta hunt não tem criaturas detectadas"
        texto="Sem criaturas não há o que calcular. Escolha outra hunt ou uma criatura."
      />
    );

  const { ranking, alvos, concorrentes, candidatos } = calculo;
  const maior = Math.max(0, ...ranking.map((r) => r.evaluation.best.damagePct));
  const escala = Math.max(120, Math.ceil(maior / 10) * 10);

  return (
    <>
      <Recomendacao candidatos={candidatos} />
      <div className="mb-6" />
      <details className="border border-border bg-card px-4">
        <summary className="min-h-11 cursor-pointer py-2.5 font-semibold">
          Detalhes de cada Crypt (modos de pierce, perks e alvos)
        </summary>
        <div className="pb-5 pt-2">
          <ol className="space-y-5">
            {ranking.map((r) => {
              const ev = r.evaluation;
              const porAlvo = ev.best.perTarget.map((t, i) => ({
                id: alvos[i].id,
                name: alvos[i].name,
                value: t.damagePct,
                absorbs: t.absorbs,
                absorbeTexto: t.absorbs ? quemAbsorve(alvos[i], r.weapon, ev.best) : undefined,
              }));
              return (
                <motion.li
                  key={ev.weaponSlug}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="mb-2 text-sm text-muted-foreground">
                    {concorrentes[ev.weaponSlug] ? (
                      <>
                        Concorrente: <strong>{concorrentes[ev.weaponSlug]!.alt.name}</strong>
                        {concorrentes[ev.weaponSlug]!.alt.element &&
                          ` (${ELEMENTOS[concorrentes[ev.weaponSlug]!.alt.element!].label})`}{" "}
                        <span className="num">{n1(concorrentes[ev.weaponSlug]!.damagePct)}</span>
                      </>
                    ) : (
                      "Nenhuma outra arma liberada neste nível: comparado com 100."
                    )}
                  </p>
                  <ResultCard
                    rank={ranking.length > 1 ? r.displayRank : undefined}
                    arma={r.weapon}
                    modos={modosDe(ev, r.weapon)}
                    melhor={{
                      label: labelCombo(ev.best),
                      value: ev.best.damagePct,
                      id: ev.best.preset ?? undefined,
                      imbued: ev.best.combo.imbued,
                    }}
                    perks={perksDoCombo(r.weapon, ev.best)}
                    veredito={{
                      compensa: ev.verdict === "worth",
                      diffPct: ranking.length > 1 ? r.advantageOverNextPct : null,
                      tied: r.tied,
                      contra: "sobre a próxima arma",
                    }}
                    alvos={
                      alvos.length > 1 || porAlvo.some((a) => a.absorbs)
                        ? [...porAlvo].sort((a, b) => b.value - a.value)
                        : undefined
                    }
                    escala={escala}
                  />
                </motion.li>
              );
            })}
          </ol>
        </div>
      </details>
    </>
  );
}
