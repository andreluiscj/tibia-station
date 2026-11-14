import { useT } from "@/lib/i18n";
import type { CryptWeapon } from "@/lib/data/types";
import { DamageBar } from "./DamageBar";
import { ElementBadge } from "./ElementBadge";
import { ELEMENTOS } from "./elementos";
import { n1 } from "./format";
import { ItemSlot } from "./ItemSlot";

export interface ResultMode {
  id: string;
  /** Ex.: "Elemental 45%". */
  label: string;
  /** Dano relativo (100 = neutro). null enquanto o motor não calculou. */
  value: number | null;
  /** Classe estática da barra; padrão: cor do elemento da arma. */
  cor?: string;
}
export interface ResultTarget {
  /** Slug da criatura (a mesma criatura pode aparecer duas vezes na hunt). */
  id?: string;
  name: string;
  value: number;
  absorbs: boolean;
  /** O que absorve, em texto (ex.: "absorve o elemento Fogo"). */
  absorbeTexto?: string;
}
export interface ResultCardProps {
  /** Posição de competição (1, 2, 2, 4): use `displayRank` do motor. Sem valor, o selo some (arma única). */
  rank?: number;
  arma: CryptWeapon;
  /** Os modos do motor (Elemental 45%, Híbrida, Physical 14%). */
  modos: ResultMode[];
  /** Combinação vencedora (pode ser a só física, mesmo em arma elemental); `id` destaca o modo correspondente. */
  melhor?: { label: string; value: number; id?: string; imbued?: boolean } | null;
  /** Perks da combinação vencedora, em texto. */
  perks?: string[];
  /** `contra` completa a frase: "+7,0% sobre a próxima arma". `tied` mostra empate em vez do número. */
  veredito?: { compensa: boolean; diffPct: number | null; tied?: boolean; contra?: string } | null;
  /** Por monstro, quando o alvo é uma hunt. */
  alvos?: ResultTarget[];
  /** Fim da escala das barras; compartilhe o mesmo valor entre os cartões para comparar. */
  escala?: number;
  /** Aviso quando os modos official e reference dão resultados diferentes. */
  divergencia?: string | null;
}

/** Cartão de resultado de uma arma. Só apresenta o que o motor entrega; não calcula nada. */
export function ResultCard({
  rank,
  arma,
  modos,
  melhor,
  perks,
  veredito,
  alvos,
  escala,
  divergencia,
}: ResultCardProps) {
  const t = useT();
  const corArma = arma.element ? ELEMENTOS[arma.element].bar : ELEMENTOS.physical.bar;
  return (
    <article className="frame p-5">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {rank !== undefined && (
          <span
            aria-label={`Posição ${rank}`}
            className="num flex size-9 shrink-0 items-center justify-center border border-[#241810] bg-stone text-stone-foreground"
          >
            {rank}
          </span>
        )}
        <ItemSlot nome={arma.name} className="size-[4.5rem]" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl font-bold">{arma.name}</h3>
          <p className="text-muted-foreground">
            {melhor?.imbued && arma.element ? <ElementBadge element={arma.element} /> : "Physical"}
          </p>
        </div>
        {veredito && (
          <p
            className={`border px-2.5 py-1 text-sm font-semibold ${
              veredito.compensa ? "border-good text-good" : "border-bad text-bad"
            }`}
          >
            {veredito.compensa ? t("Compensa") : t("Não compensa")}
            {veredito.tied ? (
              <span className="ml-2 font-normal">{t("empate no ranking")}</span>
            ) : (
              veredito.diffPct !== null && (
                <span className="ml-2 font-normal">
                  <span className="num">
                    {veredito.diffPct > 0 ? "+" : ""}
                    {n1(veredito.diffPct)}%
                  </span>
                  {veredito.contra && ` ${t(veredito.contra)}`}
                </span>
              )
            )}
          </p>
        )}
      </header>

      <ul className="mt-5 space-y-4">
        {modos.map((m, i) => (
          <li
            key={m.id}
            className={`pl-3 ${melhor?.id === m.id ? "border-l-2 border-gold" : "border-l-2 border-transparent"}`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span>
                {t(m.label)}
                {melhor?.id === m.id && (
                  <span className="ml-2 text-sm text-gold">{t("melhor")}</span>
                )}
              </span>
              <span className="num text-gold">
                {m.value === null ? t("sem cálculo") : n1(m.value)}
              </span>
            </div>
            {m.value !== null && (
              <div className="mt-1.5">
                <DamageBar value={m.value} cor={m.cor ?? corArma} escala={escala} delay={i * 0.1} />
              </div>
            )}
          </li>
        ))}
      </ul>

      {melhor && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <span className="min-w-0 break-words">
              {t("Melhor combinação:")} <span className="font-semibold">{t(melhor.label)}</span>{" "}
              <span className="num text-gold">{n1(melhor.value)}</span>
            </span>
            {melhor.imbued !== undefined && (
              <span>
                <span className="text-muted-foreground">{t("Imbuiment Elemental")}</span>{" "}
                <span className="font-semibold text-gold">
                  {melhor.imbued ? t("Sim") : t("Não")}
                </span>
              </span>
            )}
          </p>
          {perks && perks.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
              {perks.map((p) => (
                <li key={p}>{t(p)}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {divergencia && (
        <p className="mt-3 border border-dashed border-gold-dim px-3 py-2 text-sm">{divergencia}</p>
      )}

      {alvos && alvos.length > 0 && (
        <details className="mt-4 border-t border-border pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">
            {t("Por criatura ({n})", { n: alvos.length })}
          </summary>
          <ul className="space-y-1 text-sm">
            {alvos.map((a, i) => (
              <li key={`${a.id ?? a.name}-${i}`} className="flex flex-wrap justify-between gap-x-3">
                <span>{a.name}</span>
                {a.absorbs ? (
                  <span className="font-semibold text-bad">
                    {t(a.absorbeTexto ?? "absorve o elemento")}
                  </span>
                ) : (
                  <span className={a.value > 100 ? "text-good" : a.value < 100 ? "text-bad" : ""}>
                    <span className="num">{n1(a.value)}</span>{" "}
                    {a.value > 100 ? t("ganha") : a.value < 100 ? t("perde") : t("neutro")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </article>
  );
}
