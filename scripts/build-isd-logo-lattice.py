"""One-off: rebuild the ISD logo as masked dots, for the ISD dot hero.

Usage: python3 scripts/build-isd-logo-lattice.py scripts/isd-data/logo.json

The logo's inner bands are not a separate shape: each wedge is one diamond
lattice of dots that grow towards the triangle, until near it they overlap
into a solid band with small square gaps, and the wedge's outline masks the
whole field. extract-isd-logo.py read the separate dots and the band paths;
this script measures each wedge's lattice (row spacing, row offsets) and its
size curve from those dots, carries the lattice in through the band, and
records each wedge's outline so the hero can clip to it.

Adds to logo.json:
  lattice: [x, y, r, wedge] for every dot, band dots included
  masks:   three outlines, [x, y] corners, in the same normalised space
"""
import json, math, sys

import numpy as np

path = sys.argv[1]
data = json.load(open(path))
dots = np.array(data["dots"])
ang = np.degrees(np.arctan2(dots[:, 1], dots[:, 0])) % 360

# The wedge outline in wedge-local coordinates (p along the wedge's axis,
# q across it), measured as the convex hull of each wedge's shapes: the
# triangle edge at p = 0.241, the far edge at p = 1.032, narrowing outward.
OUTLINE = [(0.241, -0.417), (1.032, -0.322), (1.032, 0.322), (0.241, 0.417)]

def wedge_dots(th):
    return dots[np.abs(((ang - th + 180) % 360) - 180) < 60]


def wedge_fit(th):
    u = np.array([math.cos(math.radians(th)), math.sin(math.radians(th))])
    D = wedge_dots(th)
    return np.polyfit(D[:, :2] @ u, D[:, 2], 1)


BAND_FIT = max((wedge_fit(th) for th in [0, 120, 240]), key=lambda f: f[1])

lattice, masks = [], []
for wedge, th in enumerate([0, 120, 240]):
    u = np.array([math.cos(math.radians(th)), math.sin(math.radians(th))])
    w = np.array([-u[1], u[0]])
    sel = np.abs(((ang - th + 180) % 360) - 180) < 60
    D = dots[sel]
    p, q, r = D[:, :2] @ u, D[:, :2] @ w, D[:, 2]

    # Rows: cluster the p values.
    rows = []
    for v in np.sort(p):
        if not rows or v - rows[-1][-1] > 0.01:
            rows.append([v])
        else:
            rows[-1].append(v)
    row_p = np.array([np.mean(g) for g in rows])
    step = np.mean(np.diff(row_p))
    # Each row's q offset, and the spacing along a row.
    gap = np.median(np.diff(np.sort(q[np.abs(p - row_p[0]) < 0.01])))
    offs = [np.min(q[np.abs(p - rp) < 0.01]) % gap for rp in row_p[:2]]
    # Size falls in a straight line with distance from the triangle. The
    # band rows all follow the fullest wedge's line, so the three bands are
    # equally solid.
    slope, cut = BAND_FIT

    measured = {(round(a, 3), round(b, 3)): c for a, b, c in zip(p, q, r)}
    for i in range(-7, len(row_p) + 3):
        rp = row_p[0] + i * step
        if rp > 1.06:
            break
        off = offs[i % 2]
        for j in range(-12, 13):
            qq = off + j * gap
            if abs(qq) > 0.5:
                continue
            # Inside the outline, or close enough to be cut by it.
            t = (rp - 0.241) / (1.032 - 0.241)
            half = 0.417 + (0.322 - 0.417) * t
            if abs(qq) > half + 0.06 or rp < 0.19:
                continue
            key = (round(rp, 3), round(qq, 3))
            rr = measured.get(key, slope * rp + cut)
            x, y = rp * u + qq * w
            lattice.append([round(float(x), 5), round(float(y), 5), round(float(rr), 5), wedge])
    masks.append([[round(float(c), 5) for c in (a * u + b * w)] for a, b in OUTLINE])
    print(f"wedge {wedge}: rows {len(row_p)} step {step:.4f} gap {gap:.4f} r = {slope:.4f}p + {cut:.4f}")

data["lattice"] = lattice
data["masks"] = masks
json.dump(data, open(path, "w"), separators=(",", ":"))
print(len(lattice), "lattice dots")
