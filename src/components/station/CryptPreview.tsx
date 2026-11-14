import { useT } from "@/lib/i18n";
import { DamageBar } from "./DamageBar";
import { n1 } from "./format";

// Exemplo real do plano (docs/PLANO.md, seção 5.3): Hellflayer, Elemental 45%, regras oficiais.
const LINHAS = [
  { arma: "Crypt Splitter", valor: 114.0, cor: "bg-el-energy" },
  { arma: "Crypt Slicer", valor: 106.5, cor: "bg-el-earth" },
  { arma: "Crypt Breaker", valor: 80.0, cor: "bg-el-fire" },
] as const;

export function CryptPreview() {
  const t = useT();
  return (
    <figure className="flex flex-1 flex-col justify-between gap-5 border border-border bg-black/25 p-4 sm:p-5">
      <figcaption className="text-sm leading-snug text-muted-foreground">
        {t(
          "Exemplo: dano das armas contra o Hellflayer, modo Elemental 45%. A linha marca 100, o dano neutro.",
        )}
      </figcaption>
      <ol className="space-y-4">
        {LINHAS.map((l, i) => (
          <li key={l.arma}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold">{l.arma}</span>
              <span className="num text-gold">{n1(l.valor)}</span>
            </div>
            <div className="mt-1.5">
              <DamageBar value={l.valor} cor={l.cor} delay={0.3 + i * 0.12} />
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
