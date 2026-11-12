import { useState } from "react";
import type { Item } from "@/lib/tibia";
import type { SelectedSet } from "./builderState";
import { AugmentsCard } from "./AugmentsCard";
import { BaseSkillsDialog } from "./BaseSkillsDialog";
import { DefenseCard } from "./DefenseCard";
import { SkillsCard } from "./SkillsCard";
import { calcularStats } from "./stats";
import { useBaseSkills } from "./useBaseSkills";

/** Atributos do personagem com o set atual: habilidades, defesa e bônus dos itens. */
export function CharacterStats({
  selected,
  imbuimentItems,
}: {
  selected: SelectedSet;
  imbuimentItems?: Item[];
}) {
  const { base, salvar } = useBaseSkills();
  const [editando, setEditando] = useState(false);
  const items = [...(Object.values(selected).filter(Boolean) as Item[]), ...(imbuimentItems ?? [])];
  const stats = calcularStats(items, base);

  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <SkillsCard stats={stats} onEditar={() => setEditando(true)} />
      <DefenseCard stats={stats} />
      <div className="sm:col-span-2">
        <AugmentsCard augments={stats.augments} />
      </div>
      <BaseSkillsDialog open={editando} onOpenChange={setEditando} base={base} onSave={salvar} />
    </div>
  );
}
