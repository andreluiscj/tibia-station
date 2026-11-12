/** Ilustração do hero: fortaleza em tons sépia, desenhada em SVG (sem arquivo externo). */
export function HeroCastle() {
  return (
    <svg
      viewBox="0 0 480 320"
      role="img"
      aria-label="Ilustração de uma fortaleza medieval sobre uma colina"
      className="h-auto w-full"
    >
      <rect width="480" height="320" fill="#e5d8bb" />
      <g fill="none" stroke="#8f7a52" strokeWidth="1.5">
        <path d="M0 250 Q120 200 240 235 T480 215" />
        <path d="M0 280 Q140 240 260 268 T480 255" />
      </g>
      <path d="M0 320V262Q100 215 200 240T360 222Q430 215 480 240V320Z" fill="#c4b087" />
      <g fill="#3b2a1d">
        <path d="M150 250V150h30v-14h8v14h14v-14h8v14h14v-14h8v14h14V250Z" />
        <path d="M120 250V120h36v-18h8v18h10v-18h8v18h10v-18h8v18h10V250Z" opacity=".0" />
        <path d="M110 250V130h34v-16l17 -22 17 22v16h34V250Z" />
        <path d="M268 250V170h26v-12h8v12h8v-12h8v12h8v-12h8v12h14V250Z" />
        <path d="M120 120l1-30 1 30M222 108V80l6-4v-14l24 8-24 8v24" />
      </g>
      <path d="M250 250v-30a14 14 0 0 1 28 0v30Z" fill="#e2b254" />
      <g fill="#e2b254">
        <rect x="132" y="150" width="8" height="16" rx="4" />
        <rect x="160" y="170" width="8" height="16" rx="4" />
        <rect x="180" y="150" width="8" height="16" rx="4" />
      </g>
      <path d="M232 76l22 8-22 8Z" fill="#9c5322" />
      <g fill="#5b4430">
        <path d="M40 270l12-34 12 34Zm20-4l10-28 10 28Zm330 6l12-36 12 36Zm-18-2l9-24 9 24Z" />
      </g>
    </svg>
  );
}
