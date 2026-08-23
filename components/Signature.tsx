/**
 * The exported artwork is made from filled outlines, so each shape is revealed
 * through a centerline mask to preserve the pencil texture while still reading
 * as handwriting. The main mark writes from the lower-left; the two finishing
 * strokes each write from top to bottom.
 */
export function Signature({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`signature ${className}`}
      focusable="false"
      viewBox="0 0 734 219"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask
          id="signature-main-reveal"
          x="0"
          y="0"
          width="734"
          height="219"
          maskUnits="userSpaceOnUse"
        >
          <path
            className="signature-trace signature-trace--main"
            d="M 2 217 C 55 207 126 164 193 138 C 218 128 239 121 252 123 C 258 124 252 134 241 143 L 210 168 C 204 174 216 171 231 164 C 303 130 383 87 451 58 C 511 32 565 23 592 32 C 612 39 608 53 594 68 C 568 95 517 121 464 139 C 427 151 394 156 382 152 C 372 148 380 139 394 131 C 445 102 512 80 578 57 C 635 38 686 28 733 27"
            pathLength="1"
          />
        </mask>

        <mask
          id="signature-left-mark-reveal"
          x="0"
          y="0"
          width="734"
          height="219"
          maskUnits="userSpaceOnUse"
        >
          <path
            className="signature-trace signature-trace--left-mark"
            d="M 645 13 C 645 29 647 48 649 66"
            pathLength="1"
          />
        </mask>

        <mask
          id="signature-right-mark-reveal"
          x="0"
          y="0"
          width="734"
          height="219"
          maskUnits="userSpaceOnUse"
        >
          <path
            className="signature-trace signature-trace--right-mark"
            d="M 691 0 C 690 20 687 47 683 74"
            pathLength="1"
          />
        </mask>
      </defs>

      <image
        href="/signature-main.png"
        width="734"
        height="219"
        preserveAspectRatio="none"
        mask="url(#signature-main-reveal)"
      />
      <image
        href="/signature-mark-left.png"
        width="734"
        height="219"
        preserveAspectRatio="none"
        mask="url(#signature-left-mark-reveal)"
      />
      <image
        href="/signature-mark-right.png"
        width="734"
        height="219"
        preserveAspectRatio="none"
        mask="url(#signature-right-mark-reveal)"
      />
    </svg>
  );
}
