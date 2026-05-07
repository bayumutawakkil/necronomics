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
