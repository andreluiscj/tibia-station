import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { btnPrimario, btnSecundario } from "./estilos";

const LARGURAS = ["w-3/4", "w-full", "w-5/6", "w-2/3", "w-full", "w-1/2"];

/** Carregando: esqueleto com texto para leitor de tela. */
export function Carregando({
  rotulo = "Carregando…",
  linhas = 5,
}: {
  rotulo?: string;
  linhas?: number;
}) {
  return (
    <div role="status" className="frame-inset space-y-3 p-5">
      <span className="sr-only">{rotulo}</span>
      {Array.from({ length: linhas }, (_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`skeleton h-5 ${LARGURAS[i % LARGURAS.length]}`}
        />
      ))}
    </div>
  );
}

export function Erro({
  titulo = "Não foi possível carregar os dados",
  texto = "Algo falhou ao ler os dados. Tente de novo; se continuar, recarregue a página.",
  onTentar,
}: {
  titulo?: string;
  texto?: string;
  onTentar?: () => void;
}) {
  return (
    <div role="alert" className="frame-inset border-bad p-6">
      <h2 className="font-display text-xl font-bold text-bad">{titulo}</h2>
      <p className="mt-2 max-w-[60ch] leading-relaxed text-muted-foreground">{texto}</p>
      {onTentar && (
        <button type="button" onClick={onTentar} className={`${btnPrimario} mt-4`}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}

export function Vazio({
  titulo,
  texto,
  children,
}: {
  titulo: string;
  texto: string;
  children?: ReactNode;
}) {
  return (
    <div className="frame-inset p-6">
      <h2 className="font-display text-xl font-bold">{titulo}</h2>
      <p className="mt-2 max-w-[60ch] leading-relaxed text-muted-foreground">{texto}</p>
      {children && <div className="mt-4 flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

/** Slug inexistente: página 404 própria, em português, com caminho de volta. */
export function NaoEncontrado({
  titulo,
  texto,
  voltarPara,
  voltarRotulo,
}: {
  titulo: string;
  texto: string;
  voltarPara: "/hunts" | "/";
  voltarRotulo: string;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-start justify-center px-4 py-16 sm:px-6">
      <p className="num text-6xl text-gold-dim">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-gold">{titulo}</h1>
      <p className="mt-3 max-w-[60ch] leading-relaxed text-muted-foreground">{texto}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={voltarPara} className={btnPrimario}>
          {voltarRotulo}
        </Link>
        {voltarPara !== "/" && (
          <Link to="/" className={btnSecundario}>
            Voltar ao início
          </Link>
        )}
      </div>
    </div>
  );
}
