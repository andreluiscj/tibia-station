import type { ReactNode } from "react";

/** Botão de escolha (grupo exclusivo): ativo em ouro, sempre com alvo de 44 px. */
export function Chip({
  ativo,
  onClick,
  children,
  disabled = false,
}: {
  ativo: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center gap-2 border px-4 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        ativo
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-metal enabled:hover:border-gold-dim"
      }`}
    >
      {children}
    </button>
  );
}
