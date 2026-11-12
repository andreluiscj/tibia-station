import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
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
  return (
    <section className="frame-inset min-w-0 p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold text-gold sm:text-2xl">{titulo}</h2>
      <div className="mt-3 max-w-[70ch] space-y-3 leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function ComoCalculamos() {
  return (
    <>
      <PageIntro titulo="Como calculamos" eyebrow="O GRIMÓRIO" numeral="III">
        O que está por trás do número que aparece na Crypt Calculator, em passos curtos.
      </PageIntro>
      <Cont className="mt-8 grid gap-5">
        <Secao titulo="1. O que significa o número">
          <p>
            O dano é relativo: <strong className="text-foreground">100 é o dano neutro</strong> (a
            criatura não resiste nem é fraca). Acima de 100 a arma rende mais contra o alvo; abaixo
            de 100, menos. Em uma hunt, é a média do dano contra cada criatura (cada uma conta
            igual, ou pelo peso dela se você marcar essa opção).
          </p>
        </Secao>

        <Secao titulo="2. Pierce da Crypt e imbuement">
          <p>
            Cada Crypt tem perks nos níveis de proficiência 3, 5 e 7 que dão{" "}
            <strong className="text-foreground">pierce</strong>: um bônus que reduz a resistência da
            criatura. O pierce pode ser físico ou elemental. Testamos todas as combinações de perks
            e mostramos a melhor para o alvo.
          </p>
          <p>
            Se a combinação tem pierce elemental, a arma é{" "}
            <strong className="text-foreground">imbuída</strong> com o dano do elemento dela (Fire
            no Club, Earth na Sword, Energy no Axe): metade do dano vira elemental e a outra metade
            continua Physical. Sem pierce elemental, o melhor é não imbuir. O Monk não imbui.
          </p>
        </Secao>

        <Secao titulo="3. Como a resistência é aplicada">
          <p>
            Usamos o formato da wiki: 100 é neutro, menos de 100 é resistência, mais de 100 é
            fraqueza e 0 ou negativo é imune ou absorve. Para cada elemento usado:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Abaixo de 100, o pierce soma direto até chegar a 100.</li>
            <li>
              O que sobra passa de 100 pela metade (arredondada para cima), e o resultado nunca
              passa do dobro da resistência original.
            </li>
            <li>Com 0 de pierce a resistência não muda; imune ou absorvendo, também não.</li>
          </ul>
          <p>
            O dano final contra uma criatura é a média entre o físico e o elemento (50% cada) quando
            a arma está imbuída; sem imbuement, é só o físico.
          </p>
        </Secao>

        <Secao titulo="4. Exemplo">
          <p>
            Uma criatura com resistência física 90 e à Earth 70, e uma Crypt com pierce físico 14 e
            elemental 28 (valores só para ilustrar):
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Físico: faltam 10 para 100; sobram 4, que contam pela metade (2). Resultado:{" "}
              <span className="num text-foreground">102</span>.
            </li>
            <li>
              Earth: 70 + 28 = <span className="num text-foreground">98</span>, ainda abaixo de 100.
            </li>
            <li>
              Imbuída: (102 + 98) ÷ 2 = <span className="num text-foreground">100</span>.
            </li>
          </ul>
        </Secao>

        <Secao titulo="5. Como as armas são comparadas">
          <p>
            Para o seu nível (padrão <strong className="text-foreground">1000</strong>), a Crypt é
            comparada com todas as armas do jogo da mesma vocação e categoria que o nível já libera
            (Knight: tabela de armas de corpo a corpo; Monk: tabela de armas de mão). Cada arma usa
            o ataque físico e os ataques elementares dela contra as mesmas resistências, na mesma
            escala da Crypt.
          </p>
          <p>
            Mostramos a <strong className="text-foreground">melhor opção</strong> e as{" "}
            <strong className="text-foreground">3 seguintes</strong>, da maior para a menor. Em
            “Comparar as 3”, isso vale para cada categoria (Club, Sword e Axe).
          </p>
          <p>
            No cartão da melhor opção, a linha abaixo do nome mostra{" "}
            <strong className="text-foreground">elemento - Level - N Imbuiments</strong>: o elemento
            da arma, o nível que ela exige e quantos espaços de imbuiment ela tem. Nas Crypt há
            também a <strong className="text-foreground">Combinação</strong> (o pierce da melhor
            combinação) e o <strong className="text-foreground">Imbuiment Elemental</strong> (Sim ou
            Não), que diz se vale imbuir a arma com o dano do elemento dela.
          </p>
        </Secao>

        <Secao titulo="6. De onde vêm os dados">
          <p>
            Criaturas, hunts e as armas Crypt vêm da{" "}
            <a
              href="https://tibia.fandom.com"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              TibiaWiki
            </a>
            , sob a licença{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/3.0/deed.pt_BR"
              target="_blank"
              rel="noopener noreferrer"
              className={link}
            >
              CC BY-SA
            </a>
            . As alterações feitas aqui também seguem essa licença. Resistências que a wiki não
            informa são tratadas como neutras (100). Pode haver diferenças em relação ao jogo se a
            wiki estiver desatualizada.
          </p>
          <p>
            As outras armas da comparação vêm das tabelas do projeto: armas de corpo a corpo
            (Knight) e armas de mão (Monk). Nas armas de mão, o tipo de dano da tabela (Fire,
            Energy, Ice, Earth, Death ou Physical) define em qual resistência o ataque conta.
          </p>
          <p>
            Tibia é marca registrada da CipSoft GmbH. O Tibia Station é um projeto de fãs, não
            afiliado à CipSoft nem por ela endossado.
          </p>
          <p>
            <Link to="/crypt" className={link}>
              Ir para a Crypt Calculator
            </Link>
          </p>
        </Secao>
      </Cont>
    </>
  );
}
