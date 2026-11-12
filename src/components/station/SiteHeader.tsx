import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { APOIO_URL } from "./SiteFooter";
import { NAV } from "./nav";

const linkBase =
  "relative inline-flex min-h-11 items-center px-3 font-display text-[0.95rem] font-semibold tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground data-[status=active]:text-gold";

function Brand() {
  return (
    <Link
      to="/"
      className="inline-flex shrink-0 items-center rounded-sm"
      aria-label="Tibia Station, ir para o início"
    >
      <img
        src="/brand/logo-horizontal.svg"
        alt=""
        width={190}
        height={64}
        className="h-10 w-auto sm:h-11"
      />
    </Link>
  );
}

export function SiteHeader() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#241810] surface-dark">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-0.5 lg:gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className={`${linkBase} data-[status=active]:after:absolute data-[status=active]:after:inset-x-3 data-[status=active]:after:bottom-1 data-[status=active]:after:h-0.5 data-[status=active]:after:bg-accent`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={APOIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-10 items-center border border-gold-dim px-4 text-sm font-semibold text-gold transition-colors hover:border-gold hover:bg-gold/10 sm:inline-flex"
          >
            Apoiar projeto ↗
          </a>
          <Sheet open={aberto} onOpenChange={setAberto}>
            <SheetTrigger
              className="inline-flex size-11 items-center justify-center rounded-sm border border-border bg-transparent text-foreground transition-colors hover:border-gold-dim md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-l border-[#241810] surface-dark p-0">
              <SheetTitle className="border-b border-border px-5 py-4 font-display text-gold">
                Menu
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navegação principal do Tibia Station
              </SheetDescription>
              <nav aria-label="Principal (mobile)" className="p-2">
                <ul>
                  {NAV.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        activeOptions={{ exact: item.to === "/" }}
                        onClick={() => setAberto(false)}
                        className="flex min-h-12 items-center border-l-2 border-transparent px-4 font-display text-base font-semibold text-muted-foreground transition-colors hover:text-foreground data-[status=active]:border-gold data-[status=active]:text-gold"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
