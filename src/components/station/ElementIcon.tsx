import { useState } from "react";
import type { Element } from "@/lib/data/types";
import { statIconUrl } from "@/lib/storage";
import { ELEMENTOS } from "./elementos";

/** Ícone do elemento (bucket Stats, somente leitura). Sem imagem (ex.: Drown), cai no losango na cor do elemento. */
export function ElementIcon({
  element,
  className = "size-6",
}: {
  element: Element;
  className?: string;
}) {
  const [falhou, setFalhou] = useState(false);
  const meta = ELEMENTOS[element];
  if (falhou)
    return (
      <span
        aria-hidden="true"
        className={`inline-block shrink-0 rotate-45 scale-50 ${meta.bar} ${className}`}
      />
    );
  return (
    <img
      src={statIconUrl(element.toLowerCase())}
      alt=""
      aria-hidden="true"
      loading="lazy"
      onError={() => setFalhou(true)}
      className={`shrink-0 object-contain [image-rendering:pixelated] ${className}`}
    />
  );
}
