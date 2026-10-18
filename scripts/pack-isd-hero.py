"""One-off: pack what the ISD dot hero draws into one served file.

Usage: python3 scripts/pack-isd-hero.py scripts/isd-data public/isd/hero.json

The source data in scripts/isd-data/ also holds what the build scripts need
(the logo's separate dots and band paths, every room artwork). The hero only
draws the logo lattice and its masks, and the world, Unite and Action maps,
so only those are served.

Order, when the artwork changes:
  extract-isd-logo.py → build-isd-logo-lattice.py
  extract-isd-rooms.py → build-isd-world.py
  pack-isd-hero.py
"""
import json, sys

src, out = sys.argv[1], sys.argv[2]
logo = json.load(open(f"{src}/logo.json"))
rooms = json.load(open(f"{src}/rooms.json"))
hero = {
    "logo": {"lattice": logo["lattice"], "masks": logo["masks"]},
    "rooms": {k: rooms[k] for k in ("world", "unite", "action")},
}
json.dump(hero, open(out, "w"), separators=(",", ":"))
print(out, len(json.dumps(hero, separators=(",", ":"))) // 1024, "KB")
