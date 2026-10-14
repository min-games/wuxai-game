# Jianghu of Shadows

A playable wuxia-inspired 2D action-platformer based on [the project vision](docs/vision.md). Two hand-authored chapters form a connected journey:

- **Chapter I — The Silent Pass:** misty mountain paths, sword combat, three enemy archetypes, a jade seal, a lantern checkpoint, and the Keeper of the Bell.
- **Chapter II — Temple of Embers:** candlelit indoor galleries, twelve opponents including spear guards and chi-casting acolytes, timed furnace hazards, two checkpoints, a second jade seal, and the Ashen Abbot.

Ring the first bell to continue into Chapter II. The chapter selector also lets you start either chapter directly for testing. Selecting another chapter starts a fresh journey; Restart restarts the current chapter.

## Play online

[Play Jianghu of Shadows](https://min-games.github.io/wuxai-game/).

The repository is hosted at https://github.com/min-games/wuxai-game. GitHub Actions
runs the tests and production build, then deploys dist/ to GitHub Pages after
each successful push to main. Pull requests run validation without deploying.
Vite uses /wuxai-game/ as its base path so assets load from the project site.

## Managed workspace

This game is an independent Git repository at repos/wuxai-game in
min-games/min-games-workspace. From the workspace root:

```sh
ws repo list
ws repo sync wuxai-game
ws run codex "Describe the game change" --repo wuxai-game --no-integrate
ws inspect <candidate-id>
ws integrate <candidate-id>
git -C repos/wuxai-game push origin main
```

The migration preserves the original Git history and imports the current local
playable game, including files that were uncommitted in the source directory.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite (default `http://localhost:5173`; Vite selects another port if occupied). Click **Enter the jianghu** to begin.

```sh
npm run build  # Type-check and produce dist/
npm test       # Physics, combat, checkpoint, and completion checks
```

## Controls

| Key | Action |
| --- | --- |
| A / D or left / right arrows | Move |
| Space, W, or up arrow | Jump; press again for double jump |
| J | Light sword attack |
| K | Heavy sword attack |
| L | Parry (short timing window) |
| Shift | Dash; costs 12 chi |
| E | Chi wave; costs 35 chi |
| F | Rest at a lantern / ring the bell |
| Escape | Pause / resume |
| C | Character stats, inventory, and equipment |

Compact layouts also provide touch buttons. Sound is optional; toggle it in the header. The controls and lore button explains combat and the route. Restart resets the chapter.

## The journey

Enemies flash amber before attacking. Parry to avoid damage, replenish chi, and stagger melee opponents; ranged projectiles can be reflected. Light attacks recover quickly; heavy attacks deal more damage. Chi regenerates slowly and through successful hits.

Cross the gaps using double jumps and dashes. A jade seal waits on the elevated path. Rest at the red lantern near the middle of the stage with F to refill resources and set your respawn point. Defeat the Keeper in the final court, approach the bell, and press F. Choose **Enter Chapter II** to continue; your time, falls, and collected seal carry forward, and health and chi refill.

Inside the temple, furnace grates glow for one second before erupting for one second, then cool for two seconds. Jump over them, dash through, or take the elevated galleries. Spear guards strike from further away; acolytes aim chi bolts at you. Their bolts can be parried back.

The Ashen Abbot alternates aimed projectile volleys with a staff sweep that releases low waves in both directions. Jump the floor waves, reflect projectiles, and attack between telegraphs. Below half health, volleys gain two extra orbs and attacks accelerate. Rest at the two temple lanterns with F. Defeat the Abbot, then press F at the oath altar to complete the journey.

## RPG progression

Every defeated enemy grants XP, displayed above their position. XP carries across increasing thresholds (80 XP to level 2, then 120, 160, and so on), up to level 8. Each level adds 12 maximum health, 8 maximum chi, 2 light damage, 3 heavy damage, 3 chi damage, and 0.3 chi regeneration per second. Level-ups fully restore resources and show a gold ring, particles, and a banner; optional sound is available.

Press **C** or choose **Character** to pause and open your character screen. It shows current and maximum resources, attack damage, armor, chi regeneration, dash cost, XP, and journey records. Equip one weapon, one robe, and one charm. Inventory cards show each item's bonuses and the difference from your current equipment. Gear changes the character's robe and blade colors, as well as the combat stats. Swapping gear clamps resources to the new limits and never heals you.

Loot is deterministic and goes directly into your inventory; equipping is manual. Repeated drops never duplicate an item. Swordsmen drop Riversteel Jian, archers drop Reedwoven Cloak, shades drop Wind Knot, spear guards drop Iron Brocade, and acolytes drop Ember Bead. The Keeper drops Moonkeeper's Jian, the Abbot drops Oath of Embers, and hidden jade seals grant Jade Pendant. Armor reduces damage by a flat amount, with a minimum of 1 damage per hit.

XP, levels, inventory, and equipped items survive deaths and carry from Chapter I into Chapter II. Defeated enemies remain defeated after death and cannot award XP twice. Selecting a chapter, Restart, or Journey again starts fresh progression. Progress remains session-local and is cleared on reload.

## Implementation

TypeScript, Vite, and Canvas 2D; no runtime game-engine dependencies. All scenery, characters, and combat effects are original procedural drawings. Characters have articulated legs and arms, idle breathing, trailing scarves, and distinct jump, landing, dash, sword, parry, hurt, and chi poses. Run cycles follow distance travelled; animation freezes when paused. Mountains, the monastery, distant bamboo, the playable world, and foreground foliage scroll at different speeds to convey depth. Optional effects use Web Audio. Google Fonts improve the page typography when online, with local system fallbacks. Gameplay needs no external images, accounts, or services.

- `src/game.ts`: game loop, input, combat, enemy behaviors, rendering, and sound.
- `src/world.ts`: shared physics and collision helpers.
- `src/chapters.ts`: chapter geometry, enemy spawns, checkpoints, hazards, and story metadata.
- `src/temple.ts`: layered temple scenery, furnace timing, and flame effects.
- `src/character.ts`: articulated character rig with movement-driven run cycles and action poses.
- `src/progression.ts`: XP thresholds, level scaling, rewards, inventory, and equipment stats.
- `src/character-screen.ts`: character stats, equipment comparisons, and inventory UI.
- `src/main.ts`: page UI, overlays, touch controls, and game integration.
- `src/style.css`: responsive presentation.
- `tests/`: deterministic physics and gameplay checks.

This is a first playable vertical slice. Faction choices, further chapters, and a music soundtrack remain future work. Progress is session-local; restarting or reloading starts a fresh chapter. The original vision is retained in `docs/vision.md`.
