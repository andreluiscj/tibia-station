import { Link } from "@tanstack/react-router";
import { NAV } from "./nav";

export const APOIO_URL = "https://www.tibia.com/";

/** Rodapé: links rápidos, aviso de fã-site e ano. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[#241810] surface-dark">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-bold text-gold">TIBIA STATION</p>
          <p className="mt-2 text-muted-foreground">Feito por quem também vive o jogo.</p>
        </div>
        <nav aria-label="Rodapé">
          <p className="micro mb-3 text-gold">Navegação</p>
          <ul className="space-y-1">
            {NAV.map((i) => (
              <li key={i.to}>
                <Link
                  to={i.to}
                  className="inline-flex min-h-9 items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="micro mb-3 text-gold">Aviso</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Projeto independente de fãs. Tibia é uma marca da CipSoft GmbH, que não tem relação com
            este site. Dados da TibiaWiki.
          </p>
        </div>
      </div>
      <p className="border-t border-border px-4 py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Tibia Station
      </p>
    </footer>
  );
}
