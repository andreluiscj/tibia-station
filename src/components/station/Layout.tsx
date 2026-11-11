import type { ReactNode } from "react";

/** Contêiner de página: mesma largura e margens do cabeçalho. */
export function Cont({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>;
}
