/** Id do botão de busca do cabeçalho: destino do foco quando não há outro lugar de onde a busca foi aberta. */
export const ID_BOTAO_BUSCA = "busca-abrir";

type Elemento = { isConnected: boolean; focus: () => void; tagName: string };
type Documento = { getElementById: (id: string) => Elemento | null };

/** Quem recebe o foco quando a busca fecha: o elemento que tinha foco ao abrir; senão, o botão do cabeçalho. */
export function alvoDoFoco(anterior: Elemento | null, doc: Documento): Elemento | null {
  const util = anterior && anterior.isConnected && anterior.tagName !== "BODY";
  return util ? anterior : doc.getElementById(ID_BOTAO_BUSCA);
}
