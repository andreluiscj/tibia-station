import type { Element } from "@/lib/data/types";
import { ELEMENTOS } from "./elementos";

/** Losango na cor fixa do elemento + nome: a cor nunca aparece sozinha. */
export function ElementBadge({
  element,
  className = "",
}: {
  element: Element;
  className?: string;
}) {
  const meta = ELEMENTOS[element];
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden="true" className={`size-2.5 shrink-0 rotate-45 ${meta.bar}`} />
      {meta.label}
    </span>
  );
}
