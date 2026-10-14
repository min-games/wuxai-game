# Wuxai game

This is Jianghu of Shadows, a TypeScript and Vite browser game. Use Node.js 24.

## Workspace workflow

This repository is managed by the parent min-games workspace. Discover it with
ws repo list and make changes through ws run codex --repo wuxai-game.
Review the candidate with ws inspect, then integrate with ws integrate.
Keep source changes in the isolated worktree provided by ws.

## Validation

Run npm ci, npm test, and npm run build before integration. Do not commit
node_modules or dist. Preserve the /wuxai-game/ Vite base path for GitHub Pages.
The Pages workflow validates pull requests and deploys successful main builds.
