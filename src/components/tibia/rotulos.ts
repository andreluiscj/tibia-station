import type { SlotKey } from "@/lib/tibia";
import type { DefKey, SkillKey } from "./stats";

/** Nomes dos slots em português (a lista de slots em lib/tibia.ts guarda só as chaves e as imagens). */
export const SLOT_ROTULO: Record<SlotKey, string> = {
  amulet: "Amuleto",
  helmet: "Elmo",
  backpack: "Mochila",
  weapon: "Arma",
  armor: "Armadura",
  shield: "Escudo",
  ring: "Anel",
  legs: "Calças",
  trinket: "Extra",
  boots: "Botas",
};

export const SKILL_ROTULO: Record<SkillKey, { label: string; icon: string }> = {
  level: { label: "Nível", icon: "level" },
  magic: { label: "Magic Level", icon: "magic-level" },
  fist: { label: "Fist Fighting", icon: "fist-fighting" },
  club: { label: "Club Fighting", icon: "club-fighting" },
  sword: { label: "Sword Fighting", icon: "sword-fighting" },
  axe: { label: "Axe Fighting", icon: "axe-fighting" },
  distance: { label: "Distance Fighting", icon: "distance-fighting" },
  shielding: { label: "Shielding", icon: "shielding" },
};

export const DEF_ROTULO: Record<DefKey, { label: string; icon: string }> = {
  physical: { label: "Physical", icon: "physical" },
  fire: { label: "Fire", icon: "fire" },
  earth: { label: "Earth", icon: "earth" },
  energy: { label: "Energy", icon: "energy" },
  ice: { label: "Ice", icon: "ice" },
  holy: { label: "Holy", icon: "holy" },
  death: { label: "Death", icon: "death" },
  life_drain: { label: "Life Drain", icon: "life-drain" },
  mana_drain: { label: "Mana Drain", icon: "mana-drain" },
};

export const MAGIC_SUB_ROTULO: Record<string, { label: string; icon: string }> = {
  fire_magic_level: { label: "Fire Magic Level", icon: "fire" },
  energy_magic_level: { label: "Energy Magic Level", icon: "energy" },
  ice_magic_level: { label: "Ice Magic Level", icon: "ice" },
  earth_magic_level: { label: "Earth Magic Level", icon: "earth" },
  holy_magic_level: { label: "Holy Magic Level", icon: "holy" },
  death_magic_level: { label: "Death Magic Level", icon: "death" },
  healing_magic_level: { label: "Healing Magic Level", icon: "life-drain" },
};
