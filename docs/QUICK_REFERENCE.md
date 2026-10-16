# 🚀 Quick Reference: Unit-Building System

## 📐 Formulas

### Output (Production)
```
Total Output = base_rate × (building_efficiency + Σ unit_efficiency)
```

### Input (Maintenance)
```
Total Input = base_cost × (1 + unit_efficiency_bonus × 0.5)
```

### Net Efficiency
```
Net Efficiency = (Output Boost) / (Input Increase)
```

## 🎮 Unit Stats

| Type     | Efficiency | Decay | Maintenance | Best For |
|----------|------------|-------|-------------|----------|
| Skeleton | 0.8        | 0.02  | 0.10 bone/s | Morgue   |
| Zombie   | 0.6        | 0.05  | 0.08 bone/s | Bone Mill|
| Ghoul    | 0.7        | 0.03  | 0.12 bone/s | Decay Pit|
| Ghost    | 0.9        | 0.01  | 0.14 bone/s | Factory  |
| Vampire  | 1.0        | 0.00  | 0.25 bone/s | Ritual   |

## 🏭 Building Stats

| Building   | Output        | Input         | Preferred Unit |
|------------|---------------|---------------|----------------|
| Morgue     | 0.5 bone/s    | 0.3 bone/s    | Skeleton       |
| Bone Mill  | 2.0 flesh/s   | 5.0 bone/s    | Zombie         |
| Factory    | 0.2 soul/s    | 0.5 bone/s    | Ghost          |
| Ritual     | 0.1 ritual/s  | 0.8 bone/s    | Vampire        |
| Decay Pit  | 0.15 fuel/s   | 1.0 bone/s    | Ghoul          |
| Graveyard  | 1.0 corpse/s  | 0.2 bone/s    | Skeleton       |

## 💡 Quick Examples

### Example 1: Bone Mill + 2 Zombies
```
Base: 2.0 flesh/s output, 5.0 bone/s input
Units: 2 × 0.6 efficiency = 1.2 bonus

Output: 2.0 × (1.0 + 1.2) = 4.4 flesh/s (+120%)
Input:  5.0 × (1 + 1.2×0.5) = 8.0 bone/s (+60%)
Net:    4.4/2.0 ÷ 8.0/5.0 = 1.38x efficiency
```

### Example 2: Morgue + 3 Skeletons
```
Base: 0.5 bone/s output, 0.3 bone/s input
Units: 3 × 0.8 efficiency = 2.4 bonus

Output: 0.5 × (1.0 + 2.4) = 1.7 bone/s (+240%)
Input:  0.3 × (1 + 2.4×0.5) = 0.66 bone/s (+120%)
Net:    1.7/0.5 ÷ 0.66/0.3 = 1.55x efficiency
```

## 🔧 Code Snippets

### Get Building Production
```typescript
import { calculateBuildingProduction } from '@/lib/game/calculations';

const output = calculateBuildingProduction(
  building.production_rate.bone,
  building.efficiency,
  assignedUnits
);
```

### Get Building Maintenance
```typescript
import { calculateBuildingMaintenance } from '@/lib/game/calculations';

const input = calculateBuildingMaintenance(
  building.maintenance_cost.bone,
  assignedUnits
);
```

### Debug in Console
```javascript
// Get game state
const { buildings, units } = useGameStore.getState();

// Show all buildings
necroDebug.allBuildings(buildings, units);

// Show resource flow
necroDebug.resourceFlow(buildings, units);
```

## 📊 Balancing Guide

### Early Game (0-100 corpses)
- Assign 1-2 units per building
- Focus on stable resource flow
- Build redundant production

### Mid Game (100-1000 corpses)
- Scale to 3-4 units per building
- Optimize unit placement
- Monitor bottlenecks

### Late Game (1000+ corpses)
- Max out 5 units per building
- Use best unit types
- Balance decay vs efficiency

## ⚙️ Tuning Parameters

### In `lib/game/calculations.ts`
```typescript
// Change input scaling (currently 0.5)
export function calculateMaintenanceMultiplier(unitBonus: number): number {
  return 1 + (unitBonus * 0.5); // ← Adjust this
}

// 0.3 = Easier (less input increase)
// 0.5 = Balanced (current)
// 0.7 = Harder (more input increase)
```

### In `lib/game/constants.ts`
```typescript
// Change max units per building (currently 5)
export const GAME_CONFIG = {
  MAX_UNITS_PER_BUILDING: 5, // ← Adjust this
  // ...
};
```

## 🐛 Common Issues

### Issue: Building stops producing
**Cause:** Not enough input resources
**Fix:** Add more production buildings or reduce workers

### Issue: Resources not increasing
**Cause:** Building not active or no workers assigned
**Fix:** Check building.is_active and assign units

### Issue: UI not updating
**Cause:** assignedCount prop not passed correctly
**Fix:** Ensure BuildingCard receives correct assignedCount

## 📚 Related Files

- `stores/useGameStore.ts` - Game state & tick processing
- `lib/game/calculations.ts` - Helper functions
- `lib/game/constants.ts` - Game configuration
- `components/ui/BuildingCard.tsx` - Building UI
- `lib/game/debug.ts` - Debug utilities
- `docs/UNIT_BUILDING_SYSTEM.md` - Full documentation
