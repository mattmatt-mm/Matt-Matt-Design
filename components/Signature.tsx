import { useId } from "react";

export const signatureImages = {
  main: "/signature-main.png",
  left: "/signature-mark-left.png",
  right: "/signature-mark-right.png",
} as const;

/**
 * The exported artwork is made from filled outlines, so each shape is revealed
 * through a centerline mask to preserve the pencil texture while still reading
 * as handwriting. The main mark writes from the lower-left; the two finishing
 * strokes each write from top to bottom.
 */
export function Signature({ className = "", onFinish }: { className?: string; onFinish?: () => void }) {
  const id = useId();
  const main = `${id}-main`;
  const left = `${id}-left`;
  const right = `${id}-right`;

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
          id={main}
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
          id={left}
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
          id={right}
          x="0"
          y="0"
          width="734"
          height="219"
          maskUnits="userSpaceOnUse"
        >
          <path
            className="signature-trace signature-trace--right-mark"
            onAnimationEnd={onFinish}
            d="M 691 0 C 690 20 687 47 683 74"
            pathLength="1"
          />
        </mask>
      </defs>

      <image
        href={signatureImages.main}
        width="734"
        height="219"
        preserveAspectRatio="none"
        mask={`url(#${main})`}
      />
      <image
        href={signatureImages.left}
        width="734"
        height="219"
        preserveAspectRatio="none"
        mask={`url(#${left})`}
      />
      <image
        href={signatureImages.right}
        width="734"
        height="219"
        preserveAspectRatio="none"
        mask={`url(#${right})`}
      />
    </svg>
  );
}
