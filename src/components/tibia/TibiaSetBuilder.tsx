import { useMemo, useState } from "react";
import type { SlotKey } from "@/lib/tibia";
import { Carregando, Erro } from "@/components/station/Estados";
import { ELEMENTOS } from "@/components/station/elementos";
import { useT } from "@/lib/i18n";
import { Cont } from "@/components/station/Layout";
import { PageIntro } from "@/components/station/PageIntro";
import { itensDoSlot, layoutDoSet, setParaStats } from "./builderState";
import { CharacterStats } from "./CharacterStats";
import { EquipmentGrid } from "./EquipmentGrid";
import { PresetsPanel } from "./PresetsPanel";
import { SlotPickerDialog } from "./SlotPickerDialog";
import { useSetBuilder } from "./useSetBuilder";
import { VocacaoPanel } from "./VocacaoPanel";

/** Tela do Set Builder: monta o estado (useSetBuilder) e distribui entre os painéis. */
export function TibiaSetBuilder() {
  const sb = useSetBuilder();
  const { state } = sb;
  const [slotAberto, setSlotAberto] = useState<SlotKey | null>(null);
  const [busca, setBusca] = useState("");

  const itens = useMemo(
    () => (slotAberto && sb.filtros ? itensDoSlot(sb.data, slotAberto, sb.filtros, busca) : []),
    [slotAberto, sb.filtros, sb.data, busca],
  );
  const fechar = () => {
    setSlotAberto(null);
    setBusca("");
  };

  const t = useT();
  const selo = state.protection
    ? t("Preset de proteção: {x}", { x: ELEMENTOS[state.protection].label })
    : state.level > 0
      ? t("Preset de nível {n}", { n: state.level })
      : null;

  return (
    <>
      <PageIntro titulo="Set Builder" eyebrow="O ARSENAL" numeral="I">
        Monte seu set por vocação, nível e proteção elemental.
      </PageIntro>

      <Cont className="mt-8 grid items-start gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="space-y-5 lg:sticky lg:top-20">
          <VocacaoPanel
            vocation={state.vocation}
            ekClass={state.ekClass}
            onVocation={sb.escolherVocacao}
            onClass={sb.escolherClasse}
          />
          <PresetsPanel
            level={state.level}
            protection={state.protection}
            semVocacao={!state.vocation}
            carregando={sb.carregando}
            onLevel={sb.escolherNivel}
            onProtection={sb.escolherProtecao}
            onClear={sb.limpar}
          />
        </div>

        <section className="frame p-5" aria-labelledby="sb-grade">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="sb-grade" className="font-display text-xl font-bold">
                {t("Equipamento do melhor set")}
              </h2>
            </div>
            {selo && (
              <p className="border border-good px-2.5 py-1 text-sm font-semibold text-good">
                {selo}
              </p>
            )}
          </div>

          <div className="mt-6">
            {sb.erro ? (
              <Erro
                titulo="Não foi possível carregar os itens"
                texto="A lista de itens não chegou. Tente de novo; se continuar, recarregue a página."
                onTentar={sb.tentarDeNovo}
              />
            ) : (
              <EquipmentGrid
                views={layoutDoSet(state)}
                vocation={state.vocation}
                imbuiments={state.imbuiments}
                onOpen={setSlotAberto}
                onImbuimentChange={sb.definirImbuiment}
              />
            )}
          </div>

          {!state.vocation && (
            <p className="mt-5 text-center text-muted-foreground">
              {t("Escolha uma vocação acima para começar a montar o set.")}
            </p>
          )}
          {state.vocation && sb.carregando && (
            <div className="mt-5">
              <Carregando rotulo="Carregando itens…" linhas={2} />
            </div>
          )}

          {state.vocation && (
            <div className="mt-8">
              <CharacterStats selected={setParaStats(state)} imbuimentItems={sb.imbuimentItems} />
            </div>
          )}
        </section>
      </Cont>

      <SlotPickerDialog
        slot={slotAberto}
        itens={itens}
        busca={busca}
        onBusca={setBusca}
        onFechar={fechar}
        onEscolher={(item) => {
          if (slotAberto) sb.trocarItem(slotAberto, item);
          fechar();
        }}
      />
    </>
  );
}
