"""One-off: read the ISD logo SVG into dot data for the ISD dot hero.

Usage: python3 scripts/extract-isd-logo.py "<ISD logo.svg>" scripts/isd-data/logo.json

Every sub-shape is classed by how much its curve segments bulge: round dots
bulge like quarter arcs, squares are drawn with straight "curves". Dots become
{x, y, r}; everything else (the inner bands and their square holes) is kept
as raw path data and drawn with Path2D. Coordinates are recentred on the
logo's centre (the middle of the empty triangle) and scaled so the logo's
outer radius is 1.
"""
import json, math, re, sys

src, out = sys.argv[1], sys.argv[2]
svg = open(src).read()
paths = re.findall(r'<path d="([^"]+)"', svg)

def segments(sp):
    toks = re.findall(r"[MCLVHZ]|-?\d*\.?\d+(?:e-?\d+)?", sp)
    cmd, cur, nums, segs, start = None, (0, 0), [], [], None
    for t in toks:
        if t in "MCLVHZ":
            cmd = t
            continue
        nums.append(float(t))
        if cmd == "M" and len(nums) == 2:
            cur = start = tuple(nums); nums = []
        elif cmd == "L" and len(nums) == 2:
            segs.append(("L", cur, tuple(nums))); cur = tuple(nums); nums = []
        elif cmd == "V" and len(nums) == 1:
            n = (cur[0], nums[0]); segs.append(("L", cur, n)); cur = n; nums = []
        elif cmd == "H" and len(nums) == 1:
            n = (nums[0], cur[1]); segs.append(("L", cur, n)); cur = n; nums = []
        elif cmd == "C" and len(nums) == 6:
            a, b, c = (nums[0], nums[1]), (nums[2], nums[3]), (nums[4], nums[5])
            segs.append(("C", cur, a, b, c)); cur = c; nums = []
    return segs

def bulge(seg):
    if seg[0] == "L":
        return 0.0
    _, p0, p1, p2, p3 = seg
    cx, cy = p3[0] - p0[0], p3[1] - p0[1]
    L = math.hypot(cx, cy) or 1e-9
    d = lambda p: abs((p[0] - p0[0]) * cy - (p[1] - p0[1]) * cx) / L
    return max(d(p1), d(p2)) / L

dots, shapes = [], []
for d in paths:
    # Non-dot sub-shapes stay together per path: a band and its square holes
    # are one path, and the holes only cut out under the shared fill rule.
    rest = []
    for sp in re.findall(r"M[^M]*", d):
        segs = segments(sp)
        ptsx = [q for s in segs for q in s[1:]]
        xs = [p[0] for p in ptsx]; ys = [p[1] for p in ptsx]
        w, h = max(xs) - min(xs), max(ys) - min(ys)
        b = sum(bulge(s) for s in segs) / len(segs)
        if len(segs) >= 4 and b > 0.15 and abs(w - h) < 0.2 * max(w, h):
            dots.append(((max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2, (w + h) / 4))
        else:
            rest.append(sp.strip())
    if rest:
        shapes.append(" ".join(rest))

# Centre: the logo's three wedges sit around an empty triangle; its centroid
# is the mean of all dot centres weighted equally per wedge, which by the
# 120-degree symmetry is the mean of every dot.
cx = sum(x for x, _, _ in dots) / len(dots)
cy = sum(y for _, y, _ in dots) / len(dots)
R = max(math.hypot(x - cx, y - cy) + r for x, y, r in dots)
k = 1 / R

data = {
    "source": {"width": 3456, "height": 3976, "centre": [round(cx, 2), round(cy, 2)], "scale": k},
    "dots": [[round((x - cx) * k, 5), round((y - cy) * k, 5), round(r * k, 5)] for x, y, r in dots],
    "shapes": shapes,
}
json.dump(data, open(out, "w"), separators=(",", ":"))
print(f"{len(dots)} dots, {len(shapes)} other shapes, centre {cx:.1f},{cy:.1f}, R {R:.1f}")
