import { useEffect, useMemo, useState } from "react";
import { Chip } from "./Chip";
import { Passo } from "./Passo";
import { CreaturePicker } from "./CreaturePicker";
import { CriaturaCard } from "./CriaturaCard";
import { NIVEL_CRYPT, calcular, resolver, type CryptCat, type CryptSearch } from "./cryptEstado";
import { n1 } from "./format";
import { HuntPicker } from "./HuntPicker";
import { HuntDetalhes } from "./HuntDetalhes";
import { HuntsDaCriatura } from "./HuntsDaCriatura";
import { Resultado } from "./CryptResultado";
import { useAltWeapons, useCreatures, useCryptWeapons, useHunts, useSources } from "./useDados";
import { Input } from "@/components/ui/input";

export type Patch = { [K in keyof CryptSearch]?: CryptSearch[K] | null };

const CATEGORIAS: [CryptCat, string][] = [
  ["todas", "Comparar as 3"],
  ["club", "Club"],
  ["sword", "Sword"],
  ["axe", "Axe"],
];

const validoLvl = (t: string) => /^\d+$/.test(t) && Number(t) >= 1 && Number(t) <= 5000;

export function CryptCalculator({
  estado,
  onChange,
}: {
  estado: CryptSearch;
  onChange: (patch: Patch) => void;
}) {
  const r = resolver(estado);
  const armas = useCryptWeapons();
  const alternativas = useAltWeapons();
  const criaturas = useCreatures();
  const hunts = useHunts();
  const fontes = useSources();
  const [lvlTxt, setLvlTxt] = useState(String(r.lvl));
  // Se a URL mudar por fora (link, voltar), o campo acompanha; digitar um valor válido não é sobrescrito.
  useEffect(() => {
    setLvlTxt((t) => (t !== "" && Number(t) === r.lvl ? t : String(r.lvl)));
  }, [r.lvl]);
  const lvlInvalido = lvlTxt !== "" && !validoLvl(lvlTxt);
  const [tipoManual, setTipoManual] = useState<"monster" | "hunt">("monster");
  const tipoEscolhido = estado.hunt ? "hunt" : estado.monster ? "monster" : tipoManual;

  // Pesos editados no modal da hunt; voltam ao padrão quando a hunt muda.
  const [pesosEdit, setPesosEdit] = useState<Record<string, number> | null>(null);
  useEffect(() => setPesosEdit(null), [estado.hunt]);

  const porSlug = useMemo(
    () => new Map((criaturas.data ?? []).map((c) => [c.slug, c])),
    [criaturas.data],
  );
  const calculo = useMemo(
    () =>
      armas.data && alternativas.data && criaturas.data && hunts.data
        ? calcular({
            armas: armas.data,
            alternativas: alternativas.data,
            criaturas: porSlug,
            hunts: hunts.data,
            estado,
            pesos: pesosEdit,
          })
        : null,
    [armas.data, alternativas.data, criaturas.data, hunts.data, porSlug, estado, pesosEdit],
  );

  const huntSel = estado.hunt ? hunts.data?.find((h) => h.slug === estado.hunt) : undefined;
  const pesosAtuais: Record<string, number> =
    pesosEdit ??
    Object.fromEntries(
      (huntSel?.creatures ?? []).map((hc) => [hc.creatureSlug, r.usarPeso ? hc.weight : 1]),
    );

  const mudarVoc = (voc: "ek" | "monk") => onChange({ voc, cat: null });
  const mudarLvl = (txt: string) => {
    setLvlTxt(txt);
    if (validoLvl(txt)) onChange({ lvl: Number(txt) });
  };
  const resumo =
    calculo?.tipo === "ok"
      ? `Resultado atualizado. Alvo: ${calculo.rotulo}. Melhor arma: ${calculo.candidatos[0].nome}, ${n1(calculo.candidatos[0].damagePct)}.`
      : "";

  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        <Passo n={1} titulo="Vocação">
          <div className="flex flex-wrap gap-2">
            <Chip ativo={r.voc === "ek"} onClick={() => mudarVoc("ek")}>
              Elite Knight
            </Chip>
            <Chip ativo={r.voc === "monk"} onClick={() => mudarVoc("monk")}>
              Exalted Monk
            </Chip>
          </div>
        </Passo>

        <Passo n={2} titulo="Categoria">
          {r.voc === "monk" ? (
            <p className="leading-relaxed text-muted-foreground">
              O Monk usa só o Crypt Strike (Fist), então não há o que escolher.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map(([chave, rotulo]) => (
                <Chip
                  key={chave}
                  ativo={r.cat === chave}
                  onClick={() => onChange({ cat: chave === "todas" ? null : chave })}
                >
                  {rotulo}
                </Chip>
              ))}
            </div>
          )}
        </Passo>

        <Passo n={3} titulo="Nível">
          <label htmlFor="crypt-lvl" className="mb-1.5 block text-sm text-muted-foreground">
            Nível do personagem
          </label>
          <Input
            id="crypt-lvl"
            type="number"
            inputMode="numeric"
            min={1}
            max={5000}
            value={lvlTxt}
            onChange={(e) => mudarLvl(e.target.value)}
            onBlur={() => setLvlTxt(String(r.lvl))}
            aria-invalid={lvlInvalido}
            aria-describedby={lvlInvalido ? "crypt-lvl-erro" : undefined}
            className="h-11 w-full rounded-none bg-background text-base"
          />
          {lvlInvalido && (
            <p id="crypt-lvl-erro" className="mt-1.5 text-sm text-bad">
              Use um nível de 1 a 5000.
            </p>
          )}
        </Passo>
      </div>

      <div className="mt-5">
        <Passo n={4} titulo="Alvo">
          <div className="grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
            <div className="lg:mt-9">
              <div className="flex flex-wrap gap-2">
                <Chip
                  ativo={tipoEscolhido === "monster"}
                  onClick={() => {
                    setTipoManual("monster");
                    onChange({ hunt: null });
                  }}
                >
                  Criatura
                </Chip>
                <Chip
                  ativo={tipoEscolhido === "hunt"}
                  onClick={() => {
                    setTipoManual("hunt");
                    onChange({ monster: null });
                  }}
                >
                  Hunt
                </Chip>
              </div>
              {tipoEscolhido === "hunt" && huntSel && (
                <HuntDetalhes
                  hunt={huntSel}
                  criaturas={porSlug}
                  pesos={pesosAtuais}
                  onPesos={setPesosEdit}
                  melhor={
                    calculo?.tipo === "ok"
                      ? {
                          nome: calculo.candidatos[0].nome,
                          damagePct: calculo.candidatos[0].damagePct,
                        }
                      : undefined
                  }
                />
              )}
              {tipoEscolhido === "monster" && estado.monster && (
                <HuntsDaCriatura
                  slug={estado.monster}
                  nome={porSlug.get(estado.monster)?.name ?? estado.monster}
                />
              )}
            </div>
            {tipoEscolhido === "monster" ? (
              <CreaturePicker
                value={estado.monster ?? null}
                onChange={(slug) => onChange({ monster: slug, hunt: null })}
              />
            ) : (
              <HuntPicker
                value={estado.hunt ?? null}
                onChange={(slug) => onChange({ hunt: slug, monster: null })}
              />
            )}
          </div>
          {estado.hunt && (
            <label className="mt-4 flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                checked={r.usarPeso}
                onChange={(e) => onChange({ peso: e.target.checked ? 1 : null })}
                className="size-5 accent-gold"
              />
              Ponderar pelo peso da criatura (desligado: cada criatura conta igual)
            </label>
          )}
        </Passo>
      </div>

      {calculo?.tipo === "ok" && (
        <div className="mt-5">
          <CriaturaCard
            criatura={estado.monster ? porSlug.get(estado.monster) : undefined}
            huntNome={estado.hunt ? calculo.rotulo : undefined}
            alvos={calculo.alvos}
          />
        </div>
      )}

      <div className="mt-5 space-y-3">
        {r.lvl < NIVEL_CRYPT && (
          <p role="status" className="border border-gold-dim bg-muted px-4 py-3">
            <strong className="text-gold">A Crypt exige nível {NIVEL_CRYPT}.</strong> Você informou
            nível {r.lvl}. O cálculo abaixo continua valendo para quando chegar lá; o nível também
            define quais armas do jogo entram na comparação.
          </p>
        )}
      </div>

      {alternativas.data?.length === 0 && (
        <p role="status" className="mt-5 border border-gold-dim bg-muted px-4 py-3">
          Nenhuma arma das tabelas do jogo foi carregada, então a comparação mostra só as Crypt.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">Resultado</h2>
      </div>

      <div className="mt-6">
        <p role="status" className="sr-only">
          {resumo}
        </p>
        <Resultado
          carregando={
            armas.isPending || criaturas.isPending || hunts.isPending || alternativas.isPending
          }
          erro={armas.isError || criaturas.isError || hunts.isError || alternativas.isError}
          onTentar={() => {
            void alternativas.refetch();
            void armas.refetch();
            void criaturas.refetch();
            void hunts.refetch();
          }}
          calculo={calculo}
          onChange={onChange}
        />
      </div>
    </>
  );
}
