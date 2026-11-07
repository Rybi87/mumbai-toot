# Mumbai Toot!

A small, original, offline browser arcade game set in a playfully imagined Mumbai.

## Play

Play online: **https://Rybi87.github.io/mumbai-toot/**

Or double-click **Mumbai-Toot.html** to play offline. No installation or account is needed.

Hosted with GitHub Pages from the `main` branch. To update: edit the source, run `python3 build.py`, test with `node test-game.cjs`, and commit/push the updated files. The build writes both the downloadable game and the hosting entry point `index.html`.

- **Space / Up arrow / W:** jump
- **P / Escape:** pause or resume
- **Touch:** tap the game or use the Jump button
- **Sound on/off:** toggle the synthesised jump toot and game sounds
- Jump before the train reaches you. Each train cleared scores one point.
- Best score and sound preference are saved in this browser when local storage is available.
- Switching tabs automatically pauses the run.

All graphics and sounds are generated locally; there are no external assets or libraries.
This is cartoon physics, not a simulation. Never play on real railway tracks.

## Source and checks

`engine.js`: physics, train generation, collisions, scoring, and game state.
`game.js`: canvas artwork, audio, controls, and animation.
`style.css` / `template.html`: responsive page and interface.

Rebuild the standalone file: `python3 build.py`
Run engine tests: `node test-game.cjs`

Verified in a Chromium browser at desktop and phone viewport sizes: start, real keyboard jump, running audio context, pause/resume, five consecutive trains cleared, collision/game over, saved best after reload, mute persistence, and emulated touch jump. No runtime errors in the gameplay checks. Audio generation was verified programmatically, not by listening to the speakers.
