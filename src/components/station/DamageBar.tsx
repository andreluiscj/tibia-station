import { motion } from "motion/react";

/** Barra de valor com marca em 100 (dano neutro). Preenche ao aparecer; MotionConfig respeita prefers-reduced-motion. */
export function DamageBar({
  value,
  cor,
  escala = 120,
  delay = 0,
  marca = 100,
}: {
  value: number;
  /** Classe estática de fundo, ex.: "bg-el-fire". */
  cor: string;
  escala?: number;
  delay?: number;
  /** Valor da linha de referência (100 = dano neutro); null esconde a linha. */
  marca?: number | null;
}) {
  const pct = Math.max(0, Math.min(value, escala)) / escala;
  return (
    <div aria-hidden="true" className="relative h-3 bg-background">
      <motion.div
        className={`h-full origin-left ${cor}`}
        style={{ width: `${pct * 100}%` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
      />
      {marca !== null && marca <= escala && (
        <span
          className="absolute inset-y-[-3px] w-px bg-foreground/70"
          style={{ left: `${(marca / escala) * 100}%` }}
        />
      )}
    </div>
  );
}
