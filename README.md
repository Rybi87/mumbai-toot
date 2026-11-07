# Mumbai Toot!

A small, original, offline browser arcade game set in a playfully imagined Mumbai.

## Play

Play online: **https://Rybi87.github.io/mumbai-toot/**

Or double-click **Mumbai-Toot.html** to play offline. No installation or account is needed.

Hosted with GitHub Pages from the `main` branch. To update: edit the source, run `python3 build.py`, test with `node test-game.cjs`, and commit/push the updated files. The build writes both the downloadable game and the hosting entry point `index.html`.

- **Space / Up arrow / W:** jump; press again in mid-air for a second toot and upward boost. Land to refill both jumps. Holding the key does not spend both jumps.
- **P / Escape:** pause or resume
- **Touch:** tap the game or Jump button; tap again in the air to boost.
- **Sound on/off:** toggle the synthesised jump toots and game sounds.
- **Local trains:** one well-timed jump is enough. Each train cleared scores one point.
- **Long express trains:** watch the advance warning, jump before the nose, then delay your second toot to stay above the extra-long carriages.
- **Messy live powerlines:** stay on the ground under low hanging wires. When wires accompany a local train, use a single jump; an unnecessary double jump can hit the cables.
- Best score for version 2 and the sound preference are saved in this browser when local storage is available. The harder version starts a fresh best-score record.
- Switching tabs automatically pauses the run, including hazards and advance warnings.

All graphics and sounds are generated locally; there are no external assets or libraries.
This is cartoon physics, not a simulation. Never play on real railway tracks.

## Source and checks

`engine.js`: physics, train generation, collisions, scoring, and game state.
`game.js`: canvas artwork, audio, controls, and animation.
`style.css` / `template.html`: responsive page and interface.

Rebuild the standalone file: `python3 build.py`
Run engine tests: `node test-game.cjs`
Run hazard and procedural-fairness tests: `node test-hazards.cjs`
Run pole attachment and rendering-layer tests: `node test-render.cjs`

Powerline spans are anchored to grounded trackside poles with crossarms, ribbed insulators, warning plates and striped bases. The supports render behind trains and the runner; only the live cable paths are collision hazards.

The hazard suite checks actual cable-segment collisions, safe single jumps beneath high wires, lethal careless boosts, express clearance at several speeds, warning/pause/restart behavior, 48 seeded 90-second playthroughs, and six 15/30/60-fps playthroughs. Encounter scheduling keeps express trains separate from overhead traps.

Version 2 verified in Chromium at desktop and 320px phone widths: real keyboard double jump and blocked third jump, repeated-key rejection, two real touch jumps, reserve feedback, pause/resume, and ready/paused/train-hit/wire-hit overlay bounds. A natural browser run cleared eight trains including two express trains and four wire sets without runtime errors. A controlled wired-local run verified an actual wire collision and its game-over advice. The audio context ran successfully; sound was verified programmatically, not by listening to the speakers.
