import { useEffect, useState } from "react";
import { SKILLS_ZERADAS, type SkillKey } from "./stats";

const STORAGE_KEY = "tibia:baseSkills";

/** Skills base do jogador, guardadas no navegador (localStorage pode falhar: aí vale o padrão zerado). */
export function useBaseSkills() {
  const [base, setBase] = useState<Record<SkillKey, number>>(SKILLS_ZERADAS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw)
        setBase({ ...SKILLS_ZERADAS, ...(JSON.parse(raw) as Partial<Record<SkillKey, number>>) });
    } catch {
      /* sem armazenamento: segue com o padrão */
    }
  }, []);

  const salvar = (novas: Record<SkillKey, number>) => {
    setBase(novas);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novas));
    } catch {
      /* ignora */
    }
  };

  return { base, salvar };
}
