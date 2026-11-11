export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      amulet: {
        Row: {
          arm: number | null;
          bonus_1: string | null;
          charges: number | null;
          death: number | null;
          death_magic_level: number | null;
          duration_minutes: number | null;
          earth: number | null;
          earth_magic_level: number | null;
          energy: number | null;
          energy_magic_level: number | null;
          fire: number | null;
          fire_magic_level: number | null;
          healing_magic_level: number | null;
          holy: number | null;
          holy_magic_level: number | null;
          ice: number | null;
          ice_magic_level: number | null;
          id_amulet: number;
          item_name: string;
          level_minimum: number | null;
          mantra: number | null;
          physical: number | null;
          skill: number | null;
          skill_2: number | null;
          skill_type: number | null;
          skill_type_2: number | null;
          vocation: number | null;
        };
        Insert: {
          arm?: number | null;
          bonus_1?: string | null;
          charges?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          duration_minutes?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_amulet: number;
          item_name: string;
          level_minimum?: number | null;
          mantra?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_2?: number | null;
          skill_type?: number | null;
          skill_type_2?: number | null;
          vocation?: number | null;
        };
        Update: {
          arm?: number | null;
          bonus_1?: string | null;
          charges?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          duration_minutes?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_amulet?: number;
          item_name?: string;
          level_minimum?: number | null;
          mantra?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_2?: number | null;
          skill_type?: number | null;
          skill_type_2?: number | null;
          vocation?: number | null;
        };
        Relationships: [];
      };
      armor: {
        Row: {
          arm: number | null;
          bonus_1: string | null;
          bonus_2: string | null;
          bonus_3: string | null;
          bonus_4: string | null;
          classification: number | null;
          death: number | null;
          death_magic_level: number | null;
          earth: number | null;
          earth_magic_level: number | null;
          energy: number | null;
          energy_magic_level: number | null;
          fire: number | null;
          fire_magic_level: number | null;
          healing_magic_level: number | null;
          holy: number | null;
          holy_magic_level: number | null;
          ice: number | null;
          ice_magic_level: number | null;
          id_armor: number;
          imbuiment: number | null;
          item_name: string;
          level_minimum: number | null;
          mantra: number | null;
          physical: number | null;
          skill: number | null;
          skill_2: number | null;
          skill_type: number | null;
          skill_type_2: number | null;
          vocation: number | null;
        };
        Insert: {
          arm?: number | null;
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          bonus_4?: string | null;
          classification?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_armor: number;
          imbuiment?: number | null;
          item_name: string;
          level_minimum?: number | null;
          mantra?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_2?: number | null;
          skill_type?: number | null;
          skill_type_2?: number | null;
          vocation?: number | null;
        };
        Update: {
          arm?: number | null;
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          bonus_4?: string | null;
          classification?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_armor?: number;
          imbuiment?: number | null;
          item_name?: string;
          level_minimum?: number | null;
          mantra?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_2?: number | null;
          skill_type?: number | null;
          skill_type_2?: number | null;
          vocation?: number | null;
        };
        Relationships: [];
      };
      backpack: {
        Row: {
          id_backpack: number;
          item_name: string;
          volume: number | null;
        };
        Insert: {
          id_backpack: number;
          item_name: string;
          volume?: number | null;
        };
        Update: {
          id_backpack?: number;
          item_name?: string;
          volume?: number | null;
        };
        Relationships: [];
      };
      boots: {
        Row: {
          arm: number | null;
          bonus_1: string | null;
          bonus_2: string | null;
          bonus_3: string | null;
          bonus_4: string | null;
          classification: number | null;
          death: number | null;
          death_magic_level: number | null;
          earth: number | null;
          earth_magic_level: number | null;
          energy: number | null;
          energy_magic_level: number | null;
          fire: number | null;
          fire_magic_level: number | null;
          healing_magic_level: number | null;
          holy: number | null;
          holy_magic_level: number | null;
          ice: number | null;
          ice_magic_level: number | null;
          id_boots: number;
          imbuiment: number | null;
          item_name: string;
          level_minimum: number | null;
          physical: number | null;
          skill: number | null;
          skill_2: number | null;
          skill_type: number | null;
          skill_type_2: number | null;
          speed: number | null;
          vocation: number | null;
        };
        Insert: {
          arm?: number | null;
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          bonus_4?: string | null;
          classification?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_boots: number;
          imbuiment?: number | null;
          item_name: string;
          level_minimum?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_2?: number | null;
          skill_type?: number | null;
          skill_type_2?: number | null;
          speed?: number | null;
          vocation?: number | null;
        };
        Update: {
          arm?: number | null;
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          bonus_4?: string | null;
          classification?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_boots?: number;
          imbuiment?: number | null;
          item_name?: string;
          level_minimum?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_2?: number | null;
          skill_type?: number | null;
          skill_type_2?: number | null;
          speed?: number | null;
          vocation?: number | null;
        };
        Relationships: [];
      };
      helmet: {
        Row: {
          arm: number | null;
          bonus_1: string | null;
          bonus_2: string | null;
          classification: number | null;
          death: number | null;
          death_magic_level: number | null;
          earth: number | null;
          earth_magic_level: number | null;
          energy: number | null;
          energy_magic_level: number | null;
          fire: number | null;
          fire_magic_level: number | null;
          healing_magic_level: number | null;
          holy: number | null;
          holy_magic_level: number | null;
          ice: number | null;
          ice_magic_level: number | null;
          id_helmet: number;
          imbuiment: number | null;
          item_name: string;
          level_minimum: number | null;
          mantra: number | null;
          physical: number | null;
          skill: number | null;
          skill_2: number | null;
          skill_type: number | null;
          skill_type_2: number | null;
          vocation: number | null;
        };
        Insert: {
          arm?: number | null;
          bonus_1?: string | null;
          bonus_2?: string | null;
          classification?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_helmet: number;
          imbuiment?: number | null;
          item_name: string;
          level_minimum?: number | null;
          mantra?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_2?: number | null;
          skill_type?: number | null;
          skill_type_2?: number | null;
          vocation?: number | null;
        };
        Update: {
          arm?: number | null;
          bonus_1?: string | null;
          bonus_2?: string | null;
          classification?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_helmet?: number;
          imbuiment?: number | null;
          item_name?: string;
          level_minimum?: number | null;
          mantra?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_2?: number | null;
          skill_type?: number | null;
          skill_type_2?: number | null;
          vocation?: number | null;
        };
        Relationships: [];
      };
      imbuiment: {
        Row: {
          bonus_1: string | null;
          death: number | null;
          earth: number | null;
          energy: number | null;
          fire: number | null;
          holy: number | null;
          ice: number | null;
          id_imbuiment: number;
          imbuiment_name: string;
          skill: number | null;
          skill_type: number | null;
          vocation: number | null;
        };
        Insert: {
          bonus_1?: string | null;
          death?: number | null;
          earth?: number | null;
          energy?: number | null;
          fire?: number | null;
          holy?: number | null;
          ice?: number | null;
          id_imbuiment: number;
          imbuiment_name: string;
          skill?: number | null;
          skill_type?: number | null;
          vocation?: number | null;
        };
        Update: {
          bonus_1?: string | null;
          death?: number | null;
          earth?: number | null;
          energy?: number | null;
          fire?: number | null;
          holy?: number | null;
          ice?: number | null;
          id_imbuiment?: number;
          imbuiment_name?: string;
          skill?: number | null;
          skill_type?: number | null;
          vocation?: number | null;
        };
        Relationships: [];
      };
      legs: {
        Row: {
          arm: number | null;
          bonus_1: string | null;
          bonus_2: string | null;
          bonus_3: string | null;
          classification: number | null;
          death: number | null;
          death_magic_level: number | null;
          earth: number | null;
          earth_magic_level: number | null;
          energy: number | null;
          energy_magic_level: number | null;
          fire: number | null;
          fire_magic_level: number | null;
          healing_magic_level: number | null;
          holy: number | null;
          holy_magic_level: number | null;
          ice: number | null;
          ice_magic_level: number | null;
          id_legs: number;
          item_name: string;
          level_minimum: number | null;
          mana_drain: number | null;
          mantra: number | null;
          physical: number | null;
          skill_1: number | null;
          skill_2: number | null;
          skill_type_1: number | null;
          skill_type_2: number | null;
          vocation: number | null;
        };
        Insert: {
          arm?: number | null;
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          classification?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_legs: number;
          item_name: string;
          level_minimum?: number | null;
          mana_drain?: number | null;
          mantra?: number | null;
          physical?: number | null;
          skill_1?: number | null;
          skill_2?: number | null;
          skill_type_1?: number | null;
          skill_type_2?: number | null;
          vocation?: number | null;
        };
        Update: {
          arm?: number | null;
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          classification?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_legs?: number;
          item_name?: string;
          level_minimum?: number | null;
          mana_drain?: number | null;
          mantra?: number | null;
          physical?: number | null;
          skill_1?: number | null;
          skill_2?: number | null;
          skill_type_1?: number | null;
          skill_type_2?: number | null;
          vocation?: number | null;
        };
        Relationships: [];
      };
      ring: {
        Row: {
          arm: number | null;
          bonus_1: string | null;
          bonus_2: string | null;
          bonus_3: string | null;
          bonus_4: string | null;
          charges: number | null;
          class: number | null;
          death: number | null;
          death_magic_level: number | null;
          duration_minutes: number | null;
          earth: number | null;
          earth_magic_level: number | null;
          energy: number | null;
          energy_magic_level: number | null;
          fire: number | null;
          fire_magic_level: number | null;
          healing_magic_level: number | null;
          holy: number | null;
          holy_magic_level: number | null;
          ice: number | null;
          ice_magic_level: number | null;
          id_ring: number;
          item_name: string;
          level_minimum: number | null;
          life_drain: number | null;
          mana_drain: number | null;
          mantra: number | null;
          physical: number | null;
          skill: number | null;
          skill_2: number | null;
          skill_type: number | null;
          skill_type_2: number | null;
          vocation: number | null;
        };
        Insert: {
          arm?: number | null;
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          bonus_4?: string | null;
          charges?: number | null;
          class?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          duration_minutes?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_ring: number;
          item_name: string;
          level_minimum?: number | null;
          life_drain?: number | null;
          mana_drain?: number | null;
          mantra?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_2?: number | null;
          skill_type?: number | null;
          skill_type_2?: number | null;
          vocation?: number | null;
        };
        Update: {
          arm?: number | null;
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          bonus_4?: string | null;
          charges?: number | null;
          class?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          duration_minutes?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_ring?: number;
          item_name?: string;
          level_minimum?: number | null;
          life_drain?: number | null;
          mana_drain?: number | null;
          mantra?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_2?: number | null;
          skill_type?: number | null;
          skill_type_2?: number | null;
          vocation?: number | null;
        };
        Relationships: [];
      };
      shields_ek: {
        Row: {
          bonus_1: string | null;
          bonus_2: string | null;
          bonus_3: string | null;
          death: number | null;
          def: number | null;
          earth: number | null;
          energy: number | null;
          fire: number | null;
          holy: number | null;
          ice: number | null;
          id_shield_ek: number;
          imbuiment: number | null;
          item_name: string;
          level_minimum: number | null;
          physical: number | null;
          skill: number | null;
          skill_type: number | null;
          vocation: number | null;
        };
        Insert: {
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          death?: number | null;
          def?: number | null;
          earth?: number | null;
          energy?: number | null;
          fire?: number | null;
          holy?: number | null;
          ice?: number | null;
          id_shield_ek: number;
          imbuiment?: number | null;
          item_name: string;
          level_minimum?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_type?: number | null;
          vocation?: number | null;
        };
        Update: {
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          death?: number | null;
          def?: number | null;
          earth?: number | null;
          energy?: number | null;
          fire?: number | null;
          holy?: number | null;
          ice?: number | null;
          id_shield_ek?: number;
          imbuiment?: number | null;
          item_name?: string;
          level_minimum?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_type?: number | null;
          vocation?: number | null;
        };
        Relationships: [];
      };
      shields_quiver: {
        Row: {
          bonus_1: string | null;
          death: number | null;
          earth: number | null;
          energy: number | null;
          fire: number | null;
          holy: number | null;
          ice: number | null;
          id_shields_quiver: number;
          item_name: string;
          level_minimum: number | null;
          physical: number | null;
          skill: number | null;
          skill_type: number | null;
          volume: number | null;
        };
        Insert: {
          bonus_1?: string | null;
          death?: number | null;
          earth?: number | null;
          energy?: number | null;
          fire?: number | null;
          holy?: number | null;
          ice?: number | null;
          id_shields_quiver: number;
          item_name: string;
          level_minimum?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_type?: number | null;
          volume?: number | null;
        };
        Update: {
          bonus_1?: string | null;
          death?: number | null;
          earth?: number | null;
          energy?: number | null;
          fire?: number | null;
          holy?: number | null;
          ice?: number | null;
          id_shields_quiver?: number;
          item_name?: string;
          level_minimum?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_type?: number | null;
          volume?: number | null;
        };
        Relationships: [];
      };
      shields_spellbook: {
        Row: {
          bonus_1: string | null;
          bonus_2: string | null;
          bonus_3: string | null;
          death: number | null;
          death_magic_level: number | null;
          defense: number | null;
          earth: number | null;
          earth_magic_level: number | null;
          energy: number | null;
          energy_magic_level: number | null;
          fire: number | null;
          fire_magic_level: number | null;
          healing_magic_level: number | null;
          holy: number | null;
          ice: number | null;
          ice_magic_level: number | null;
          id_shields_spellbook: number;
          item_name: string;
          level_minimum: number | null;
          physical: number | null;
          skill: number | null;
          skill_type: number | null;
          vocation: number | null;
        };
        Insert: {
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          death?: number | null;
          death_magic_level?: number | null;
          defense?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_shields_spellbook: number;
          item_name: string;
          level_minimum?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_type?: number | null;
          vocation?: number | null;
        };
        Update: {
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          death?: number | null;
          death_magic_level?: number | null;
          defense?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_shields_spellbook?: number;
          item_name?: string;
          level_minimum?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_type?: number | null;
          vocation?: number | null;
        };
        Relationships: [];
      };
      trinket: {
        Row: {
          bonus_1: string | null;
          death: number | null;
          earth: number | null;
          energy: number | null;
          fire: number | null;
          holy: number | null;
          ice: number | null;
          id_trinket: number;
          item_name: string;
          life_drain: number | null;
          mana_drain: number | null;
          vocation: number | null;
        };
        Insert: {
          bonus_1?: string | null;
          death?: number | null;
          earth?: number | null;
          energy?: number | null;
          fire?: number | null;
          holy?: number | null;
          ice?: number | null;
          id_trinket: number;
          item_name: string;
          life_drain?: number | null;
          mana_drain?: number | null;
          vocation?: number | null;
        };
        Update: {
          bonus_1?: string | null;
          death?: number | null;
          earth?: number | null;
          energy?: number | null;
          fire?: number | null;
          holy?: number | null;
          ice?: number | null;
          id_trinket?: number;
          item_name?: string;
          life_drain?: number | null;
          mana_drain?: number | null;
          vocation?: number | null;
        };
        Relationships: [];
      };
      weapons_distance: {
        Row: {
          attack: number | null;
          bonus: string | null;
          classification: number | null;
          death: number | null;
          earth: number | null;
          energy: number | null;
          fire: number | null;
          hit_percent: number | null;
          holy: number | null;
          holy_magic_level: number | null;
          ice: number | null;
          id_weapons_distance: number;
          imbuiment: number | null;
          item_name: string;
          level_minimum: number | null;
          physical: number | null;
          range: number | null;
          skill: number | null;
          skill_type: number | null;
        };
        Insert: {
          attack?: number | null;
          bonus?: string | null;
          classification?: number | null;
          death?: number | null;
          earth?: number | null;
          energy?: number | null;
          fire?: number | null;
          hit_percent?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          id_weapons_distance: number;
          imbuiment?: number | null;
          item_name: string;
          level_minimum?: number | null;
          physical?: number | null;
          range?: number | null;
          skill?: number | null;
          skill_type?: number | null;
        };
        Update: {
          attack?: number | null;
          bonus?: string | null;
          classification?: number | null;
          death?: number | null;
          earth?: number | null;
          energy?: number | null;
          fire?: number | null;
          hit_percent?: number | null;
          holy?: number | null;
          holy_magic_level?: number | null;
          ice?: number | null;
          id_weapons_distance?: number;
          imbuiment?: number | null;
          item_name?: string;
          level_minimum?: number | null;
          physical?: number | null;
          range?: number | null;
          skill?: number | null;
          skill_type?: number | null;
        };
        Relationships: [];
      };
      weapons_hand: {
        Row: {
          attack: number | null;
          bonus_1: string | null;
          classification: number | null;
          damage_type: number | null;
          defense: number | null;
          id_weapons_hand: number;
          imbuiment: number | null;
          item_name: string;
          level_minimum: number | null;
          skill: number | null;
          skill_2: number | null;
          skill_type: number | null;
          skill_type_2: number | null;
        };
        Insert: {
          attack?: number | null;
          bonus_1?: string | null;
          classification?: number | null;
          damage_type?: number | null;
          defense?: number | null;
          id_weapons_hand: number;
          imbuiment?: number | null;
          item_name: string;
          level_minimum?: number | null;
          skill?: number | null;
          skill_2?: number | null;
          skill_type?: number | null;
          skill_type_2?: number | null;
        };
        Update: {
          attack?: number | null;
          bonus_1?: string | null;
          classification?: number | null;
          damage_type?: number | null;
          defense?: number | null;
          id_weapons_hand?: number;
          imbuiment?: number | null;
          item_name?: string;
          level_minimum?: number | null;
          skill?: number | null;
          skill_2?: number | null;
          skill_type?: number | null;
          skill_type_2?: number | null;
        };
        Relationships: [];
      };
      weapons_melee: {
        Row: {
          bonus_1: string | null;
          bonus_2: string | null;
          class: number | null;
          classification: number | null;
          death: number | null;
          death_attack: number | null;
          defense: number | null;
          earth: number | null;
          earth_attack: number | null;
          energy: number | null;
          energy_attack: number | null;
          fire: number | null;
          fire_attack: number | null;
          hand: number | null;
          holy: number | null;
          holy_attack: number | null;
          ice: number | null;
          ice_attack: number | null;
          id_weapons_melee: number;
          imbuiment: number | null;
          item_name: string;
          level_minimum: number | null;
          life_drain: number | null;
          mana_drain: number | null;
          physical_attack: number | null;
          skill: number | null;
          skill_type: number | null;
          vocation: number | null;
        };
        Insert: {
          bonus_1?: string | null;
          bonus_2?: string | null;
          class?: number | null;
          classification?: number | null;
          death?: number | null;
          death_attack?: number | null;
          defense?: number | null;
          earth?: number | null;
          earth_attack?: number | null;
          energy?: number | null;
          energy_attack?: number | null;
          fire?: number | null;
          fire_attack?: number | null;
          hand?: number | null;
          holy?: number | null;
          holy_attack?: number | null;
          ice?: number | null;
          ice_attack?: number | null;
          id_weapons_melee: number;
          imbuiment?: number | null;
          item_name: string;
          level_minimum?: number | null;
          life_drain?: number | null;
          mana_drain?: number | null;
          physical_attack?: number | null;
          skill?: number | null;
          skill_type?: number | null;
          vocation?: number | null;
        };
        Update: {
          bonus_1?: string | null;
          bonus_2?: string | null;
          class?: number | null;
          classification?: number | null;
          death?: number | null;
          death_attack?: number | null;
          defense?: number | null;
          earth?: number | null;
          earth_attack?: number | null;
          energy?: number | null;
          energy_attack?: number | null;
          fire?: number | null;
          fire_attack?: number | null;
          hand?: number | null;
          holy?: number | null;
          holy_attack?: number | null;
          ice?: number | null;
          ice_attack?: number | null;
          id_weapons_melee?: number;
          imbuiment?: number | null;
          item_name?: string;
          level_minimum?: number | null;
          life_drain?: number | null;
          mana_drain?: number | null;
          physical_attack?: number | null;
          skill?: number | null;
          skill_type?: number | null;
          vocation?: number | null;
        };
        Relationships: [];
      };
      weapons_rod: {
        Row: {
          bonus_1: string | null;
          bonus_2: string | null;
          bonus_3: string | null;
          bonus_4: string | null;
          bonus_5: string | null;
          classification: number | null;
          damage_type: number | null;
          death: number | null;
          earth: number | null;
          earth_magic_level: number | null;
          energy: number | null;
          fire: number | null;
          healing_magic_level: number | null;
          holy: number | null;
          ice: number | null;
          ice_magic_level: number | null;
          id_weapons_rod: number;
          imbuiment: number | null;
          item_name: string;
          level_minimum: number | null;
          physical: number | null;
          skill: number | null;
          skill_type: number | null;
        };
        Insert: {
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          bonus_4?: string | null;
          bonus_5?: string | null;
          classification?: number | null;
          damage_type?: number | null;
          death?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          fire?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_weapons_rod: number;
          imbuiment?: number | null;
          item_name: string;
          level_minimum?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_type?: number | null;
        };
        Update: {
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          bonus_4?: string | null;
          bonus_5?: string | null;
          classification?: number | null;
          damage_type?: number | null;
          death?: number | null;
          earth?: number | null;
          earth_magic_level?: number | null;
          energy?: number | null;
          fire?: number | null;
          healing_magic_level?: number | null;
          holy?: number | null;
          ice?: number | null;
          ice_magic_level?: number | null;
          id_weapons_rod?: number;
          imbuiment?: number | null;
          item_name?: string;
          level_minimum?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_type?: number | null;
        };
        Relationships: [];
      };
      weapons_wand: {
        Row: {
          bonus_1: string | null;
          bonus_2: string | null;
          bonus_3: string | null;
          bonus_4: string | null;
          bonus_5: string | null;
          classification: number | null;
          damage_type: number | null;
          death: number | null;
          death_magic_level: number | null;
          earth: number | null;
          energy: number | null;
          energy_magic_level: number | null;
          fire: number | null;
          fire_magic_level: number | null;
          holy: number | null;
          ice: number | null;
          id_weapons_wand: number;
          imbuiment: number | null;
          item_name: string;
          level_minimum: number | null;
          physical: number | null;
          skill: number | null;
          skill_type: number | null;
        };
        Insert: {
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          bonus_4?: string | null;
          bonus_5?: string | null;
          classification?: number | null;
          damage_type?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          earth?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          holy?: number | null;
          ice?: number | null;
          id_weapons_wand: number;
          imbuiment?: number | null;
          item_name: string;
          level_minimum?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_type?: number | null;
        };
        Update: {
          bonus_1?: string | null;
          bonus_2?: string | null;
          bonus_3?: string | null;
          bonus_4?: string | null;
          bonus_5?: string | null;
          classification?: number | null;
          damage_type?: number | null;
          death?: number | null;
          death_magic_level?: number | null;
          earth?: number | null;
          energy?: number | null;
          energy_magic_level?: number | null;
          fire?: number | null;
          fire_magic_level?: number | null;
          holy?: number | null;
          ice?: number | null;
          id_weapons_wand?: number;
          imbuiment?: number | null;
          item_name?: string;
          level_minimum?: number | null;
          physical?: number | null;
          skill?: number | null;
          skill_type?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
