import type { Element } from "@/lib/data/types";
import { ElementIcon } from "./ElementIcon";
import { ELEMENTOS } from "./elementos";

/** Ícone do elemento + nome: a cor nunca aparece sozinha. */
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
      <ElementIcon element={element} className="size-4" />
      {meta.label}
    </span>
  );
}
