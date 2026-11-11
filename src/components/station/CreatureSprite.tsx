import { useState } from "react";

/** Sprite da criatura (public/sprites/creatures/<slug>.gif); se faltar, mostra a inicial em moldura de pedra. */
export function CreatureSprite({
  slug,
  name,
  className = "size-12 text-xl",
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const [falhou, setFalhou] = useState(false);
  return (
    <span
      aria-hidden="true"
      className={`frame-inset inline-flex shrink-0 items-center justify-center overflow-hidden font-display font-bold text-gold-dim ${className}`}
    >
      {falhou ? (
        name.charAt(0).toUpperCase()
      ) : (
        <img
          src={`/sprites/creatures/${slug}.gif`}
          alt=""
          loading="lazy"
          onError={() => setFalhou(true)}
          className="size-full object-contain [image-rendering:pixelated]"
        />
      )}
    </span>
  );
}
