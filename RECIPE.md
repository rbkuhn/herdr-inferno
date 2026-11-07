# Inferno

A dark gothic action-RPG window for Herdr. The left sidebar is a torchlit dungeon wall. It lists spaces as "Realms", each with a painted location (cathedral, crypt, fortress, hellgate, tower, shrine). Below them, "The Party" shows every agent as a hero card: an animated full-body hero, a class title, and red Life and blue Mana orbs. The tab bar is a riveted iron frieze. Each tab shows its hero's portrait in Cinzel small caps. Terminals sit over a darkened, cursed parchment map at 60% opacity.

![Inferno](preview.png)

## What you see

Left to right, top to bottom:

- **Sidebar**: 268px wide, fixed. Background: `mods/inferno-chrome/art/sidebar.jpg` (cover), a stone wall darkened to about 32% at the top so the list stays readable.
  - **Brand**: 46px, `#0a0705c0` with a `#5a4026` bottom line. A 30px horned-skull sigil, then "HERDR" in Cinzel 700 16px `#c9a052`. Search and sidebar-toggle buttons on the right. Draggable.
  - **Realms** (spaces): a header with "REALMS" in Cinzel 700 11px accent, a `#5a402680` rule and a + button. Rows are 76px with 72px location art and a 4px gap. The space name is in Cinzel 12.5px, bold and `#e8cf8a` when active. Below it are git lines (uncommitted files, unpushed commits, repos without a remote). The active row has a `#1c120bdd` background and a 1px accent border. Other rows have `#0a0705b8` and a `#2a1d1380` border. Spaces are grouped by machine, with worktrees nested under their repo.
  - **The Party** (agents): a header with "THE PARTY", a rule and the count. Then one card per agent, 8px apart.
  - **Footer**: 69px, `#0a0705d8`. Settings and Add machine.
