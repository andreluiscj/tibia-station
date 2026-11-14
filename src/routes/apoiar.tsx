import { createFileRoute } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { Cont } from "@/components/station/Layout";
import { PageIntro } from "@/components/station/PageIntro";

export const Route = createFileRoute("/apoiar")({
  head: () => ({
    meta: [
      { title: "Apoiar projeto | Tibia Station" },
      {
        name: "description",
        content:
          "O Tibia Station é um projeto iniciante, feito para uso próprio e aberto a quem quiser usar. Quem quiser apoiar pode doar Tibia Coins ao personagem Hammer Lore.",
      },
    ],
  }),
  component: Apoiar,
});

function Apoiar() {
  const t = useT();
  return (
    <>
      <PageIntro titulo="Apoiar projeto" eyebrow="APOIO" numeral="IV">
        Um projeto pequeno, feito por um jogador, que pode ajudar outros jogadores.
      </PageIntro>
      <Cont className="mt-8 grid gap-5">
        <section className="frame-inset min-w-0 p-5 sm:p-6">
          <h2 className="font-display text-xl font-bold text-gold sm:text-2xl">
            {t("Sobre o projeto")}
          </h2>
          <div className="mt-3 max-w-[70ch] space-y-3 leading-relaxed text-muted-foreground">
            <p>
              {t(
                "O Tibia Station é um projeto iniciante. Ele nasceu para uso próprio: eu queria calcular o dano das armas da Crypt, montar sets e consultar hunts sem abrir várias abas.",
              )}
            </p>
            <p>
              {t(
                "No caminho percebi que a ferramenta podia ajudar outras pessoas, então deixei o site aberto. Ele ainda está crescendo, e sugestões e correções são bem-vindas.",
              )}
            </p>
          </div>
        </section>

        <section className="frame p-5 sm:p-6" aria-labelledby="doar">
          <h2 id="doar" className="font-display text-xl font-bold text-gold sm:text-2xl">
            {t("Quer apoiar?")}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <img
              src="/sprites/items/tibia-coin.gif"
              alt="Tibia Coin"
              width={64}
              height={64}
              className="size-16 shrink-0 [image-rendering:pixelated]"
            />
            <p className="max-w-[60ch] leading-relaxed text-muted-foreground">
              {t("Quem quiser doar Tibia Coins será muito bem-vindo. Envie para o personagem")}{" "}
              <strong className="font-display text-xl text-gold">Hammer Lore</strong>.{" "}
              {t("Doar é totalmente opcional: o site continua livre para todos.")}
            </p>
          </div>
        </section>
      </Cont>
    </>
  );
}
