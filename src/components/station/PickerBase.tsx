import { ChevronsUpDown } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useT } from "@/lib/i18n";
import { buscar, type Indexado } from "./busca";
import { Carregando, Erro } from "./Estados";

export interface OpcaoPicker {
  chave: string;
  rotulo: string;
  detalhe?: string | null;
  /** Imagem ao lado do nome (ex.: sprite da criatura). */
  icone?: ReactNode;
}

const LIMITE = 50;

/**
 * Seletor com busca e teclado (setas, Enter, Esc). A lista mostra no máximo 50 resultados por vez,
 * então milhares de itens não travam a tela.
 */
export function PickerBase({
  rotulo,
  placeholder,
  opcoes,
  carregando,
  erro,
  onTentar,
  valor,
  valorRotulo,
  valorIcone,
  onChange,
}: {
  rotulo: string;
  placeholder: string;
  opcoes: readonly Indexado<OpcaoPicker>[];
  carregando: boolean;
  erro: boolean;
  onTentar: () => void;
  valor: string | null;
  valorRotulo?: string | null;
  valorIcone?: ReactNode;
  onChange: (chave: string) => void;
}) {
  const t = useT();
  const [aberto, setAberto] = useState(false);
  const [q, setQ] = useState("");
  const raiz = useRef<HTMLDivElement>(null);
  const fechar = () => {
    setAberto(false);
    setQ("");
  };
  // Lista inline (não flutuante): a página cresce e rola normalmente com ela aberta.
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) fechar();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);
  const idRotulo = useId();
  const resultados = aberto ? buscar(opcoes, q, LIMITE) : [];

  return (
    <div ref={raiz}>
      <span id={idRotulo} className="mb-2 block text-base font-semibold text-muted-foreground">
        {t(rotulo)}
      </span>
      <button
        type="button"
        onClick={() => (aberto ? fechar() : setAberto(true))}
        role="combobox"
        aria-expanded={aberto}
        aria-labelledby={idRotulo}
        className="flex min-h-14 w-full text-base items-center justify-between gap-3 border border-border bg-metal px-5 text-left transition-colors hover:border-gold-dim"
      >
        <span
          className={`flex items-center gap-3 truncate ${valor ? "font-semibold" : "text-muted-foreground"}`}
        >
          {valor && valorIcone}
          <span className="truncate">{valor ? (valorRotulo ?? valor) : t(placeholder)}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
      {aberto && (
        <div className="mt-1 w-full border border-gold-dim bg-popover">
          {carregando ? (
            <div className="p-3">
              <Carregando rotulo="Carregando a lista…" linhas={4} />
            </div>
          ) : erro ? (
            <div className="p-3">
              <Erro titulo="A lista não carregou" texto="Tente de novo." onTentar={onTentar} />
            </div>
          ) : (
            <Command shouldFilter={false} className="rounded-none">
              <CommandInput
                value={q}
                onValueChange={setQ}
                placeholder={t("Pesquisar {x}…", { x: t(rotulo).toLowerCase() })}
                autoFocus
                className="h-16 text-xl"
              />
              <CommandList className="max-h-[32rem]">
                <CommandEmpty>{t("Nada encontrado. Confira a grafia do nome.")}</CommandEmpty>
                {resultados.map((o) => (
                  <CommandItem
                    key={o.chave}
                    value={o.chave}
                    onSelect={() => {
                      onChange(o.chave);
                      fechar();
                    }}
                    className="min-h-20 justify-between gap-4 rounded-none px-4 text-xl"
                  >
                    <span className="flex items-center gap-4">
                      {o.icone}
                      {o.rotulo}
                    </span>
                    {o.detalhe && (
                      <span className="text-base text-muted-foreground">{o.detalhe}</span>
                    )}
                  </CommandItem>
                ))}
                {resultados.length === LIMITE && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">
                    {t("Mostrando os {n} primeiros. Digite mais letras para refinar.", {
                      n: LIMITE,
                    })}
                  </p>
                )}
              </CommandList>
            </Command>
          )}
        </div>
      )}
    </div>
  );
}
