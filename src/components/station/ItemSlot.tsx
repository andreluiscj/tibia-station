import { Sword } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { spriteUrl } from "@/lib/storage";

const MARGEM = 4; // respiro dentro do nicho, além da borda

/** Casa de item com o sprite (public/sprites/items), ampliado em escala inteira (2x, 3x…) sem borrar. Se o GIF não existir, mostra um ícone. */
export function ItemSlot({ nome, className = "size-16" }: { nome: string; className?: string }) {
  const [falhou, setFalhou] = useState(false);
  const [tam, setTam] = useState<{ w: number; h: number } | null>(null);
  const ref = useRef<HTMLImageElement>(null);

  const ajustar = (img: HTMLImageElement) => {
    const caixa = img.parentElement;
    const maior = Math.max(img.naturalWidth, img.naturalHeight);
    if (!caixa || !maior) return;
    const k = Math.max(
      1,
      Math.floor((Math.min(caixa.clientWidth, caixa.clientHeight) - MARGEM) / maior),
    );
    setTam({ w: img.naturalWidth * k, h: img.naturalHeight * k });
  };
  // Imagem já carregada antes da hidratação não dispara onLoad.
  useEffect(() => {
    if (ref.current?.complete) ajustar(ref.current);
  }, [nome]);

  return (
    <span className={`nicho inline-flex shrink-0 items-end justify-center ${className}`}>
      <span aria-hidden="true" className="nicho-arco" />
      {falhou ? (
        <>
          <Sword
            aria-hidden="true"
            className="relative size-1/2 self-center text-[#d2c1a0]"
            strokeWidth={1.5}
          />
          <span className="sr-only">{nome}</span>
        </>
      ) : (
        <img
          ref={ref}
          src={spriteUrl(nome)}
          alt={nome}
          loading="lazy"
          onLoad={(e) => ajustar(e.currentTarget)}
          onError={() => setFalhou(true)}
          style={tam ? { width: tam.w, height: tam.h } : undefined}
          className="relative max-h-full max-w-full self-center object-contain [image-rendering:pixelated]"
        />
      )}
    </span>
  );
}
