"""One-off: a contoured world map for the ISD dot hero's /diverse beat.

Usage: python3 scripts/build-isd-world.py scripts/isd-data/rooms.json

The Diverse artwork is only 22 dots across, too coarse to read as a world
map, so this draws one: simplified continent outlines (longitude, latitude)
rasterised at 1°, then shaded like a contour map. The coastline is the
strongest line, and further contour rings repeat inland, so at halftone size
each continent reads by its outline and its rings. Written into rooms.json
as `world`, alongside the room artworks.
"""
import json, sys

import numpy as np
from scipy import ndimage

out = sys.argv[1]

# Equirectangular, longitude east, latitude north. Coarse but recognisable.
CONTINENTS = {
    "north_america": [(-168, 66), (-162, 70), (-140, 70), (-125, 72), (-95, 74), (-80, 73), (-65, 62),
                      (-60, 55), (-55, 50), (-66, 45), (-70, 42), (-76, 35), (-81, 31), (-80, 25),
                      (-82, 28), (-90, 30), (-97, 27), (-97, 22), (-92, 18), (-87, 21), (-88, 16),
                      (-84, 12), (-81, 8), (-78, 8), (-83, 10), (-86, 13), (-92, 15), (-105, 20),
                      (-110, 24), (-112, 30), (-115, 30), (-118, 34), (-124, 40), (-124, 48),
                      (-130, 55), (-140, 60), (-152, 60), (-158, 57), (-165, 60)],
    "south_america": [(-80, 8), (-75, 11), (-62, 11), (-52, 5), (-50, 0), (-44, -2), (-35, -6),
                      (-38, -13), (-41, -22), (-48, -26), (-53, -34), (-58, -38), (-65, -41),
                      (-68, -50), (-70, -55), (-74, -50), (-73, -40), (-71, -30), (-70, -18),
                      (-76, -14), (-81, -6), (-80, 0), (-78, 2)],
    "greenland": [(-73, 78), (-60, 82), (-30, 83), (-20, 78), (-22, 70), (-40, 65), (-48, 61),
                  (-52, 66), (-55, 70), (-60, 76)],
    "eurasia": [(-10, 36), (-9, 43), (-2, 44), (-5, 48), (2, 51), (8, 54), (5, 58), (5, 62), (15, 69),
                (25, 71), (40, 68), (45, 68), (60, 70), (70, 73), (80, 73), (100, 77), (115, 74),
                (130, 72), (140, 73), (160, 70), (170, 70), (180, 68), (180, 64), (170, 60),
                (163, 58), (156, 51), (155, 58), (140, 53), (141, 47), (135, 43), (129, 35),
                (127, 38), (122, 40), (122, 37), (119, 35), (121, 31), (121, 28), (117, 23),
                (110, 21), (108, 16), (109, 12), (105, 9), (103, 10), (100, 13), (100, 8),
                (104, 1), (101, 3), (98, 8), (98, 16), (94, 17), (91, 22), (87, 21), (80, 15),
                (77, 8), (73, 17), (72, 21), (67, 25), (57, 26), (56, 24), (59, 22), (52, 17),
                (45, 13), (43, 15), (39, 22), (35, 28), (34, 31), (36, 36), (30, 36), (27, 37),
                (26, 40), (23, 40), (22, 37), (19, 40), (17, 40), (13, 45), (12, 44), (16, 40),
                (12, 38), (9, 44), (3, 43), (0, 39), (-6, 36)],
    "africa": [(-17, 21), (-17, 15), (-12, 8), (-8, 4), (5, 4), (9, 4), (9, -1), (13, -6), (12, -17),
               (15, -27), (18, -34), (26, -34), (33, -26), (35, -20), (40, -15), (40, -3), (43, -1),
               (51, 11), (43, 12), (39, 16), (36, 22), (33, 30), (25, 32), (20, 31), (11, 33),
               (10, 37), (0, 36), (-6, 35), (-10, 30), (-13, 27)],
    "australia": [(114, -22), (114, -34), (118, -35), (124, -33), (131, -31), (138, -35), (141, -38),
                  (147, -38), (150, -37), (153, -30), (153, -25), (146, -19), (142, -10), (141, -17),
                  (136, -12), (130, -11), (126, -14), (122, -17)],
    "britain": [(-5, 50), (1, 51), (2, 53), (-2, 56), (-3, 58.5), (-6, 58), (-5, 55), (-3, 54), (-5, 52)],
    "japan": [(130, 31), (132, 34), (136, 35), (140, 36), (142, 40), (141, 45), (145, 44), (141, 41),
              (140, 38), (138, 34), (133, 33)],
    "madagascar": [(44, -25), (47, -25), (50, -15), (49, -12), (44, -16)],
    "borneo": [(109, 2), (117, 7), (119, 5), (116, -4), (110, -3)],
    "sumatra": [(95, 5), (98, 4), (106, -6), (104, -5)],
    "new_guinea": [(131, -1), (138, -2), (147, -6), (150, -10), (141, -9)],
    "new_zealand": [(172, -34), (178, -38), (174, -41), (167, -46), (170, -46), (174, -41)],
}

LON0, LON1, LAT0, LAT1 = -180, 180, -58, 80
W, H = LON1 - LON0, LAT1 - LAT0
lon = np.arange(W) + LON0 + 0.5
lat = LAT1 - np.arange(H) - 0.5
LON, LAT = np.meshgrid(lon, lat)


def inside(poly):
    """Even-odd point-in-polygon over the whole grid."""
    x = np.array([p[0] for p in poly], float)
    y = np.array([p[1] for p in poly], float)
    hit = np.zeros(LON.shape, bool)
    for i in range(len(x)):
        x0, y0, x1, y1 = x[i - 1], y[i - 1], x[i], y[i]
        cross = ((y0 > LAT) != (y1 > LAT)) & (LON < (x1 - x0) * (LAT - y0) / (y1 - y0 + 1e-12) + x0)
        hit ^= cross
    return hit


land = np.zeros(LON.shape, bool)
for poly in CONTINENTS.values():
    land |= inside(poly)

# Inland distance in degrees, then contour rings: the coast is the
# strongest line, with a ring every RING degrees inland, softer the
# further in it sits.
inland = ndimage.distance_transform_edt(land)
RING = 16.0
ring = 0.5 + 0.5 * np.cos(2 * np.pi * inland / RING)
value = np.where(land, 0.35 + 0.65 * ring * np.exp(-inland / 30), 0.0)

# 2° cells are plenty for a halftone of this size.
small = value.reshape(H // 2, 2, W // 2, 2).mean(axis=(1, 3))
rooms = json.load(open(out))
rooms["world"] = {
    "cols": small.shape[1],
    "rows": small.shape[0],
    "map": [round(float(v), 3) for v in small.ravel()],
}
json.dump(rooms, open(out, "w"), separators=(",", ":"))
print("world", small.shape, "land cells", int((small > 0.05).sum()))
