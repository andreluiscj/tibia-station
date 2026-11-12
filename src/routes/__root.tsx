import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { MotionConfig } from "motion/react";
import { useState, type ReactNode } from "react";

import { btnPrimario, btnSecundario } from "@/components/station/estilos";
import { SiteFooter } from "@/components/station/SiteFooter";
import { SiteHeader } from "@/components/station/SiteHeader";
import appCss from "../styles.css?url";

const DESCRICAO =
  "Ferramentas para jogadores de Tibia: monte sets, compare as armas da Crypt, escolha hunts e calcule dano. Dados da TibiaWiki.";
const FONTES =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=JetBrains+Mono:wght@500&family=Source+Sans+3:wght@400;600;700&display=swap";

function NotFoundComponent() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-start justify-center px-4 py-16 sm:px-6">
      <p className="num text-6xl text-gold">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-gold">Caminho não encontrado</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        A página que você procura não existe ou foi movida. Volte ao início e escolha uma
        ferramenta.
      </p>
      <div className="mt-6">
        <Link to="/" className={btnPrimario}>
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-start justify-center px-4 py-16 sm:px-6"
    >
      <h1 className="font-display text-3xl font-bold text-gold">Esta página não carregou</h1>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        Algo deu errado do nosso lado. Tente carregar de novo ou volte ao início.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className={btnPrimario}
        >
          Tentar de novo
        </button>
        <a href="/" className={btnSecundario}>
          Voltar ao início
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tibia Station: ferramentas para jogadores de Tibia" },
      { name: "description", content: DESCRICAO },
      { name: "theme-color", content: "#3b2a1d" },
      { property: "og:site_name", content: "Tibia Station" },
      { property: "og:title", content: "Tibia Station" },
      { property: "og:description", content: DESCRICAO },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:image", content: "/brand/og.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Tibia Station" },
      { name: "twitter:description", content: DESCRICAO },
      { name: "twitter:image", content: "/brand/og.png" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/brand/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { rel: "apple-touch-icon", href: "/brand/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: FONTES },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <div className="flex min-h-screen flex-col">
          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-3 focus:font-semibold focus:text-accent-foreground"
          >
            Ir para o conteúdo
          </a>
          <SiteHeader />
          <main id="conteudo" className="flex-1">
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </MotionConfig>
    </QueryClientProvider>
  );
}
