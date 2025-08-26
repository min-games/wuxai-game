[Vision → Product]

Title: Jianghu of Shadows — a 武俠 Castlevania-style 2D action-platformer

Problem statement
-----------------
There is an opportunity to create a tightly-designed 2D action-platformer that combines the deliberate, stage-based combat and exploration of classic Castlevania with the rich aesthetics, moral ambiguity, and movement vocabulary of classical Chinese 武俠 (jianghu) fiction. The target players want challenging, skill-based combat; evocative world-building rooted in Chinese myth and history; and a progression loop that rewards exploration and mastery.

User scenarios
--------------
- As a precision-platformer fan, I want tight controls and predictable enemy telegraphs so I can practice and master parry/timing mechanics.
- As a 武俠 fan, I want weapons, martial techniques, and sects with distinct philosophies so I can role-play a particular code of honor.
- As an exploration player, I want interconnected stages and secrets that reveal lore, shortcuts, and unique gear.
- As a speedrunner, I want movement tech and deterministic systems that allow sequence-breaking and advanced routing.

Core vision & pillars
---------------------
1. Combat-as-dance: fast, precise, layered — light/heavy attacks, counters, weapon stances, chi/inner-power (内力) abilities, and occasional supernatural techniques.
2. Atmospheric 武俠 world: stylized environments (misty river towns, mountain sect strongholds, imperial tombs), period music reimagined with traditional instruments, and NPCs who deliver moral choices and faction ties.
3. Stage-driven progression with exploration: carefully-crafted levels that combine platforming challenges and combat arenas, plus shortcuts and optional bosses that deepen the narrative.
4. Weapon & sect progression: gear alters playstyle (e.g., saber favors close range, polearm for reach, hidden blades for stealth), and sect affiliation unlocks unique skill trees.

Success criteria (initial)
-------------------------
- Prototype player can complete an early demo level with core movement, one weapon, and 3 enemy types without crashes.
- Players report controls as "tight" and "responsive" in playtests (target 80% positive responses in first 20 testers).
- Retention: players return to play the demo at least twice in a week (baseline metric for early engagement).

High-level backlog (prioritized)
--------------------------------
1. Core mechanics prototype — movement, jump, dash/roll, light/heavy attacks, and one special (内力) ability.
2. Combat polish — enemy telegraphs, hitstuns, invincibility frames, and parry/counter system.
3. One vertical/horizontal stage with platforming puzzles, environmental hazards, and a miniboss.
4. Art pass — character silhouette designs, mood tilesets, UI mockups, and a short music loop using guqin/erhu motifs.
5. Progression — weapons, upgrade paths, and a basic sect reputation mechanic.

Risks & open questions
----------------------
- Cultural authenticity vs. fantasy: how literal should historical elements be? (Assume stylized fantasy inspired by Chinese history/myth; consult cultural experts before representational claims.)
- Scope creep: combat + deep RPG progression + level design can expand quickly. Mitigation: focus on a narrow, polished playable loop for first vertical slice.
- Control feel: tuning for "tight" controls requires iterative playtesting and telemetry.

Assumptions
-----------
- The team wants a 2D action-platformer with hand-authored levels rather than procedurally-generated stages.
- Visual language will pull from classical Chinese painting, opera silhouettes, and wuxia cinema while keeping readable gameplay silhouettes.

Initial metrics to track
------------------------
- Input latency and frame timings during playtests.
- Time-to-complete early demo level and number of deaths per player.
- Engagement metrics: sessions per user, repeat plays, and time spent in combat vs. exploration.

Next steps (30/60/90)
---------------------
- 0–30 days: Build a playable vertical slice with movement, one weapon, 3 enemy types, and a short stage; run 10 internal playtests.
- 30–60 days: Iterate on controls and combat; add a miniboss, art polish for one tileset, and music loop; run closed external playtests (20–50 players).
- 60–90 days: Implement basic progression (weapons + sect), one additional stage, and start composing a short narrative arc and NPCs.

Deliverables for Product Agent
-----------------------------
- Updated `docs/vision.md` (this file) tagged [Vision → Product].
- A prioritized high-level backlog and a recommended 90-day milestone plan.

Notes
-----
- Keep design documents modular: separate combat spec, level-design spec, and art bible as the next artifacts.
- Recommend early consultation with native-language writers and historians for lore authenticity.
