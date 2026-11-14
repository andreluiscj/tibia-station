import { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import { Chip } from "./Chip";
import {
  ProficienciaCtx,
  proficienciaIdeal,
  type Candidato,
  type Proficiencia,
} from "./cryptEstado";
import { btnPrimario, btnSecundario } from "./estilos";

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

/** "Editar proficiência": painel no estilo do jogo; por padrão completo, com os perks ideais marcados. O usuário ajusta e refaz o cálculo. */
export function ProficienciaDialog({ c }: { c: Candidato }) {
  const t = useT();
  const { profs, aplicar } = useContext(ProficienciaCtx);
  const arma = c.arma;
  const editada = arma ? profs[arma.slug] : undefined;
  const atual: Proficiencia = {
    max: editada?.max ?? 7,
    perks: arma
      ? { ...proficienciaIdeal(arma.vocation, !!c.imbued, c.escolhas), ...editada?.perks }
      : {},
  };
  const [aberto, setAberto] = useState(false);
  const [rascunho, setRascunho] = useState(atual);
  if (!arma) return null;
  const marcados = rascunho.perks;
  const fechar = (p: Proficiencia | null) => {
    aplicar(arma.slug, p);
    setAberto(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setRascunho(atual);
          setAberto(true);
        }}
        className="ml-auto font-bold text-primary underline underline-offset-4 transition-colors hover:text-accent"
      >
        {t("Editar proficiência")}
        {editada ? ` (${t("editada")})` : ""}
      </button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[min(90rem,calc(100vw-2rem))] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>{t("Proficiência: {nome}", { nome: arma.name })}</DialogTitle>
            <DialogDescription>
              {t(
                "Por padrão a proficiência está completa. Se a sua não está, informe até que nível ela vai e clique no perk de cada nível; depois use Refazer cálculo.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div
            role="group"
            aria-label={t("Nível máximo da proficiência")}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="mr-1 font-semibold">{t("Proficiência até o nível:")}</span>
            {arma.perks.map((n) => (
              <Chip
                key={n.level}
                ativo={rascunho.max === n.level}
                onClick={() => setRascunho({ ...rascunho, max: n.level })}
              >
                {n.level}
              </Chip>
            ))}
          </div>

          <div className="overflow-x-auto">
            <div className="grid min-w-[56rem] grid-cols-7 gap-px bg-[#0a4a4a] text-white">
              {arma.perks.map((nivel) => (
                <p
                  key={`t${nivel.level}`}
                  className="bg-[#118a8a] py-2 text-center text-sm font-semibold"
                >
                  <span aria-hidden="true">★</span> {t("Nível {n}", { n: nivel.level })}
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
                      <button
                        type="button"
                        disabled={nivel.level > rascunho.max}
                        aria-pressed={marcados[nivel.level] === o.id}
                        onClick={() =>
                          setRascunho({
                            ...rascunho,
                            perks: { ...rascunho.perks, [nivel.level]: o.id },
                          })
                        }
                        className={`block ${nivel.level > rascunho.max ? "cursor-not-allowed opacity-30" : ""}`}
                      >
                        <IconePerk
                          slug={arma.slug}
                          id={o.id}
                          marcado={nivel.level <= rascunho.max && marcados[nivel.level] === o.id}
                        />
                        <span className="sr-only">{o.text}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ))}
              {arma.perks.map((nivel) => (
                <p
                  key={`d${nivel.level}`}
                  className="min-h-28 bg-[#3a3d3f] p-3 text-sm leading-snug text-[#eee4cc]"
                >
                  {nivel.level > rascunho.max
                    ? t("Nível ainda não liberado.")
                    : (nivel.options.find((o) => o.id === marcados[nivel.level])?.text ??
                      t("Definido pelo cálculo"))}
                </p>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className={btnPrimario} onClick={() => fechar(rascunho)}>
              {t("Refazer cálculo")}
            </button>
            <button type="button" className={btnSecundario} onClick={() => fechar(null)}>
              {t("Restaurar proficiência completa")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