- **Tab bar**: 58px. Background: `mods/inferno-chrome/art/frieze.jpg`, a mirrored strip of iron bands and rivets. Each tab is 48px tall, with a 44px hero bust (when its name maps to a class) and its name in Cinzel. The active tab has a `#1c120bee` background, 1px accent border and `#e8cf8a` text; other tabs have `#0a0705a0`. Then a + menu, Files (chained tome), Changes (anvil), Inbox (raven) and window buttons.
- **Terminal area**: 8px padding and gap. Every pane, even a lone one, has a 30px header (Herdr's `pane` mod), a 1px `#7a5a3299` border (accent when focused), radius 0, and `mods/inferno-chrome/art/map.jpg` behind the terminal at `terminal_opacity` 0.6.
- **Status bar**: 28px, Herdr's `workspace-status` over `mods/inferno-chrome/art/footer.jpg`.
- **Theme** `inferno`: background `#0d0a08`, foreground `#d9ccb0`, accent `#c9a052`, solid `#a8221a`, working `#7088d8`, blocked `#e8442c`, done `#86a852`, idle `#6e6050`, chrome `#140f0b`, surface `#1a130e`, raised `#2b2017`, border `#7a5a3299`. ANSI: `#0d0a08 #c8402e #86a852 #cfa54e #7088d8 #a96cbc #62a89e #d9ccb0 / #6e6050 #e8604a #a2c46c #e8c672 #95a8ee #c78ed8 #84c6ba #f4ead2`.
- **Fonts**: the UI font is Alegreya Sans. Cinzel is used for names and headers. Both are bundled in `mods/inferno-chrome/fonts/`.

### A party card

The card has a 1px frame: `#5a4026`, accent when its agent is focused, blocked-red when blocked. A 4px square rivet sits on each corner. The background is `#0e0907e0`, or `#1c120bea` when focused.

- **Stage**: 72×96, `#0b0806`, 1px `#2a1d13` border. It shows the hero's animation for the current state.
- **Name**: the tab name in Cinzel 700 13px, coloured like loot: working `#a9b8ff`, done `#a8d070`, blocked `#ff7a62`, focused `#e8cf8a`, else foreground. On the right, the state in italic 10.5px: "In battle", "Needs you", "Victorious" or "Resting".
- Class title in Cinzel 10px accent. Then the session name, if Claude Code's `/rename` set one. Then a framed CLAUDE tag with "model · effort".
- **Orbs**: Life and Mana, each a 30px glass orb filled in 5% steps, with a small Cinzel label and the value. "—" with an empty dark orb when there is no data. "old" is appended after 5 minutes without an update. Codex and OpenCode agents show no orbs.

## How it behaves

- **Hero animation** per agent state. Each state is one horizontal strip of frames at 144×192 px per frame, shown at 72×96. Frames: rest 16 at 125 ms, done 16 at 125 ms, working 20 at 80 ms, blocked 12 at 110 ms.
  - **Resting** (idle, or no status): breathing, a slight sway, torchlight flicker, drifting dust.
  - **In battle** (working): 5 wind-up frames leaning back, then a white impact flash. Then the attack pose with the class effect: slash arcs for berserker and templar, purple cross slashes for shadowblade, an arrow for huntress, a fire blast for sorceress, a green bolt for necromancer, a thrown potion for witch, a ground shockwave for druid. The strike shakes the screen, and the hero recovers back to idle. An orange aura and embers run throughout.
  - **Needs you** (blocked): the hero raises one hand. A blood-red aura pulses and a red Cinzel "!" bobs.
  - **Victorious** (done): the resting loop with a gold aura and twinkling motes.
- **Classes**: `mods/inferno-agents/jobs.json` maps tab names to classes, matched case-insensitively. Unmapped tabs get a class from a hash of their name, skipping classes already used until all 8 are taken.
- **Locations**: `mods/inferno-spaces/places.json` maps space names to places. Other spaces get a place from a hash of their name.
- Click a card to run `agent.focus`. Click a realm to select it, right-click for its menu, drag to reorder. Tabs: click selects, double-click renames, drag reorders, right-click opens a menu, the mouse wheel cycles. Files, Changes and Inbox toggle the right panel, remembered per space.

## Built from

- **Layout tree**: root `row`: `sidebar` column [`brand` block `inferno-chrome`, `sidebar-lists` column [`spaces` `inferno-spaces`, `agents` `inferno-agents`], `sidebar-footer` `inferno-chrome` with props `{footer:true}`] and `work` column [`tabs` `inferno-tabs`, `work-body` row [`main` `{tab:"active"}` with a pane frame, `panel` column (hidden) holding a `panel-body` stack of `files`/`changes`/`inbox`], `status` `workspace-status`]. Root: `theme: "inferno"`, `ui_font: "Alegreya Sans"`, `terminal_opacity: 0.6`, `terminal_padding: [14,12]`, `titlebar: "none"`, divider 1px `#3a2a1a`, `preview: "layouts/inferno.png"`.
- **inferno-agents**: draws `agents()` and calls `setAgentOrder`. A `cx.timer.every(80)` clock calls `cx.notify()` while `window().active`, and every third tick otherwise. It skips this when there are no agents. Each render sets `left(-frame * 72)` on the strip image inside an `overflow_hidden` stage. Life and Mana come from `data/traveler/sessions/<terminal>.json` (`{updatedAt, contextRemainingPct, fiveHourRemainingPct, sessionName, model, effort}`). It reads them with `readTextFile` and `watchFolder`; remote agents are read with `readTextFile(..., {on})` every 60 s.
- **inferno-spaces**, **inferno-tabs**, **inferno-chrome**: restyled clones of herdr-traveler's mods, which are themselves clones of Herdr's `spaces`, `tabs` and `workspace-chrome`. They use `spaces()`, `panes()`, `exec("git", …)`, `hc(["machine","ls"])`, `openOverlay` for the `menu` and `new-menu` mods, and `layout.select`/`layout.show`/`layout.hide`.
- **scripts/inferno-statusline.sh** with **inferno-record.mjs**: a Claude Code statusLine. It reads `context_window.remaining_percentage` (or `100 - used_percentage`) and `rate_limits.five_hour.used_percentage` from stdin. It writes the cache file named by `$HC_TERMINAL_ID`, atomically, and prints nothing.
- **Art**: hero busts, full-body heroes, attack and calling poses (image edits of the full-body hero), locations, icons and orb liquids were generated with OpenAI image models on transparent backgrounds. Backgrounds were generated opaque. The orbs are composited in 21 fill levels plus empty. The hero strips are composited by script, with auras, effects and particles baked in over an opaque `#0b0806` stage.

## Watch out

- **Herdr's `image()` draws only the first frame of a GIF or animated WebP.** Sprites must be strips stepped from the mod. A native `.loop()` only swings a value back and forth, so it can't step frames.
- GIF transparency is 1-bit and leaves jagged halos on painted art. That's why the strips are opaque with the stage colour baked in.
- Some generated poses come with a solid band along the image's top or bottom edge. Strip only full-width opaque rows that touch an edge; a fire blast in the middle of a pose spans the full width too.
- Scale every pose of a hero by the same factor and align the poses on the feet. Fitting each pose to the frame makes the hero shrink when attacking.
- The sidebar art must stay dark behind the Realms list: a bright torch there makes the names unreadable.
- The Life/Mana cache shares `data/traveler/sessions` with herdr-traveler on purpose, so either layout fills from one statusline.
- If one space ever draws in another layout's theme, restart the Herdr window. A fresh window applies the layout theme to every terminal.
- The animation redraws the window about 12 times a second while Herdr is focused, and about 4 times a second otherwise.

## Done when

- `herdr-app check` passes for all four `mods/inferno-*` folders, and `herdr-app status` shows `"layout": "inferno"` with no errors.
- A working Claude Code agent's hero visibly attacks, with its class effect, in screenshots a fraction of a second apart. A blocked agent's hero raises a hand under a red "!".
- With the statusline installed, a Claude Code card shows Life and Mana percentages that match its context and 5-hour usage. Without it, the orbs show "—".
- Realms rows show location art, and the active realm has a gold frame. Tabs show hero busts. Files, Changes and Inbox toggle the right panel.
