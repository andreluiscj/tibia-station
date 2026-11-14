import { useEffect, useMemo, useState } from "react";
import { useT } from "@/lib/i18n";
import { Chip } from "./Chip";
import { Passo } from "./Passo";
import { CreaturePicker } from "./CreaturePicker";
import { CriaturaCard } from "./CriaturaCard";
import {
  NIVEL_CRYPT,
  calcular,
  resolver,
  type CryptCat,
  type CryptSearch,
  type Proficiencias,
  ProficienciaCtx,
} from "./cryptEstado";
import { btnPrimario } from "./estilos";
import { n1 } from "./format";
import { HuntPicker } from "./HuntPicker";
import { HuntDetalhes } from "./HuntDetalhes";
import { HuntsDaCriatura } from "./HuntsDaCriatura";
import { Resultado } from "./CryptResultado";
import {
  useAltWeapons,
  useBosses,
  useCreatures,
  useCryptWeapons,
  useHunts,
  useSources,
} from "./useDados";
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
  const t = useT();
  const r = resolver(estado);
  const armas = useCryptWeapons();
  const alternativas = useAltWeapons();
  const criaturas = useCreatures();
  const bosses = useBosses();
  const hunts = useHunts();
  const fontes = useSources();
  const [lvlTxt, setLvlTxt] = useState(String(r.lvl));
  // Se a URL mudar por fora (link, voltar), o campo acompanha; digitar um valor válido não é sobrescrito.
  useEffect(() => {
    setLvlTxt((t) => (t !== "" && Number(t) === r.lvl ? t : String(r.lvl)));
  }, [r.lvl]);
  const lvlInvalido = lvlTxt !== "" && !validoLvl(lvlTxt);
  const [tipoManual, setTipoManual] = useState<"monster" | "boss" | "hunt">("monster");
  const ehBoss = !!estado.monster && !!bosses.data?.some((b) => b.slug === estado.monster);
  const tipoEscolhido = estado.hunt
    ? "hunt"
    : estado.monster
      ? ehBoss
        ? "boss"
        : "monster"
      : tipoManual;
  // Proficiências editadas nas armas Crypt (slug da arma); vazio = proficiência completa.
  const [semImb, setSemImb] = useState<Record<string, boolean>>({});
  const [imbRasc, setImbRasc] = useState<Record<string, boolean>>({});
  const [recalculando, setRecalculando] = useState(false);
  // Todo recálculo mostra o esqueleto por um instante, para o usuário perceber que algo foi refeito.
  const refazer = (fn: () => void) => {
    setRecalculando(true);
    setTimeout(() => {
      fn();
      setRecalculando(false);
    }, 450);
  };
  const aplicarImb = (slug: string, sem: boolean) =>
    refazer(() =>
      setSemImb(({ [slug]: _, ...resto }) => (sem ? { ...resto, [slug]: true } : resto)),
    );
  const rascunharImb = (slug: string, sem: boolean) =>
    setImbRasc(({ [slug]: _, ...resto }) =>
      sem === !!semImb[slug] ? resto : { ...resto, [slug]: sem },
    );
  const recalcular = () =>
    refazer(() => {
      setSemImb((atual) => {
        const novo = { ...atual };
        for (const [slug, sem] of Object.entries(imbRasc)) {
          if (sem) novo[slug] = true;
          else delete novo[slug];
        }
        return novo;
      });
      setImbRasc({});
    });
  const [profs, setProfs] = useState<Proficiencias>({});
  const aplicarProf = (slug: string, p: Proficiencias[string] | null) =>
    refazer(() => setProfs(({ [slug]: _, ...resto }) => (p ? { ...resto, [slug]: p } : resto)));

  // Pesos editados no modal da hunt; voltam ao padrão quando a hunt muda.
  const [pesosEdit, setPesosEdit] = useState<Record<string, number> | null>(null);
  useEffect(() => setPesosEdit(null), [estado.hunt]);

  const porSlug = useMemo(
    () => new Map([...(criaturas.data ?? []), ...(bosses.data ?? [])].map((c) => [c.slug, c])),
    [criaturas.data, bosses.data],
  );
  const calculo = useMemo(
    () =>
      armas.data && alternativas.data && criaturas.data && bosses.data && hunts.data
        ? calcular({
            armas: armas.data,
            alternativas: alternativas.data,
            criaturas: porSlug,
            hunts: hunts.data,
            estado,
            pesos: pesosEdit,
            proficiencias: profs,
            semImbuiment: semImb,
          })
        : null,
    [
      armas.data,
      alternativas.data,
      criaturas.data,
      bosses.data,
      hunts.data,
      porSlug,
      estado,
      pesosEdit,
      profs,
      semImb,
    ],
  );

  const huntSel = estado.hunt ? hunts.data?.find((h) => h.slug === estado.hunt) : undefined;
  const pesosAtuais: Record<string, number> =
    pesosEdit ??
    Object.fromEntries(
      (huntSel?.creatures ?? []).map((hc) => [hc.creatureSlug, r.usarPeso ? hc.weight : 1]),
    );

  const editado = !!pesosEdit || Object.keys(profs).length > 0 || Object.keys(semImb).length > 0;
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
              {t("O Monk usa só o Crypt Strike (Fist), então não há o que escolher.")}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map(([chave, rotulo]) => (
                <Chip
                  key={chave}
                  ativo={r.cat === chave}
                  onClick={() => onChange({ cat: chave === "todas" ? null : chave })}
                >
                  {t(rotulo)}
                </Chip>
              ))}
            </div>
          )}
        </Passo>

        <Passo n={3} titulo="Nível">
          <label htmlFor="crypt-lvl" className="mb-1.5 block text-sm text-muted-foreground">
            {t("Nível do personagem")}
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
              {t("Use um nível de 1 a 5000.")}
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
                  {t("Criatura")}
                </Chip>
                <Chip
                  ativo={tipoEscolhido === "boss"}
                  onClick={() => {
                    setTipoManual("boss");
                    onChange({ hunt: null, monster: null });
                  }}
                >
                  Boss
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
                  onPesos={(p) => refazer(() => setPesosEdit(p))}
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
            {tipoEscolhido !== "hunt" ? (
              <CreaturePicker
                key={tipoEscolhido}
                boss={tipoEscolhido === "boss"}
                label={tipoEscolhido === "boss" ? "Boss" : "Criatura"}
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
              {t("Ponderar pelo peso da criatura (desligado: cada criatura conta igual)")}
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
            <strong className="text-gold">
              {t("A Crypt exige nível {n}.", { n: NIVEL_CRYPT })}
            </strong>{" "}
            {t(
              "Você informou nível {n}. O cálculo abaixo continua valendo para quando chegar lá; o nível também define quais armas do jogo entram na comparação.",
              { n: r.lvl },
            )}
          </p>
        )}
      </div>

      {alternativas.data?.length === 0 && (
        <p role="status" className="mt-5 border border-gold-dim bg-muted px-4 py-3">
          {t(
            "Nenhuma arma das tabelas do jogo foi carregada, então a comparação mostra só as Crypt.",
          )}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">{t("Resultado")}</h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!editado}
            onClick={() => {
              refazer(() => {
                setProfs({});
                setSemImb({});
                setImbRasc({});
                setPesosEdit(null);
              });
            }}
            className="inline-flex min-h-11 items-center border border-border bg-metal px-5 font-semibold text-foreground transition-colors enabled:hover:border-gold-dim disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("Resetar cálculos")}
          </button>
          <button type="button" onClick={recalcular} className={btnPrimario}>
            {t("Recalcular")}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p role="status" className="sr-only">
          {resumo}
        </p>
        <ProficienciaCtx.Provider
          value={{
            profs,
            aplicar: aplicarProf,
            semImb,
            aplicarImb,
            imbRasc,
            rascunharImb,
            recalcular,
          }}
        >
          <Resultado
            carregando={
              recalculando ||
              armas.isPending ||
              criaturas.isPending ||
              bosses.isPending ||
              hunts.isPending ||
              alternativas.isPending
            }
            erro={
              armas.isError ||
              criaturas.isError ||
              bosses.isError ||
              hunts.isError ||
              alternativas.isError
            }
            onTentar={() => {
              void alternativas.refetch();
              void armas.refetch();
              void criaturas.refetch();
              void bosses.refetch();
              void hunts.refetch();
            }}
            calculo={calculo}
            onChange={onChange}
          />
        </ProficienciaCtx.Provider>
      </div>
    </>
  );
}
