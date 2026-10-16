/**
 * The banner between two entries of a `DetailChain`: the next title holds
 * still while the reader pushes through a screen of scrolling, then lets the
 * entry in. Styles are `.chain-gate` in globals.css.
 */
export function ChainGate({ title, lang }: { title: string; lang?: string }) {
  return (
    <div className="chain-gate" data-chain-gate>
      <div className="chain-gate-head" data-chain-gate-head>
        <p className="text-muted">Next</p>
        <h2 className="text-title" lang={lang}>
          {title}
        </h2>
        <div className="chain-gate-track" aria-hidden>
          <div className="chain-gate-fill" />
        </div>
      </div>
      <div className="chain-gate-friction" data-chain-gate-friction />
    </div>
  );
}
