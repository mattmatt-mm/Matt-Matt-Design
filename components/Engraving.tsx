/**
 * An antique engraving used as ornament: <Engraving name="fiddler-crab" height={32} />.
 * The SVG in public/figures/ is a mask, so the ink is the surrounding text
 * colour — fg on the page, flipping with the theme. Rules for sourcing,
 * tracing and placing them are in doc/engraving-graphics.md.
 */
const ENGRAVINGS = {
  // viewBox of each file, so the box keeps the drawing's proportions.
  "fiddler-crab": { width: 800, height: 548 },
} as const;

export type EngravingName = keyof typeof ENGRAVINGS;

// Heights on the spacing scale: 48, 64, 96 and 128px.
const HEIGHTS = { 12: "h-12", 16: "h-16", 24: "h-24", 32: "h-32" } as const;

export function Engraving({
  name,
  height,
  className = "",
}: {
  name: EngravingName;
  height: keyof typeof HEIGHTS;
  className?: string;
}) {
  const { width, height: h } = ENGRAVINGS[name];
  return (
    <span
      aria-hidden="true"
      className={`engraving ${HEIGHTS[height]} ${className}`}
      style={
        {
          "--engraving": `url(/figures/${name}.svg)`,
          aspectRatio: `${width} / ${h}`,
        } as React.CSSProperties
      }
    />
  );
}
