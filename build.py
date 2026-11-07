"""Build the dependency-free, double-clickable browser game."""
from pathlib import Path
import re

root = Path(__file__).resolve().parent
engine = root / 'engine.js'
if not engine.exists():
    match = re.search(r'<script id="engine">([\s\S]*?)</script>', (root / 'Mumbai-Toot.html').read_text(encoding='utf-8'))
    if not match:
        raise RuntimeError('Missing engine source')
    engine.write_text(match[1].strip(), encoding='utf-8')
html = (root / 'template.html').read_text(encoding='utf-8')
for placeholder, name in [('/* STYLE */','style.css'), ('/* ENGINE */','engine.js'), ('/* GAME */','game.js')]:
    html = html.replace(placeholder, (root / name).read_text(encoding='utf-8'))
for name in ('Mumbai-Toot.html', 'index.html'):
    output = root / name
    output.write_text(html, encoding='utf-8')
    print(f'Built {output} ({output.stat().st_size:,} bytes)')
