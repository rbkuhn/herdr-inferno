"""Cut each hero strip (mods/inferno-agents/anim/<class>-<state>.webp) into one 72x96 PNG per frame,
mods/inferno-agents/frames/<class>/<state>/NN.png, for the inferno-tree cards.

    python3 scripts/inferno-frames.py mods/inferno-agents/anim mods/inferno-agents/frames

COUNTS must match ANIM in mods/inferno-tree/lib.js.
"""
import os
import sys

from PIL import Image

COUNTS = {"rest": 16, "done": 16, "working": 20, "blocked": 12}
SIZE = (72, 96)

src, dst = sys.argv[1], sys.argv[2]
for f in sorted(os.listdir(src)):
    if not f.endswith(".webp"):
        continue
    job, state = f[:-5].rsplit("-", 1)
    im = Image.open(os.path.join(src, f)).convert("RGB")
    n = COUNTS[state]
    w = im.width // n
    assert w * n == im.width, (f, im.size)
    out = os.path.join(dst, job, state)
    os.makedirs(out, exist_ok=True)
    for i in range(n):
        frame = im.crop((i * w, 0, (i + 1) * w, im.height)).resize(SIZE, Image.LANCZOS)
        frame.save(os.path.join(out, f"{i:02d}.png"), optimize=True)
