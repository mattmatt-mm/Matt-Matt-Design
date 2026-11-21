export type Direction = "previous" | "next";
export type Point = { x: number; y: number };

/** The first and last pages stand alone as covers. */
export function pageRange(page: number, last: number, spread: boolean): [number, number] {
  if (!spread || page === 0 || page === last) return [page, page];

  const left = page % 2 === 1 ? page : page - 1;
  return [left, Math.min(left + 1, last - 1)];
}

export function foldLayout(
  width: number,
  height: number,
  spread: boolean,
  fromPair: boolean,
  toPair: boolean,
  direction: Direction,
) {
  const forward = direction === "next";
  const pageWidth = spread ? width / 2 : width;
  const centered = (width - pageWidth) / 2;
  const sourceLeft = fromPair ? (forward ? pageWidth : 0) : centered;
  const targetLeft = toPair ? (forward ? 0 : pageWidth) : centered;
  const singleTurn = !fromPair && !toPair;
  const landingLeft = singleTurn ? sourceLeft : targetLeft + (forward ? pageWidth : -pageWidth);
  const corner = { x: sourceLeft + (forward ? pageWidth : 0), y: height };
  const landing = { x: landingLeft + (forward ? -pageWidth : 2 * pageWidth), y: height };

  return { pageWidth, height, corner, landing, sourceLeft, landingLeft, forward, fromPair, toPair };
}

export type FoldLayout = ReturnType<typeof foldLayout>;

export function constrainCorner(layout: FoldLayout, point: Point): Point {
  const { corner, landing, height } = layout;
  return {
    x: Math.max(Math.min(corner.x, landing.x), Math.min(Math.max(corner.x, landing.x), point.x)),
    y: Math.max(0, Math.min(height, point.y)),
  };
}

function clipPolygon(vertices: Point[], distance: (point: Point) => number, side: number) {
  const points: Point[] = [];

  vertices.forEach((start, index) => {
    const end = vertices[(index + 1) % vertices.length];
    const startDistance = distance(start) * side;
    const endDistance = distance(end) * side;

    if (startDistance >= 0) points.push(start);
    if ((startDistance < 0) !== (endDistance < 0)) {
      const fraction = startDistance / (startDistance - endDistance);
      points.push({ x: start.x + (end.x - start.x) * fraction, y: start.y + (end.y - start.y) * fraction });
    }
  });

  return points.length >= 3
    ? `polygon(${points.map(({ x, y }) => `${x}px ${y}px`).join(", ")})`
    : "polygon(0 0, 0 0, 0 0)";
}

/** A flat crease bisects the line from the original corner to the pulled corner. */
export function projectFold(layout: FoldLayout, point: Point) {
  const { pageWidth, height, corner, landing, sourceLeft, landingLeft, forward, fromPair, toPair } = layout;
  const progress = (point.x - corner.x) / (landing.x - corner.x);
  const shift = fromPair && !toPair ? Math.max(0, (progress - 0.5) * 2) : progress;
  const left = sourceLeft + (landingLeft - sourceLeft) * shift;
  const original = { x: forward ? pageWidth : 0, y: height };
  const pulled = { x: point.x - left, y: point.y };
  const deltaX = original.x - pulled.x;
  const deltaY = original.y - pulled.y;
  const distanceToCorner = Math.hypot(deltaX, deltaY);
  if (distanceToCorner < 0.01) return null;

  const nx = deltaX / distanceToCorner;
  const ny = deltaY / distanceToCorner;
  const crease = nx * (original.x + pulled.x) / 2 + ny * (original.y + pulled.y) / 2;
  const signedDistance = ({ x, y }: Point) => nx * x + ny * y - crease;
  const vertices = [{ x: 0, y: 0 }, { x: pageWidth, y: 0 }, { x: pageWidth, y: height }, { x: 0, y: height }];
  const cross = -2 * nx * ny;

  return {
    left,
    frontClip: clipPolygon(vertices, signedDistance, -1),
    backClip: clipPolygon(vertices, signedDistance, 1),
    reflection: `matrix(${1 - 2 * nx * nx}, ${cross}, ${cross}, ${1 - 2 * ny * ny}, ${2 * crease * nx}, ${2 * crease * ny})`,
  };
}
