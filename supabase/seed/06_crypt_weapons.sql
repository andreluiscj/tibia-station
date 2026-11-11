insert into public.crypt_weapons (slug, name, wiki_title, vocation, category, attack, defense, element, level_required, imbuement_slots, attributes) values
  ('crypt-breaker', 'Crypt Breaker', 'Crypt Breaker', 'knight', 'club', 58, 33, 'fire', 450, 3, ARRAY['club fighting +4']::text[]),
  ('crypt-slicer', 'Crypt Slicer', 'Crypt Slicer', 'knight', 'sword', 58, 33, 'earth', 450, 3, ARRAY['sword fighting +4']::text[]),
  ('crypt-splitter', 'Crypt Splitter', 'Crypt Splitter', 'knight', 'axe', 58, 33, 'energy', 450, 3, ARRAY['axe fighting +4']::text[]),
  ('crypt-strike', 'Crypt Strike', 'Crypt Strike', 'monk', 'fist', 45, 20, NULL, 450, 3, ARRAY['fist fighting +4', 'magic level +1']::text[])
on conflict (slug) do update set name = excluded.name, wiki_title = excluded.wiki_title, vocation = excluded.vocation, category = excluded.category, attack = excluded.attack, defense = excluded.defense, element = excluded.element, level_required = excluded.level_required, imbuement_slots = excluded.imbuement_slots, attributes = excluded.attributes;
