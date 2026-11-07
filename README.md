# Inferno

A dark gothic action-RPG layout for the [Herdr](https://herdr.dev) desktop app. Your coding agents become a party of heroes. Each hero is animated: it attacks while its agent works and raises a hand when the agent needs you. Each card has a red Life orb (context left) and a blue Mana orb (5-hour quota left). Spaces are dungeon realms, the terminal sits over a cursed map, and the window is framed in iron and torchlit stone.

![Inferno](preview.png)

Inferno is built on the structure of [herdr-traveler](https://github.com/franky5440-afk/herdr-traveler). All of its art, animation, sound and styling is new.

## Install

```sh
git clone https://github.com/rbkuhn/herdr-inferno
cd herdr-inferno
H=~/.config/herdr-app
cp layouts/inferno.json layouts/inferno.png "$H/layouts/"
cp themes/inferno.json "$H/themes/"
cp -r mods/inferno-chrome mods/inferno-spaces mods/inferno-agents mods/inferno-tabs "$H/mods/"
herdr-app do layout.switch '{"name":"inferno"}'
```

To switch back, press `ctrl-shift-l`. To remove Inferno, delete the files you copied.

### Optional: fill the Life and Mana orbs (Claude Code)

The orbs read a small cache file that a Claude Code statusline writes. Set it up like this:

```sh
mkdir -p ~/.config/herdr-app/scripts
cp scripts/inferno-statusline.sh scripts/inferno-record.mjs ~/.config/herdr-app/scripts/
```

Then set Claude Code's statusline in `~/.claude/settings.json`:

```json
"statusLine": { "type": "command", "command": "/bin/sh ~/.config/herdr-app/scripts/inferno-statusline.sh" }
```

The script needs `node`. It records the numbers silently, so your statusline stays empty. If you already have a statusline, add a line to `inferno-statusline.sh` that pipes `$input` into it. Without the script, the orbs show "—".

### Optional: sounds

Add these to `~/.config/herdr-app/settings.json`. This setting applies to every layout:

```json
"sounds": {
  "enabled": true,
  "done": "mods/inferno-chrome/sounds/done_a.mp3",
  "blocked": "mods/inferno-chrome/sounds/blocked_a.mp3"
}
```

The `_b` files are alternative takes.

## Customise

- **Which hero a tab gets:** edit `mods/inferno-agents/jobs.json`. It maps tab names to classes: berserker, druid, huntress, necromancer, shadowblade, sorceress, templar or witch. Tabs not listed get a fixed class based on their name.
- **Which location a space gets:** edit `mods/inferno-spaces/places.json`, e.g. `{"my-space": "hellgate"}`. The choices are cathedral, crypt, fortress, hellgate, tower and shrine.

## Credits and licences

- Code: Apache-2.0 (see `LICENSE` and `NOTICE`). It is adapted from Herdr's shipped mods and from herdr-traveler, both Apache-2.0.
- Art: the hero portraits, poses, locations, icons, orbs and backgrounds were generated with OpenAI image models for this project, then processed and animated by script. They are released under the same Apache-2.0 licence.
- Sounds: generated with ElevenLabs on a paid plan, released under Apache-2.0.
- Fonts: [Cinzel](https://github.com/NDISCOVER/Cinzel) and [Alegreya Sans](https://github.com/huertatipografica/Alegreya-Sans), SIL Open Font License 1.1 (see `mods/inferno-chrome/fonts/OFL-*.txt`).

Inferno is an original work. It is not affiliated with or endorsed by any game publisher.
