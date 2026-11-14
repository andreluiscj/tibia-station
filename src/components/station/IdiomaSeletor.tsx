import { IDIOMAS, useLang, type Lang } from "@/lib/i18n";

const NOME: Record<Lang, string> = {
  pt: "Português (Brasil)",
  en: "English (United States)",
  es: "Español (España)",
};

/** Bandeiras em SVG (emoji de bandeira não aparece no Windows). */
function Bandeira({ lang }: { lang: Lang }) {
  return (
    <svg viewBox="0 0 30 20" aria-hidden="true" className="h-4 w-6">
      {lang === "pt" && (
        <>
          <rect width="30" height="20" fill="#009c3b" />
          <path d="M15 2 28 10 15 18 2 10Z" fill="#ffdf00" />
          <circle cx="15" cy="10" r="4" fill="#002776" />
        </>
      )}
      {lang === "en" && (
        <>
          <rect width="30" height="20" fill="#fff" />
          {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13} fill="#b22234" />
          ))}
          <rect width="13" height="10.8" fill="#3c3b6e" />
        </>
      )}
      {lang === "es" && (
        <>
          <rect width="30" height="20" fill="#aa151b" />
          <rect y="5" width="30" height="10" fill="#f1bf00" />
        </>
      )}
    </svg>
  );
}

/** Troca o idioma do site: Brasil, Estados Unidos ou Espanha. */
export function IdiomaSeletor() {
  const { lang, setLang } = useLang();
  return (
    <div role="group" aria-label="Idioma / Language / Idioma" className="flex items-center gap-1">
      {IDIOMAS.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          aria-label={NOME[l]}
          title={NOME[l]}
          onClick={() => setLang(l)}
          className={`relative z-10 inline-flex size-10 cursor-pointer items-center justify-center border transition-colors ${
            lang === l
              ? "border-gold bg-gold/15"
              : "border-transparent opacity-70 hover:opacity-100"
          }`}
        >
          <Bandeira lang={l} />
        </button>
      ))}
    </div>
  );
}
