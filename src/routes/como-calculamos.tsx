import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { Cont } from "@/components/station/Layout";
import { PageIntro } from "@/components/station/PageIntro";

export const Route = createFileRoute("/como-calculamos")({
  head: () => ({
    meta: [
      { title: "Como calculamos | Tibia Station" },
      {
        name: "description",
        content:
          "Como o Tibia Station calcula o dano das armas da Crypt: pierce, imbuement, resistências e a comparação com as outras armas.",
      },
    ],
  }),
  component: ComoCalculamos,
});

const link = "text-gold underline underline-offset-4 hover:text-foreground";

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  const t = useT();
  return (
    <section className="frame-inset min-w-0 p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold text-gold sm:text-2xl">{t(titulo)}</h2>
      <div className="mt-3 max-w-[70ch] space-y-3 leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

/** Texto traduzível com **negrito** e ##número## no meio da frase. */
function Md({ children }: { children: string }) {
  const t = useT();
  return (
    <>
      {t(children)
        .split(/(\*\*[^*]+\*\*|##[^#]+##)/)
        .map((p, i) =>
          p.startsWith("**") ? (
            <strong key={i} className="text-foreground">
              {p.slice(2, -2)}
            </strong>
          ) : p.startsWith("##") ? (
            <span key={i} className="num text-foreground">
              {p.slice(2, -2)}
            </span>
          ) : (
            p
          ),
        )}
    </>
  );
}

function ComoCalculamos() {
  const t = useT();
  return (
    <>
      <PageIntro titulo="Como calculamos" eyebrow="O GRIMÓRIO" numeral="III">
        O que está por trás do número que aparece na Damage Calculator, em passos curtos.
      </PageIntro>
      <Cont className="mt-8 grid gap-5">
        <Secao titulo="1. O que significa o número">
          <p>
            <Md>
              O dano é relativo: **100 é o dano neutro** (a criatura não resiste nem é fraca). Acima
              de 100 a arma rende mais contra o alvo; abaixo de 100, menos. Em uma hunt, é a média
              do dano contra cada criatura (cada uma conta igual, ou pelo peso dela se você marcar
              essa opção).
            </Md>
          </p>
        </Secao>

        <Secao titulo="2. Pierce da Crypt e imbuement">
          <p>
            <Md>
              Cada Crypt tem perks nos níveis de proficiência 3, 5 e 7 que dão **pierce**: um bônus
              que reduz a resistência da criatura. O pierce pode ser físico ou elemental. Testamos
              todas as combinações de perks e mostramos a melhor para o alvo.
            </Md>
          </p>
          <p>
            <Md>
              Se a combinação tem pierce elemental, a arma é **imbuída** com o dano do elemento dela
              (Fire no Club, Earth na Sword, Energy no Axe): metade do dano vira elemental e a outra
              metade continua Physical. Sem pierce elemental, o melhor é não imbuir. O Monk não
              imbui.
            </Md>
          </p>
        </Secao>

        <Secao titulo="3. Como a resistência é aplicada">
          <p>
            {t(
              "Usamos o formato da wiki: 100 é neutro, menos de 100 é resistência, mais de 100 é fraqueza e 0 ou negativo é imune ou absorve. Para cada elemento usado:",
            )}
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>{t("Abaixo de 100, o pierce soma direto até chegar a 100.")}</li>
            <li>
              {t(
                "O que sobra passa de 100 pela metade (arredondada para cima), e o resultado nunca passa do dobro da resistência original.",
              )}
            </li>
            <li>{t("Com 0 de pierce a resistência não muda; imune ou absorvendo, também não.")}</li>
          </ul>
          <p>
            {t(
              "O dano final contra uma criatura é a média entre o físico e o elemento (50% cada) quando a arma está imbuída; sem imbuement, é só o físico.",
            )}
          </p>
        </Secao>

        <Secao titulo="4. Exemplo">
          <p>
            {t(
              "Uma criatura com resistência física 90 e à Earth 70, e uma Crypt com pierce físico 14 e elemental 28 (valores só para ilustrar):",
            )}
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Md>
                Físico: faltam 10 para 100; sobram 4, que contam pela metade (2). Resultado:
                ##102##.
              </Md>
            </li>
            <li>
              <Md>Earth: 70 + 28 = ##98##, ainda abaixo de 100.</Md>
            </li>
            <li>
              <Md>Imbuída: (102 + 98) ÷ 2 = ##100##.</Md>
            </li>
          </ul>
        </Secao>

        <Secao titulo="5. Como as armas são comparadas">
          <p>
            <Md>
              Para o seu nível (padrão **1000**), a Crypt é comparada com todas as armas do jogo da
              mesma vocação e categoria que o nível já libera (Knight: tabela de armas de corpo a
              corpo; Monk: tabela de armas de mão). Cada arma usa o ataque físico e os ataques
              elementares dela contra as mesmas resistências, na mesma escala da Crypt.
            </Md>
          </p>
          <p>
            <Md>
              Mostramos a **melhor opção** e as **3 seguintes**, da maior para a menor. Em “Comparar
              as 3”, isso vale para cada categoria (Club, Sword e Axe).
            </Md>
          </p>
          <p>
            <Md>
              No cartão da melhor opção, a linha abaixo do nome mostra **elemento - Level - N
              Imbuiments**: o elemento da arma, o nível que ela exige e quantos espaços de imbuiment
              ela tem. Nas Crypt há também a **Combinação** (o pierce da melhor combinação) e o
              **Imbuiment Elemental** (um switch ligado ou desligado), que diz se vale imbuir a arma
              com o dano do elemento dela.
            </Md>
          </p>
        </Secao>

        <Secao titulo="6. De onde vêm os dados">
          <p>
            {t("Criaturas, hunts e as armas Crypt vêm da")}{" "}
            <a
              href="https://tibia.fandom.com"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              TibiaWiki
            </a>
            {t(", sob a licença")}{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/3.0/deed.pt_BR"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              CC BY-SA
            </a>
            {t(
              ". As alterações feitas aqui também seguem essa licença. Resistências que a wiki não informa são tratadas como neutras (100). Pode haver diferenças em relação ao jogo se a wiki estiver desatualizada.",
            )}
          </p>
          <p>
            {t(
              "As outras armas da comparação vêm das tabelas do projeto: armas de corpo a corpo (Knight) e armas de mão (Monk). Nas armas de mão, o tipo de dano da tabela (Fire, Energy, Ice, Earth, Death ou Physical) define em qual resistência o ataque conta.",
            )}
          </p>
          <p>
            {t(
              "Tibia é marca registrada da CipSoft GmbH. O Tibia Station é um projeto de fãs, não afiliado à CipSoft nem por ela endossado.",
            )}
          </p>
          <p>
            <Link to="/damage-calculator" className={link}>
              {t("Ir para a Damage Calculator")}
            </Link>
          </p>
        </Secao>
      </Cont>
    </>
  );
}
