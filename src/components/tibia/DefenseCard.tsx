import { useT } from "@/lib/i18n";
import { statIconUrl } from "@/lib/tibia";
import { DEF_ROTULO } from "./rotulos";
import { StatRow } from "./StatRow";
import { fmtPct, type DefKey, type Stats } from "./stats";

const ORDEM: DefKey[] = [
  "physical",
  "fire",
  "earth",
  "energy",
  "ice",
  "holy",
  "death",
  "life_drain",
  "mana_drain",
];

const cor = (n: number) => (n > 0 ? "text-good" : n < 0 ? "text-bad" : "text-muted-foreground");

export function DefenseCard({ stats }: { stats: Stats }) {
  const t = useT();
  return (
    <section className="frame" aria-labelledby="sb-defesa">
      <h3
        id="sb-defesa"
        className="flex items-center gap-2 border-b border-border px-4 py-3 font-display text-lg font-bold"
      >
        <img
          src={statIconUrl("defense-icone")}
          alt=""
          className="size-5 [image-rendering:pixelated]"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        {t("Defesa")}
      </h3>
      <ul className="divide-y divide-border/60">
        {ORDEM.map((k) => (
          <StatRow key={k} icon={DEF_ROTULO[k].icon} label={DEF_ROTULO[k].label}>
            <span className={cor(stats.def[k])}>{fmtPct(stats.def[k])}</span>
          </StatRow>
        ))}
        <StatRow destaque icon="defence" label={t("Defence")}>
          {stats.defence}
        </StatRow>
        <StatRow destaque icon="armor" label={t("Armadura")}>
          {stats.armor}
        </StatRow>
        <StatRow destaque icon="mantra" label="Mantra">
          {stats.mantra}
        </StatRow>
      </ul>
    </section>
  );
}
