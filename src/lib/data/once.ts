/**
 * Cache de uma carga assíncrona: o sucesso fica guardado, chamadas simultâneas dividem a mesma carga em
 * andamento, e uma FALHA não é guardada (a próxima chamada tenta de novo; é o que faz o "Tentar de novo" da UI funcionar).
 */
export const once = <T>(load: () => Promise<T>): (() => Promise<T>) => {
  let pending: Promise<T> | undefined;
  return () => {
    if (!pending) {
      const p = load();
      pending = p;
      p.catch(() => {
        if (pending === p) pending = undefined;
      });
    }
    return pending;
  };
};
