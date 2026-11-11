import { ELEMENTOS, ELEMENTOS_PRINCIPAIS } from "./elementos";

/** Legenda das cores fixas de elemento, as mesmas em todo o app. */
export function ElementLegend() {
  return (
    <div className="frame-inset p-5">
      <p className="text-sm leading-snug text-muted-foreground">
        Cada elemento tem a mesma cor em todo o site.
      </p>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5 md:flex-col">
        {ELEMENTOS_PRINCIPAIS.map((e) => (
          <li key={e} className="flex items-center gap-3">
            <span aria-hidden="true" className={`size-3 rotate-45 ${ELEMENTOS[e].bar}`} />
            <span>{ELEMENTOS[e].label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
