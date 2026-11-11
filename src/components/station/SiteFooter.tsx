export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gold-dim/60 bg-stone">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:grid-cols-2 md:gap-10">
        <p className="max-w-prose leading-relaxed">
          Dados de criaturas, hunts e armas vindos da{" "}
          <a
            href="https://tibia.fandom.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline underline-offset-4 hover:text-foreground"
          >
            TibiaWiki
          </a>
          , sob a licença{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/deed.pt_BR"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline underline-offset-4 hover:text-foreground"
          >
            CC BY-SA
          </a>
          . As alterações feitas aqui também seguem essa licença.
        </p>
        <p className="max-w-prose leading-relaxed">
          Tibia é marca registrada da CipSoft GmbH. O Tibia Station é um projeto de fãs, não
          afiliado à CipSoft nem por ela endossado.
        </p>
      </div>
    </footer>
  );
}
