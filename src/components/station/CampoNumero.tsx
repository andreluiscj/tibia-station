import { useEffect, useId, useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * Campo numérico ligado à URL: guarda o texto digitado, aceita vazio durante a digitação e só envia
 * um inteiro válido. Se o valor mudar por fora (link, voltar), o campo acompanha.
 */
export function CampoNumero({
  rotulo,
  valor,
  min,
  max,
  onValor,
  ajuda,
  className = "w-full",
}: {
  rotulo: string;
  valor: number;
  min: number;
  max: number;
  onValor: (n: number) => void;
  ajuda?: string;
  className?: string;
}) {
  const id = useId();
  const [txt, setTxt] = useState(String(valor));
  useEffect(() => {
    setTxt((t) => (t !== "" && Number(t) === valor ? t : String(valor)));
  }, [valor]);
  const valido = (t: string) => /^\d+$/.test(t) && Number(t) >= min && Number(t) <= max;
  const invalido = txt !== "" && !valido(txt);

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm text-muted-foreground">
        {rotulo}
      </label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={txt}
        onChange={(e) => {
          setTxt(e.target.value);
          if (valido(e.target.value)) onValor(Number(e.target.value));
        }}
        onBlur={() => setTxt(String(valor))}
        aria-invalid={invalido}
        aria-describedby={invalido ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined}
        className="h-11 rounded-none bg-background text-base"
      />
      {invalido ? (
        <p id={`${id}-erro`} className="mt-1.5 text-sm text-bad">
          Use um valor de {min} a {max}.
        </p>
      ) : (
        ajuda && (
          <p id={`${id}-ajuda`} className="mt-1.5 text-sm text-muted-foreground">
            {ajuda}
          </p>
        )
      )}
    </div>
  );
}
