import { Compass, Shield, Sword, type LucideIcon } from "lucide-react";

export type Tool = {
  to: "/set-builder" | "/damage-calculator" | "/hunts";
  label: string;
  titulo: string;
  icon: LucideIcon;
  resumo: string;
  pronta: boolean;
};

export const TOOLS: Tool[] = [
  {
    to: "/damage-calculator",
    label: "Damage Calculator",
    titulo: "Damage Calculator",
    icon: Sword,
    resumo: "Qual arma da Crypt rende mais contra uma criatura ou uma hunt.",
    pronta: true,
  },
  {
    to: "/set-builder",
    label: "Set Builder",
    titulo: "Set Builder",
    icon: Shield,
    resumo: "Monte o set por vocação, nível e proteção elemental.",
    pronta: true,
  },
  {
    to: "/hunts",
    label: "Hunts",
    titulo: "Hunts",
    icon: Compass,
    resumo: "Hunts de nível 450+ e as criaturas de cada uma.",
    pronta: true,
  },
];

// Ordem da navegação principal: Início, Set Builder, Damage Calculator, Hunts, Como calculamos.
export const NAV: { to: "/" | Tool["to"] | "/como-calculamos"; label: string }[] = [
  { to: "/", label: "Início" },
  { to: "/set-builder", label: "Set Builder" },
  { to: "/damage-calculator", label: "Damage Calculator" },
  { to: "/como-calculamos", label: "Como calculamos" },
];
