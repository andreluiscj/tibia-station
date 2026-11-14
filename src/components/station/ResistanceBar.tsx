import { motion } from "motion/react";
import { useT } from "@/lib/i18n";
import type { Element } from "@/lib/data/types";
import { ElementIcon } from "./ElementIcon";
import { ELEMENTOS } from "./elementos";
import { ESCALA_RESIST, descreverResist } from "./resist";

/**
 * Resistência no formato da wiki (100 neutro; abaixo resiste; acima é fraco; negativo absorve).
 * O significado está sempre em texto (Absorve, Resiste 70%), nunca só na cor.
 */
export function ResistanceBar({
  element,
  value,
  assumed = false,
  delay = 0,
}: {
  element: Element;
  value: number | null;
  /** A wiki marca o valor como não confirmado. */
  assumed?: boolean;
  delay?: number;
}) {
  const t = useT();
  const info = descreverResist(value);
  const meta = ELEMENTOS[element];
  const absorve = info.tipo === "absorve";

  return (
    <div className={absorve ? "border-l-2 border-bad pl-3" : "border-l-2 border-transparent pl-3"}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="flex items-center gap-2 font-semibold">
          <ElementIcon element={element} className="size-4" />
          {meta.label}
        </span>
        <span className="flex flex-wrap items-baseline justify-end gap-x-2 gap-y-1 text-sm">
          {value !== null && <span className="num text-base text-gold">{value}</span>}
          <span
            className={
              absorve ? "border border-bad px-1.5 font-semibold text-bad" : "text-muted-foreground"
            }
          >
            {t(info.texto)}
          </span>
          {assumed && (
            <span className="border border-dashed border-gold-dim px-1.5 text-muted-foreground">
              {t("não confirmado")}
            </span>
          )}
        </span>
      </div>
      <div aria-hidden="true" className="relative mt-1.5 h-3 bg-background">
        <motion.div
          className={`h-full origin-left ${meta.bar}`}
          style={{ width: `${info.fill * 100}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
        />
        <span
          className="absolute inset-y-[-3px] w-px bg-foreground/70"
          style={{ left: `${(100 / ESCALA_RESIST) * 100}%` }}
        />
      </div>
    </div>
  );
}
