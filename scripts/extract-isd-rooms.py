"""One-off: read the four ISD room artworks into dot-size maps for the hero.

Usage: python3 scripts/extract-isd-rooms.py "raw/Case Study/HKUST AIS" scripts/isd-data/rooms.json

Each artwork is a square matrix of round dots whose sizes draw a picture.
Dots are snapped to their grid by spacing, and each size is normalised so
the background dot is 0 and the largest dot is 1. The /LABEL lettering
(drawn as paths) is ignored.
"""
import json, re, statistics, sys

src, out = sys.argv[1], sys.argv[2]
rooms = {}
for name in ["Diverse", "Connect", "Unite", "Action"]:
    svg = open(f"{src}/{name}.svg").read()
    dots = [(float(x), float(y), float(r)) for x, y, r in
            re.findall(r'<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"', svg)]
    dots += [(float(x), float(y), (float(a) + float(b)) / 2) for x, y, a, b in
             re.findall(r'<ellipse cx="([\d.]+)" cy="([\d.]+)" rx="([\d.]+)" ry="([\d.]+)"', svg)]
    xs = sorted({round(x) for x, _, _ in dots})
    gaps = [b - a for a, b in zip(xs, xs[1:]) if b - a > 10]
    step = statistics.median(gaps)
    x0 = min(x for x, _, _ in dots)
    y0 = min(y for _, y, _ in dots)
    cols = round((max(x for x, _, _ in dots) - x0) / step) + 1
    rows = round((max(y for _, y, _ in dots) - y0) / step) + 1
    # The background dot size is the most common one.
    base = statistics.mode(round(r, 1) for _, _, r in dots)
    top = max(r for _, _, r in dots)
    grid = [0.0] * (cols * rows)
    for x, y, r in dots:
        c = round((x - x0) / step)
        rr = round((y - y0) / step)
        grid[rr * cols + c] = round(max(0.0, (r - base) / (top - base)), 3)
    rooms[name.lower()] = {"cols": cols, "rows": rows, "map": grid}
    print(name, cols, rows, "step", round(step, 1), "base r", base, "max r", round(top, 1), len(dots), "dots")
json.dump(rooms, open(out, "w"), separators=(",", ":"))
