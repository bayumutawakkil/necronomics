# 🏭 Unit-Building Assignment System

## Overview

Sistem assignment unit ke building menciptakan mekanisme risk/reward yang strategis. Semakin banyak unit yang di-assign, semakin tinggi output **DAN** input yang dibutuhkan.

## Mekanika Dasar

### 1. Output Scaling (Production Rate)

**Formula:**
```
Total Output = production_rate × (building_efficiency + Σ unit_efficiency)
```

**Contoh:**
- Bone Mill base: 2.0 flesh/s
- Building efficiency: 1.0
- Assign 2 Zombies (efficiency 0.6 each)
- **Result:** 2.0 × (1.0 + 0.6 + 0.6) = **4.4 flesh/s**

### 2. Input Scaling (Maintenance Cost)

**Formula:**
```
Total Input = maintenance_cost × (1 + unit_efficiency_bonus × 0.5)
```

**Contoh:**
- Bone Mill base: 5.0 bone/s consumed
- Unit efficiency bonus: 1.2 (from 2 zombies)
- **Result:** 5.0 × (1 + 1.2 × 0.5) = **8.0 bone/s**

### 3. Risk/Reward Balance

| Workers | Output Boost | Input Increase | Net Efficiency |
|---------|--------------|----------------|----------------|
| 0       | 100%         | 100%           | 1.00           |
| 1 (0.8) | 180%         | 140%           | 1.29           |
| 2 (1.6) | 260%         | 180%           | 1.44           |
| 3 (2.4) | 340%         | 220%           | 1.55           |
| 5 (4.0) | 500%         | 300%           | 1.67           |

**Insight:** Lebih banyak workers = lebih efisien, TAPI butuh supply chain yang kuat!

## Unit Types & Efficiency

| Unit Type | Efficiency | Decay Rate | Best For |
|-----------|------------|------------|----------|
| Skeleton  | 0.8        | 0.02/s     | Morgue, Graveyard |
| Zombie    | 0.6        | 0.05/s     | Bone Mill |
| Ghoul     | 0.7        | 0.03/s     | Decay Pit |
| Ghost     | 0.9        | 0.01/s     | Necro Factory |
| Vampire   | 1.0        | 0.00/s     | Ritual Chamber |

## Building Preferences

Setiap building punya **preferred unit type** yang ditampilkan di UI:

```typescript
const BUILDING_STATS = {
  morgue: {
    preferred_unit: 'skeleton',
    unit_bonus_desc: 'Each skeleton boosts bone output',
  },
  bone_mill: {
    preferred_unit: 'zombie',
    unit_bonus_desc: 'Each zombie boosts flesh output',
  },
  // ... dst
}
```

## Implementation Details

### 1. Game Store (`stores/useGameStore.ts`)

```typescript
processTick: () => {
  state.buildings.forEach((building) => {
    // Get assigned units
    const units = building.assigned_units
      .map(id => state.units.find(u => u.id === id))
      .filter(u => u !== undefined);

    // Calculate bonuses
    const unitBonus = calculateUnitEfficiencyBonus(units);
    const totalEfficiency = building.efficiency + unitBonus;
    const maintenanceMultiplier = calculateMaintenanceMultiplier(unitBonus);

    // Apply scaled costs and production
    // ...
  });
}
```

### 2. Calculation Helpers (`lib/game/calculations.ts`)

```typescript
export function calculateUnitEfficiencyBonus(units: Unit[]): number {
  return units.reduce((sum, unit) => sum + unit.efficiency, 0);
}

export function calculateMaintenanceMultiplier(unitBonus: number): number {
  return 1 + (unitBonus * 0.5); // 50% increase per efficiency point
}
```

### 3. UI Display (`components/ui/BuildingCard.tsx`)

```typescript
// Calculate and display scaled rates
const unitBonus = assignedCount * avgUnitEfficiency;
const totalEfficiency = building.efficiency + unitBonus;
const maintenanceMultiplier = 1 + (unitBonus * 0.5);

// Show in UI
<span>+{(rate * totalEfficiency).toFixed(1)}/s</span>
<span>-{(cost * maintenanceMultiplier).toFixed(1)}/s</span>
```

## Strategic Considerations

### Early Game
- Assign 1-2 units per building
- Focus on stable resource flow
- Avoid over-assignment (input starvation)

### Mid Game
- Scale up to 3-4 units per building
- Build redundant production chains
- Monitor resource bottlenecks

### Late Game
- Max out 5 units per building
- Optimize unit types per building
- Balance decay rates vs efficiency

## Balancing Notes

**Current multipliers:**
- Output: Linear scaling (1:1 with unit efficiency)
- Input: 50% scaling (0.5:1 with unit efficiency)

**Why 50%?**
- Prevents exponential resource drain
- Rewards strategic assignment
- Creates meaningful choices

**Tuning parameters:**
```typescript
// In calculations.ts
const INPUT_SCALING_FACTOR = 0.5; // Adjust this to balance difficulty
```

## Future Enhancements

- [ ] Unit specialization bonuses (right unit type = extra boost)
- [ ] Building upgrades reduce input scaling
- [ ] Research tree to improve efficiency
- [ ] Unit training to increase base efficiency
- [ ] Automation: auto-assign idle units

## Testing Scenarios

### Scenario 1: Bone Mill Scaling
```
Base: 2 flesh/s output, 5 bone/s input
+1 Zombie (0.6): 3.2 flesh/s, 6.5 bone/s
+2 Zombies (1.2): 4.4 flesh/s, 8.0 bone/s
+5 Zombies (3.0): 8.0 flesh/s, 12.5 bone/s
```

### Scenario 2: Resource Starvation
```
Bone Mill needs 8 bone/s
Morgue produces 5 bone/s
Result: Bone Mill halts (canProduce = false)
Solution: Add more Morgues or reduce Bone Mill workers
```

## Debugging

**Check production in console:**
```javascript
// In browser console
const store = useGameStore.getState();
store.buildings.forEach(b => {
  console.log(b.type, 'units:', b.assigned_units?.length);
});
```

**Monitor resource rates:**
```javascript
// Watch resources change
setInterval(() => {
  console.log(useGameStore.getState().resources);
}, 1000);
```
