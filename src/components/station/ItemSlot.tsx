import { Sword } from "lucide-react";
import { useState } from "react";
import { spriteUrl } from "@/lib/storage";

/** Casa de item com o sprite do bucket (somente leitura). Se o GIF não existir, mostra um ícone no lugar. */
export function ItemSlot({ nome, className = "size-16" }: { nome: string; className?: string }) {
  const [falhou, setFalhou] = useState(false);
  return (
    <span
      className={`frame-inset inline-flex shrink-0 items-center justify-center p-1.5 ${className}`}
    >
      {falhou ? (
        <>
          <Sword aria-hidden="true" className="size-1/2 text-gold-dim" strokeWidth={1.5} />
          <span className="sr-only">{nome}</span>
        </>
      ) : (
        <img
          src={spriteUrl(nome)}
          alt={nome}
          loading="lazy"
          onError={() => setFalhou(true)}
          className="max-h-full max-w-full object-contain [image-rendering:pixelated]"
        />
      )}
    </span>
  );
}
