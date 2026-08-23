/* Adapted from arknow91/liquid-taffy (MIT). */

export function squirclePath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const scale = Math.min(radius * 1.528665, width / 2, height / 2);
  const unit = (coefficient: number) => scale * (coefficient / 1.528665);
  const [c0, c1, c2, c3, c4, c5, c6] = [
    1.528665, 1.08849, 0.8684, 0.63149, 0.37283, 0.16906, 0.07491,
  ].map(unit);

  return [
    `M ${x + c0} ${y}`,
    `L ${x + width - c0} ${y}`,
    `C ${x + width - c1} ${y} ${x + width - c2} ${y} ${x + width - c3} ${y + c6}`,
    `C ${x + width - c4} ${y + c5} ${x + width - c5} ${y + c4} ${x + width - c6} ${y + c3}`,
    `C ${x + width} ${y + c2} ${x + width} ${y + c1} ${x + width} ${y + c0}`,
    `L ${x + width} ${y + height - c0}`,
    `C ${x + width} ${y + height - c1} ${x + width} ${y + height - c2} ${x + width - c6} ${y + height - c3}`,
    `C ${x + width - c5} ${y + height - c4} ${x + width - c4} ${y + height - c5} ${x + width - c3} ${y + height - c6}`,
    `C ${x + width - c2} ${y + height} ${x + width - c1} ${y + height} ${x + width - c0} ${y + height}`,
    `L ${x + c0} ${y + height}`,
    `C ${x + c1} ${y + height} ${x + c2} ${y + height} ${x + c3} ${y + height - c6}`,
    `C ${x + c4} ${y + height - c5} ${x + c5} ${y + height - c4} ${x + c6} ${y + height - c3}`,
    `C ${x} ${y + height - c2} ${x} ${y + height - c1} ${x} ${y + height - c0}`,
    `L ${x} ${y + c0}`,
    `C ${x} ${y + c1} ${x} ${y + c2} ${x + c6} ${y + c3}`,
    `C ${x + c5} ${y + c4} ${x + c4} ${y + c5} ${x + c3} ${y + c6}`,
    `C ${x + c2} ${y} ${x + c1} ${y} ${x + c0} ${y}`,
    "Z",
  ].join(" ");
}
