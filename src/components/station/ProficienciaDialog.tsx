import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { proficienciaIdeal, type Candidato } from "./cryptEstado";

/** Ícone do perk (public/proficiencia/<arma>/<nível>-<opção>.gif); sem imagem (ex.: Monk), mostra o número da opção. */
function IconePerk({ slug, id, marcado }: { slug: string; id: string; marcado: boolean }) {
  const [falhou, setFalhou] = useState(false);
  return (
    <span
      className={`flex size-24 shrink-0 items-center justify-center border-2 bg-[#2b2f31] transition duration-200 ${
        marcado
          ? "border-[#e2b254] shadow-[0_0_0_2px_#9c5322] brightness-110"
          : "border-[#6d7478] opacity-50 grayscale hover:opacity-80"
      }`}
    >
      {falhou ? (
        <span className="num text-sm text-[#d2c1a0]">{id}</span>
      ) : (
        <img
          src={`/proficiencia/${slug}/${id.replace(".", "-")}.gif`}
          alt=""
          width={96}
          height={96}
          onError={() => setFalhou(true)}
          className="size-full object-contain [image-rendering:pixelated]"
        />
      )}
    </span>
  );
}

/** "Ver proficiência": painel no estilo do jogo, uma coluna por nível, com os perks que devem ser marcados. */
export function ProficienciaDialog({ c }: { c: Candidato }) {
  const [aberto, setAberto] = useState(false);
  const arma = c.arma;
  if (!arma) return null;
  const marcados = proficienciaIdeal(arma.vocation, !!c.imbued, c.escolhas);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="ml-auto font-bold text-primary underline underline-offset-4 transition-colors hover:text-accent"
      >
        Ver proficiência
      </button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[min(90rem,calc(100vw-2rem))] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Proficiência: {arma.name}</DialogTitle>
            <DialogDescription>
              Marque em cada nível o perk com a moldura dourada. Os demais ficam apagados.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto">
            <div className="grid min-w-[56rem] grid-cols-7 gap-px bg-[#0a4a4a] text-white">
              {arma.perks.map((nivel) => (
                <p
                  key={`t${nivel.level}`}
                  className="bg-[#118a8a] py-2 text-center text-sm font-semibold"
                >
                  <span aria-hidden="true">★</span> Nível {nivel.level}
                </p>
              ))}
              {arma.perks.map((nivel) => (
                <ul
                  key={`c${nivel.level}`}
                  className={`flex min-h-96 flex-col items-center gap-3 bg-[#0e6a6a] py-3 ${
                    nivel.options.length === 1 ? "justify-center" : "justify-between"
                  }`}
                >
                  {nivel.options.map((o) => (
                    <li key={o.id} title={o.text}>
                      <IconePerk
                        slug={arma.slug}
                        id={o.id}
                        marcado={marcados[nivel.level] === o.id}
                      />
                      <span className="sr-only">
                        {marcados[nivel.level] === o.id ? "Marcar: " : ""}
                        {o.text}
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
              {arma.perks.map((nivel) => (
                <p
                  key={`d${nivel.level}`}
                  className="min-h-28 bg-[#3a3d3f] p-3 text-sm leading-snug text-[#eee4cc]"
                >
                  {nivel.options.find((o) => o.id === marcados[nivel.level])?.text ??
                    "Definido pelo cálculo"}
                </p>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
