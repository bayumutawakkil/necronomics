# 🏴 Necroconomics — Dark Absurdist Idle Colony Management

A website-based idle colony management game where **death powers your economy**. Build an undead workforce, optimize production chains, and manage the inevitable decay of your workers.

## 🎮 Quick Start

The development server is running at **http://localhost:3000**

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS 4
- **State:** Zustand with immer & persist
- **Language:** TypeScript (strict mode)

## 📁 Project Structure

```
app/              Main game page
components/ui/    React UI components
stores/           Zustand state management
lib/game/         Game logic & constants
types/            TypeScript game types
public/           Static assets
```

## 🎨 Theme

Custom dark theme with necromantic colors:
- **Charcoal** (#1a1208) - Background
- **Bone** (#f5ede0) - Primary text
- **Soul** (#7c6fa0) - Magic effects
- **Blood** (#8b1a1a) - Danger states
- **Moss** (#3d5c3a) - Growth/surplus

## 🔧 Setup

No additional environment configuration required. The game runs client-side with local state management.

## 📚 Key Files

### Full Game Documentation

Dokumentasi lengkap mengenai konsep game, gameplay loop, formula ekonomi, struktur
teknis, UI/UX, penyimpanan, research, dan known issues tersedia di
[`docs/GAME_DOCUMENTATION.md`](./docs/GAME_DOCUMENTATION.md).

### Game Mechanics

#### Unit-Building Assignment System

Units can be assigned to buildings to boost production, with a risk/reward tradeoff:

**Output Scaling:**
- Base production = `production_rate × building_efficiency`
- With units: `production_rate × (building_efficiency + Σ unit_efficiency)`
- Each unit adds their efficiency (0.6-1.0) to total output

**Input Scaling:**
- Base consumption = `maintenance_cost`
- With units: `maintenance_cost × (1 + unit_efficiency_bonus × 0.5)`
- More workers = 50% more resource consumption per efficiency point

**Example:**
- Bone Mill: 2.0 flesh/s output, 5.0 bone/s input (base)
- +2 Zombies (0.6 efficiency each): 
  - Output: 2.0 × (1.0 + 1.2) = **4.4 flesh/s** (+120%)
  - Input: 5.0 × (1 + 1.2 × 0.5) = **8.0 bone/s** (+60%)

This creates strategic depth: assign too many units and you'll run out of input resources!

**Implementation:**
- `stores/useGameStore.ts` - processTick() handles production
- `lib/game/calculations.ts` - Helper functions for scaling
- `components/ui/BuildingCard.tsx` - UI displays scaled rates

- [types/game.ts](./types/game.ts) - Game entity types
- [stores/useGameStore.ts](./stores/useGameStore.ts) - Game state management
- [lib/game/constants.ts](./lib/game/constants.ts) - Game constants & formulas
- [app/page.tsx](./app/page.tsx) - Main game interface

## 🎯 Design Philosophy

**Three Pillars:**
1. **Death as Resource** — Economy powered by corpses
2. **Decay as Time Pressure** — Everything deteriorates
3. **Dark Absurdism** — Serious systems, absurd narrative

## 📖 Development

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
