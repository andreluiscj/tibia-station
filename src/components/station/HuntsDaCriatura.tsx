import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/lib/i18n";
import { Carregando, Erro, Vazio } from "./Estados";
import { huntsDaCriatura, nivelDaHunt } from "./huntsFiltro";
import { useHunts } from "./useDados";

/** Link em texto + modal centralizado com as hunts que contêm a criatura (dados já usados pela calculadora). */
export function HuntsDaCriatura({ slug, nome }: { slug: string; nome: string }) {
  const t = useT();
  const [aberto, setAberto] = useState(false);
  const q = useHunts();
  const lista = huntsDaCriatura(q.data ?? [], slug);
  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-3 block text-left font-bold text-primary underline underline-offset-4 transition-colors hover:text-accent"
      >
        {t("Visualizar hunts da criatura")}
      </button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="break-words">{t("Hunts com {nome}", { nome })}</DialogTitle>
            <DialogDescription>{t("Hunts da wiki que incluem esta criatura.")}</DialogDescription>
          </DialogHeader>
          {q.isError ? (
            <Erro onTentar={() => void q.refetch()} />
          ) : q.isPending ? (
            <Carregando rotulo="Carregando hunts…" linhas={4} />
          ) : lista.length === 0 ? (
            <Vazio
              titulo="Nenhuma hunt"
              texto="Esta criatura não aparece em nenhuma hunt cadastrada."
            />
          ) : (
            <ul className="space-y-2">
              {lista.map((h) => {
                const nivel = nivelDaHunt(h, "todas");
                return (
                  <li key={h.slug}>
                    <Link
                      to="/hunts/$slug"
                      params={{ slug: h.slug }}
                      className="frame-inset flex min-h-11 min-w-0 items-center justify-between gap-3 px-3 py-2 hover:border-gold-dim"
                    >
                      <span className="min-w-0 break-words font-semibold">{h.name}</span>
                      <span className="num shrink-0 text-sm text-muted-foreground">
                        {nivel ? t("Nível {n}", { n: nivel }) : t("Sem nível")}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
