import { useT } from "@/lib/i18n";
import { Pencil } from "lucide-react";
import { Fragment } from "react";
import { statIconUrl } from "@/lib/tibia";
import { MAGIC_SUB_ROTULO, SKILL_ROTULO } from "./rotulos";
import { StatRow } from "./StatRow";
import { SKILL_KEYS, type Stats } from "./stats";

export function SkillsCard({ stats, onEditar }: { stats: Stats; onEditar: () => void }) {
  const t = useT();
  return (
    <section className="frame" aria-labelledby="sb-skills">
      <h3
        id="sb-skills"
        className="flex items-center gap-2 border-b border-border px-4 py-3 font-display text-lg font-bold"
      >
        <img
          src={statIconUrl("skill-icone")}
          alt=""
          className="size-5 [image-rendering:pixelated]"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        {t("Habilidades")}
      </h3>
      <ul className="divide-y divide-border/60">
        {SKILL_KEYS.map((k) => (
          <Fragment key={k}>
            <StatRow
              icon={SKILL_ROTULO[k].icon}
              label={t(SKILL_ROTULO[k].label)}
              acao={
                <button
                  type="button"
                  onClick={onEditar}
                  aria-label={t("Editar a base de {x}", { x: t(SKILL_ROTULO[k].label) })}
                  className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-gold"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </button>
              }
            >
              {stats.skills[k]}
            </StatRow>
            {k === "magic" &&
              stats.magicSubs.map((sub) => (
                <StatRow
                  key={sub.column}
                  recuada
                  destaque
                  icon={MAGIC_SUB_ROTULO[sub.column]?.icon}
                  label={t(MAGIC_SUB_ROTULO[sub.column]?.label ?? sub.column)}
                >
                  <span className="text-good">{stats.skills.magic + sub.bonus}</span>
                </StatRow>
              ))}
          </Fragment>
        ))}
      </ul>
    </section>
  );
}
