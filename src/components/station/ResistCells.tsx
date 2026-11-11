import { ELEMENTOS, ELEMENTOS_PRINCIPAIS } from "./elementos";
import { descreverResist } from "./resist";
import type { Creature } from "@/lib/data/types";

/** Resistências compactas por elemento (formato da wiki: 100 neutro). Absorção e valores não confirmados saem em texto. */
export function ResistCells({ criatura }: { criatura: Creature }) {
  return (
    <ul className="grid grid-cols-4 gap-x-3 gap-y-2 sm:grid-cols-7">
      {ELEMENTOS_PRINCIPAIS.map((e) => {
        const v = criatura.resist[e];
        const absorve = descreverResist(v).tipo === "absorve";
        const naoConfirmado = criatura.resistUnconfirmed.includes(e);
        return (
          <li
            key={e}
            className={
              absorve ? "border-l-2 border-bad pl-2" : "border-l-2 border-transparent pl-2"
            }
          >
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rotate-45 ${ELEMENTOS[e].bar}`}
              />
              {ELEMENTOS[e].label}
            </span>
            <span className={`num block ${absorve ? "font-semibold text-bad" : "text-gold"}`}>
              {v ?? "sem dado"}
              {naoConfirmado && (
                <>
                  <span aria-hidden="true">?</span>
                  <span className="sr-only"> (não confirmado)</span>
                </>
              )}
            </span>
            {absorve && <span className="block text-sm text-bad">absorve</span>}
          </li>
        );
      })}
    </ul>
  );
}
