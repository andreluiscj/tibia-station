import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";

/** Cabeçalho de página: trilha "TIBIA STATION / …", título e, à direita, o numeral romano da seção. */
export function PageIntro({
  titulo,
  eyebrow,
  numeral,
  children,
  compacto = false,
}: {
  titulo: string;
  eyebrow?: string;
  numeral?: string;
  children?: ReactNode;
  compacto?: boolean;
}) {
  const t = useT();
  const tr = (x: ReactNode) => (typeof x === "string" ? t(x) : x);
  return (
    <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${compacto ? "pt-2" : "pt-10 sm:pt-14"}`}>
      <div className="flex items-start justify-between gap-6 border-b border-border pb-6">
        <div>
          {eyebrow && <p className="micro mb-3 text-gold">TIBIA STATION / {t(eyebrow)}</p>}
          <h1 className="max-w-3xl text-balance font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl md:text-5xl">
            {t(titulo)}
          </h1>
          {children && (
            <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-muted-foreground">
              {tr(children)}
            </p>
          )}
        </div>
        {numeral && (
          <p aria-hidden="true" className="shrink-0 text-right font-display text-gold-dim">
            <span className="block text-4xl leading-none sm:text-5xl">{numeral}</span>
            {eyebrow && (
              <span className="micro mt-1 hidden text-[0.65rem] sm:block">{t(eyebrow)}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
