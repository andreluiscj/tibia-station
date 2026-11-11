import type { ReactNode } from "react";
import { statIconUrl } from "@/lib/tibia";

/** Linha de atributo: ícone do bucket (some se faltar), nome e valor. */
export function StatRow({
  icon,
  label,
  children,
  recuada = false,
  destaque = false,
  acao,
}: {
  icon?: string;
  label: string;
  children: ReactNode;
  recuada?: boolean;
  destaque?: boolean;
  acao?: ReactNode;
}) {
  return (
    <li
      className={`flex min-h-11 items-center gap-3 px-4 py-1.5 ${destaque ? "bg-muted/40" : ""} ${recuada ? "pl-8" : ""}`}
    >
      {icon ? (
        <img
          src={statIconUrl(icon)}
          alt=""
          className="size-5 shrink-0 [image-rendering:pixelated]"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      ) : (
        <span className="size-5 shrink-0" />
      )}
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="num font-semibold">{children}</span>
      {acao ?? <span className="size-9" />}
    </li>
  );
}
