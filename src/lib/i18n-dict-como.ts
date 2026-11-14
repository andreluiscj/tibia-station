import { add } from "./i18n-core";

add(
  ["Como calculamos", "How we calculate", "Cómo calculamos"],
  ["O GRIMÓRIO", "THE GRIMOIRE", "EL GRIMORIO"],
  [
    "O que está por trás do número que aparece na Damage Calculator, em passos curtos.",
    "What is behind the number shown in the Damage Calculator, in short steps.",
    "Qué hay detrás del número que aparece en la Damage Calculator, en pasos cortos.",
  ],
  ["1. O que significa o número", "1. What the number means", "1. Qué significa el número"],
  [
    "2. Pierce da Crypt e imbuement",
    "2. Crypt pierce and imbuement",
    "2. Pierce de la Crypt e imbuimiento",
  ],
  [
    "3. Como a resistência é aplicada",
    "3. How resistance is applied",
    "3. Cómo se aplica la resistencia",
  ],
  ["4. Exemplo", "4. Example", "4. Ejemplo"],
  [
    "5. Como as armas são comparadas",
    "5. How weapons are compared",
    "5. Cómo se comparan las armas",
  ],
  ["6. De onde vêm os dados", "6. Where the data comes from", "6. De dónde vienen los datos"],
  [
    "O dano é relativo: **100 é o dano neutro** (a criatura não resiste nem é fraca). Acima de 100 a arma rende mais contra o alvo; abaixo de 100, menos. Em uma hunt, é a média do dano contra cada criatura (cada uma conta igual, ou pelo peso dela se você marcar essa opção).",
    "Damage is relative: **100 is neutral damage** (the creature neither resists nor is weak). Above 100 the weapon does more against the target; below 100, less. In a hunt, it is the average damage against each creature (each counts the same, or by its weight if you tick that option).",
    "El daño es relativo: **100 es el daño neutro** (la criatura ni resiste ni es débil). Por encima de 100 el arma rinde más contra el objetivo; por debajo de 100, menos. En una hunt, es el promedio del daño contra cada criatura (cada una cuenta igual, o por su peso si marcas esa opción).",
  ],
  [
    "Cada Crypt tem perks nos níveis de proficiência 3, 5 e 7 que dão **pierce**: um bônus que reduz a resistência da criatura. O pierce pode ser físico ou elemental. Testamos todas as combinações de perks e mostramos a melhor para o alvo.",
    "Each Crypt has perks at proficiency levels 3, 5 and 7 that give **pierce**: a bonus that reduces the creature's resistance. Pierce can be physical or elemental. We test every perk combination and show the best one for the target.",
    "Cada Crypt tiene perks en los niveles de competencia 3, 5 y 7 que dan **pierce**: un bono que reduce la resistencia de la criatura. El pierce puede ser físico o elemental. Probamos todas las combinaciones de perks y mostramos la mejor para el objetivo.",
  ],
  [
    "Se a combinação tem pierce elemental, a arma é **imbuída** com o dano do elemento dela (Fire no Club, Earth na Sword, Energy no Axe): metade do dano vira elemental e a outra metade continua Physical. Sem pierce elemental, o melhor é não imbuir. O Monk não imbui.",
    "If the combination has elemental pierce, the weapon is **imbued** with its element damage (Fire on Club, Earth on Sword, Energy on Axe): half of the damage becomes elemental and the other half stays Physical. Without elemental pierce, the best choice is not to imbue. The Monk does not imbue.",
    "Si la combinación tiene pierce elemental, el arma está **imbuida** con el daño de su elemento (Fire en Club, Earth en Sword, Energy en Axe): la mitad del daño pasa a ser elemental y la otra mitad sigue siendo Physical. Sin pierce elemental, lo mejor es no imbuir. El Monk no imbuye.",
  ],
  [
    "Usamos o formato da wiki: 100 é neutro, menos de 100 é resistência, mais de 100 é fraqueza e 0 ou negativo é imune ou absorve. Para cada elemento usado:",
    "We use the wiki format: 100 is neutral, below 100 is resistance, above 100 is weakness and 0 or negative is immune or absorbs. For each element used:",
    "Usamos el formato de la wiki: 100 es neutro, menos de 100 es resistencia, más de 100 es debilidad y 0 o negativo es inmune o absorbe. Para cada elemento usado:",
  ],
  [
    "Abaixo de 100, o pierce soma direto até chegar a 100.",
    "Below 100, pierce adds directly until it reaches 100.",
    "Por debajo de 100, el pierce suma directamente hasta llegar a 100.",
  ],
  [
    "O que sobra passa de 100 pela metade (arredondada para cima), e o resultado nunca passa do dobro da resistência original.",
    "What is left counts at half above 100 (rounded up), and the result never exceeds double the original resistance.",
    "Lo que sobra pasa de 100 a la mitad (redondeado hacia arriba), y el resultado nunca supera el doble de la resistencia original.",
  ],
  [
    "Com 0 de pierce a resistência não muda; imune ou absorvendo, também não.",
    "With 0 pierce the resistance does not change; neither does an immune or absorbing one.",
    "Con 0 de pierce la resistencia no cambia; inmune o absorbiendo, tampoco.",
  ],
  [
    "O dano final contra uma criatura é a média entre o físico e o elemento (50% cada) quando a arma está imbuída; sem imbuement, é só o físico.",
    "The final damage against a creature is the average of physical and element (50% each) when the weapon is imbued; without imbuement, it is physical only.",
    "El daño final contra una criatura es el promedio entre el físico y el elemento (50% cada uno) cuando el arma está imbuida; sin imbuimiento, es solo el físico.",
  ],
  [
    "Uma criatura com resistência física 90 e à Earth 70, e uma Crypt com pierce físico 14 e elemental 28 (valores só para ilustrar):",
    "A creature with physical resistance 90 and Earth 70, and a Crypt with physical pierce 14 and elemental 28 (values only to illustrate):",
    "Una criatura con resistencia física 90 y a Earth 70, y una Crypt con pierce físico 14 y elemental 28 (valores solo para ilustrar):",
  ],
  [
    "Físico: faltam 10 para 100; sobram 4, que contam pela metade (2). Resultado: ##102##.",
    "Physical: 10 short of 100; 4 left over, counting at half (2). Result: ##102##.",
    "Físico: faltan 10 para 100; sobran 4, que cuentan a la mitad (2). Resultado: ##102##.",
  ],
  [
    "Earth: 70 + 28 = ##98##, ainda abaixo de 100.",
    "Earth: 70 + 28 = ##98##, still below 100.",
    "Earth: 70 + 28 = ##98##, todavía por debajo de 100.",
  ],
  [
    "Imbuída: (102 + 98) ÷ 2 = ##100##.",
    "Imbued: (102 + 98) ÷ 2 = ##100##.",
    "Imbuida: (102 + 98) ÷ 2 = ##100##.",
  ],
  [
    "Para o seu nível (padrão **1000**), a Crypt é comparada com todas as armas do jogo da mesma vocação e categoria que o nível já libera (Knight: tabela de armas de corpo a corpo; Monk: tabela de armas de mão). Cada arma usa o ataque físico e os ataques elementares dela contra as mesmas resistências, na mesma escala da Crypt.",
    "For your level (default **1000**), the Crypt is compared with every game weapon of the same vocation and category that the level already unlocks (Knight: melee weapons table; Monk: hand weapons table). Each weapon uses its physical attack and elemental attacks against the same resistances, on the same scale as the Crypt.",
    "Para tu nivel (por defecto **1000**), la Crypt se compara con todas las armas del juego de la misma vocación y categoría que el nivel ya desbloquea (Knight: tabla de armas cuerpo a cuerpo; Monk: tabla de armas de mano). Cada arma usa su ataque físico y sus ataques elementales contra las mismas resistencias, en la misma escala que la Crypt.",
  ],
  [
    "Mostramos a **melhor opção** e as **3 seguintes**, da maior para a menor. Em “Comparar as 3”, isso vale para cada categoria (Club, Sword e Axe).",
    "We show the **best option** and the **next 3**, from highest to lowest. In “Compare all 3”, this applies to each category (Club, Sword and Axe).",
    "Mostramos la **mejor opción** y las **3 siguientes**, de mayor a menor. En “Comparar las 3”, esto vale para cada categoría (Club, Sword y Axe).",
  ],
  [
    "No cartão da melhor opção, a linha abaixo do nome mostra **elemento - Level - N Imbuiments**: o elemento da arma, o nível que ela exige e quantos espaços de imbuiment ela tem. Nas Crypt há também a **Combinação** (o pierce da melhor combinação) e o **Imbuiment Elemental** (um switch ligado ou desligado), que diz se vale imbuir a arma com o dano do elemento dela.",
    "On the best option card, the line below the name shows **element - Level - N Imbuements**: the weapon's element, the level it requires and how many imbuement slots it has. Crypt weapons also show the **Combination** (the pierce of the best combination) and the **Elemental Imbuement** (an on/off switch), which says whether it is worth imbuing the weapon with its element damage.",
    "En la tarjeta de la mejor opción, la línea bajo el nombre muestra **elemento - Level - N Imbuimientos**: el elemento del arma, el nivel que exige y cuántos espacios de imbuimiento tiene. En las Crypt también aparecen la **Combinación** (el pierce de la mejor combinación) y el **Imbuimiento Elemental** (un interruptor encendido o apagado), que indica si conviene imbuir el arma con el daño de su elemento.",
  ],
  [
    "Criaturas, hunts e as armas Crypt vêm da",
    "Creatures, hunts and the Crypt weapons come from",
    "Las criaturas, hunts y armas Crypt vienen de",
  ],
  [", sob a licença", ", under the license", ", bajo la licencia"],
  [
    ". As alterações feitas aqui também seguem essa licença. Resistências que a wiki não informa são tratadas como neutras (100). Pode haver diferenças em relação ao jogo se a wiki estiver desatualizada.",
    ". Changes made here follow the same license. Resistances the wiki does not provide are treated as neutral (100). There may be differences from the game if the wiki is out of date.",
    ". Las modificaciones hechas aquí también siguen esa licencia. Las resistencias que la wiki no informa se tratan como neutras (100). Puede haber diferencias con el juego si la wiki está desactualizada.",
  ],
  [
    "As outras armas da comparação vêm das tabelas do projeto: armas de corpo a corpo (Knight) e armas de mão (Monk). Nas armas de mão, o tipo de dano da tabela (Fire, Energy, Ice, Earth, Death ou Physical) define em qual resistência o ataque conta.",
    "The other weapons in the comparison come from the project tables: melee weapons (Knight) and hand weapons (Monk). For hand weapons, the damage type in the table (Fire, Energy, Ice, Earth, Death or Physical) defines which resistance the attack counts against.",
    "Las otras armas de la comparación vienen de las tablas del proyecto: armas cuerpo a cuerpo (Knight) y armas de mano (Monk). En las armas de mano, el tipo de daño de la tabla (Fire, Energy, Ice, Earth, Death o Physical) define en qué resistencia cuenta el ataque.",
  ],
  [
    "Tibia é marca registrada da CipSoft GmbH. O Tibia Station é um projeto de fãs, não afiliado à CipSoft nem por ela endossado.",
    "Tibia is a registered trademark of CipSoft GmbH. Tibia Station is a fan project, not affiliated with or endorsed by CipSoft.",
    "Tibia es una marca registrada de CipSoft GmbH. Tibia Station es un proyecto de fans, no afiliado a CipSoft ni respaldado por ella.",
  ],
  ["Ir para a Damage Calculator", "Go to the Damage Calculator", "Ir a la Damage Calculator"],
);
