import type { ReactNode } from "react";

export function PageIntro({
  titulo,
  children,
  compacto = false,
}: {
  titulo: string;
  children?: ReactNode;
  compacto?: boolean;
}) {
  return (
    <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${compacto ? "pt-2" : "pt-10 sm:pt-14"}`}>
      <h1 className="text-gold-glow max-w-3xl text-balance font-display text-3xl font-bold leading-tight text-gold sm:text-4xl md:text-5xl">
        {titulo}
      </h1>
      {children && (
        <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-muted-foreground">
          {children}
        </p>
      )}
    </div>
  );
}
