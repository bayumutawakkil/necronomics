# Necroconomics

Dokumentasi teknis dan desain untuk **Necroconomics**, incremental colony-management
game berbasis web dengan tema ekonomi undead. Dokumen ini menggambarkan perilaku yang
tersedia di source code saat ini, bukan rencana balance hipotetis.

> **Status dokumentasi:** sesuai implementasi yang ada di branch ini. Nilai pada
> tabel di bawah bersumber dari [`lib/game/constants.ts`](../lib/game/constants.ts)
> dan definisi riset bersumber dari [`lib/game/researches.ts`](../lib/game/researches.ts).

## 1. Gambaran Umum Game

### Nama

**Necroconomics — The Dead Economy**

### Konsep dan tema

Pemain mengelola koloni industri yang seluruh ekonominya digerakkan oleh kematian.
Mayat dipanen dan diproses menjadi tulang serta daging, lalu digunakan untuk
membangun fasilitas dan membangkitkan tenaga kerja undead. Setiap undead memiliki
efisiensi, biaya pemeliharaan, dan sebagian besar memiliki tingkat pembusukan.

Tiga pilar desain:

1. **Death as Resource** — corpse adalah bahan baku awal ekonomi.
2. **Decay as Time Pressure** — unit yang membusuk akhirnya mati dan harus diganti.
3. **Dark Absurdism** — sistem manajemen yang serius dengan presentasi necromantic
   yang absurd.

### Tujuan pemain

Tujuan operasional pemain adalah:

- membangun rantai produksi yang stabil;
- mengubah corpse menjadi resource tingkat lanjut;
- menambah dan menempatkan undead ke fasilitas yang tepat;
- mengatasi biaya input, biaya maintenance, dan decay;
- membuka unit serta riset lanjutan;
- mencapai fase progres yang lebih tinggi berdasarkan jumlah corpse yang diproses.

Belum ada kondisi menang final, prestige, atau reset untuk bonus permanen pada
implementasi saat ini.

### Loop utama gameplay

1. **Harvest** corpse secara aktif atau menunggu natural spawning.
2. **Butcher** 5 corpse menjadi 8 bone dan 4 flesh.
3. Gunakan bone/flesh untuk **raise undead** dan **membangun fasilitas**.
4. **Assign** worker ke fasilitas yang sesuai.
5. Setiap detik, fasilitas mengonsumsi input dan menghasilkan output jika input cukup.
6. Pantau resource flow, freshness, dan bottleneck.
7. Buka unit baru melalui milestone dan buka riset melalui resource serta
   prerequisite.
8. Biarkan game berjalan untuk memperoleh passive income, termasuk offline progress
   ketika pemain kembali.

## 2. Mekanik Gameplay

### 2.1 Resource dan currency

Game tidak memiliki currency tunggal. Ekonomi menggunakan delapan resource:

| Resource | Fungsi utama |
|---|---|
| `corpse` | Bahan baku awal; dipanen, muncul secara natural, dan dipakai untuk membuat unit tertentu. |
| `bone` | Resource konstruksi, unit maintenance, dan banyak biaya riset. |
| `flesh` | Produk butcher dan biaya zombie/ghoul serta riset. |
| `soul_residue` | Produk Necro Factory; dipakai untuk ghost, vampire, dan riset tingkat lanjut. |
| `necrotic_cement` | Tipe resource yang sudah tersedia di model data, tetapi belum memiliki sumber produksi aktif di konfigurasi saat ini. |
| `biomatter_fuel` | Output Decay Pit. |
| `magic_battery` | Tipe resource yang sudah tersedia di model data, tetapi belum memiliki sumber produksi aktif di konfigurasi saat ini. |
| `ritual_energy` | Output Ritual Chamber dan biaya vampire. |

State awal:

```ts
{
  corpse: 10,
  bone: 0,
  flesh: 0,
  soul_residue: 0,
  necrotic_cement: 0,
  biomatter_fuel: 0,
  magic_battery: 0,
  ritual_energy: 0
}
```

Resource card menampilkan jumlah yang dibulatkan untuk tampilan (`K`, `M`, `B`),
rate per detik, dan progress bar visual dengan default kapasitas tampilan 2.000.
Kapasitas tersebut hanya visual; resource tidak dibatasi oleh angka 2.000.

### 2.2 Income aktif

#### Harvest corpse

Tombol **Harvest Corpse** menambah `+1 corpse` secara langsung.

#### Butcher corpse

Tombol butcher membutuhkan minimal 5 corpse:

```text
5 corpse -> 8 bone + 4 flesh
```

Setiap aksi ini juga menambah:

- `stats.total_corpses_processed` sebesar 5;
- `totalCorpsesProcessed` sebesar 5.

### 2.3 Income pasif

Game loop berjalan setiap 1.000 ms. Pada setiap tick:

- building aktif mencoba mengonsumsi input dan memproduksi output;
- setiap unit membayar maintenance;
- freshness unit berkurang;
- ada peluang 1% untuk menghasilkan 1 corpse natural;
- rate resource dihitung ulang untuk UI.

Natural spawning tersebut setara dengan ekspektasi rata-rata `0.01 corpse/s`,
tetapi hasil aktual tetap acak per tick.

### 2.4 Unit undead

| Unit | Efisiensi | Decay freshness/tick | Maintenance default | Peran utama |
|---|---:|---:|---|---|
| Skeleton | 0,8 | 0,02 | 0,08 bone/s | Morgue, Graveyard |
| Zombie | 0,6 | 0,05 | 0,08 bone/s | Bone Mill |
| Ghoul | 0,7 | 0,03/tick | 0,10 bone/s | Decay Pit |
| Ghost | 0,9 | 0,01 | 0,12 bone/s | Necro Factory |
| Vampire | 1,0 | 0,00 | 0,15 bone/s | Ritual Chamber |

Semua unit dibuat dengan `freshness: 100`. Unit dengan decay rate `0` (vampire)
ditampilkan sebagai immortal. Unit lain mati ketika freshness mencapai 0.

Ketika unit mati:

- unit dihapus dari populasi;
- assignment ke building dibersihkan;
- `unitCurrentCounts[type]` berkurang;
- koloni menerima `+2 bone` dan `+3 flesh`.

`insanity_risk` sudah tersimpan pada data unit, tetapi belum dipakai dalam
`processTick`; belum ada perilaku rogue/insanity yang berjalan di UI.

### 2.5 Biaya pembuatan unit dan gating

Biaya dasar unit didefinisikan sebagai berikut:

| Unit | Biaya dasar |
|---|---|
| Skeleton | 1 corpse + 5 bone |
| Zombie | 2 corpse + 3 bone + 5 flesh |
| Ghoul | 3 corpse + 8 bone + 10 flesh |
| Ghost | 10 soul residue + 5 bone |
| Vampire | 20 ritual energy + 5 soul residue + 10 bone |

Biaya setiap tipe unit naik berdasarkan jumlah unit tipe tersebut yang masih hidup:

```text
multiplier = 1.1 ^ currentAliveCount
scaledCost = ceil(baseCost × multiplier)
```

Saat unit mati, `currentAliveCount` turun sehingga biaya berikutnya dapat turun
kembali. `unitCreatedCounts` tetap menyimpan jumlah total yang pernah dibuat.

Gating unit yang aktif:

- Skeleton tersedia sejak awal.
- Zombie terbuka setelah `50` corpse diproses.
- Ghoul tersedia sejak awal; tidak memiliki prerequisite khusus.
- Ghost terbuka setelah `5` building dibuat.
- Vampire terbuka setelah `10` building dibuat.
- Ghoul tidak memiliki pengecekan unlock di handler halaman Colony saat ini,
  walaupun tipe dan biaya ghoulnya sudah didefinisikan.

### 2.6 Building dan produksi

Semua building dibuat pada level 1 dengan `efficiency: 1.0`, aktif, dan maksimal
5 worker per building. Building dapat di-upgrade sampai level 10. Biaya pada tabel
adalah biaya pembangunan awal dalam bone.

| Building | Biaya | Output dasar | Input dasar | Preferred unit |
|---|---:|---|---|---|
| Graveyard | 20 bone | 1,00 corpse/s | 0,10 bone/s | Skeleton |
| Morgue | 30 bone | 1,50 bone/s | 0,20 bone/s | Skeleton |
| Bone Mill | 50 bone | 2,00 flesh/s | 2,00 bone/s | Zombie |
| Necro Factory | 100 bone | 0,20 soul residue/s | 0,30 bone/s | Ghost |
| Ritual Chamber | 150 bone | 0,10 ritual energy/s | 0,50 bone/s | Vampire |
| Decay Pit | 200 bone | 0,15 biomatter fuel/s | 0,60 bone/s | Ghoul |

#### Upgrade building

Upgrade dilakukan per building dari kartu **Infrastructure**. Biaya upgrade selalu
menggunakan biaya dasar building dan level tujuan:

```text
newLevel = currentLevel + 1
upgradeCost = ceil(baseBuildingCost × newLevel^1.5) bone
newEfficiency = 1.2^(newLevel - 1)
```

Contoh Bone Mill:

```text
Level 1 -> 2: ceil(50 × 2^1.5) = 142 bone; efficiency 1.00 -> 1.20
Level 2 -> 3: ceil(50 × 3^1.5) = 260 bone; efficiency 1.20 -> 1.44
```

Upgrade ditolak jika building tidak ditemukan, sudah level maksimum, atau resource
bone tidak mencukupi. Saat berhasil, resource langsung dikurangi dan field
`building.level` serta `building.efficiency` diperbarui. Karena output memakai
efficiency building pada setiap tick, produksi meningkat tanpa perlu membangun ulang.

> Nilai di atas adalah nilai runtime pada [`constants.ts`](../lib/game/constants.ts).
> Dokumentasi lama mungkin memuat angka berbeda.

#### Assignment worker

Tombol **Assign** mencari unit idle dari tipe preferred building, kemudian
menempatkannya ke slot kosong pada building pertama yang tersedia dari tipe itu.
Tombol **Remove** melepas satu unit yang sedang bekerja pada tipe building
tersebut.

Unit dapat dipindahkan antar-building. Assignment disimpan dua arah:

- `unit.assigned_to` menyimpan ID building;
- `building.assigned_units` menyimpan daftar ID unit.

#### Formula produksi dan input

Untuk satu building:

```text
unitBonus = Σ efficiency(unit yang di-assign)
totalEfficiency = building.efficiency + unitBonus
maintenanceMultiplier = 1 + (unitBonus × 0,5)

output/s = baseProductionRate × totalEfficiency
input/s  = baseMaintenanceCost × maintenanceMultiplier
```

Contoh Bone Mill dengan dua zombie:

```text
unitBonus = 0,6 + 0,6 = 1,2
output = 2,0 × (1,0 + 1,2) = 4,4 flesh/s
input  = 2,0 × (1 + 1,2 × 0,5) = 3,2 bone/s
```

Produksi bersifat transaksional per building: semua input building harus
terjangkau terlebih dahulu. Jika salah satu input tidak cukup, building tidak
memproduksi dan tidak mengurangi input pada tick tersebut. Maintenance unit tetap
dikurangi secara terpisah dan di-clamp ke nol.

> UI `BuildingCard` menghitung tampilan berdasarkan tipe preferred unit dan
> jumlah worker. Kalkulasi runtime menggunakan objek unit aktual, sehingga
> angka UI dapat berbeda jika unit non-preferred dimasukkan melalui state/API.

### 2.7 Progression phase

Phase ditentukan oleh `stats.total_corpses_processed`:

| Phase | Ambang |
|---|---:|
| Early | < 100 |
| Mid | >= 100 |
| Late | >= 1.000 |
| Endgame | >= 10.000 |

Saat ini phase terutama merupakan indikator progres; belum ada modifier produksi
yang otomatis diberikan berdasarkan phase.

### 2.8 Research sebagai sistem upgrade

Research adalah upgrade asynchronous, bukan prestige. Hanya satu riset yang dapat
berjalan pada satu waktu. Saat riset dimulai, biayanya langsung dikurangi; progress
bertambah 1 detik setiap game tick dan selesai saat mencapai 100%.

Riset tersedia jika:

- belum selesai;
- tidak memiliki prerequisite yang belum selesai;
- syarat corpse/building terpenuhi;
- resource cost tersedia.

#### Daftar riset

| Riset | Kategori | Biaya | Durasi | Syarat | Efek yang didefinisikan |
|---|---|---|---:|---|---|
| Basic Necromancy | Efficiency | 50 bone | 30 s | - | Skeleton efficiency +0,20 |
| Advanced Reanimation | Efficiency | 100 bone + 50 flesh | 60 s | Basic Necromancy; 50 corpse | Zombie efficiency +0,25 |
| Spectral Mastery | Efficiency | 50 soul residue + 150 bone | 90 s | Advanced Reanimation; 5 building | Ghost efficiency +0,15 |
| Efficient Harvesting | Production | 80 bone | 45 s | - | Morgue production ×1,5 |
| Industrial Processing | Production | 150 bone + 80 flesh | 60 s | Efficient Harvesting | Bone Mill production ×1,4 |
| Mass Production | Production | 300 bone + 200 flesh + 50 soul residue | 120 s | Industrial Processing; 10 building | Semua building production ×1,25 |
| Preservation Techniques | Units | 60 bone + 30 flesh | 40 s | - | Skeleton decay rate -50% |
| Reinforced Bodies | Units | 120 bone + 80 flesh | 60 s | Preservation Techniques | Zombie decay rate -40% |
| Eternal Binding | Units | 250 bone + 100 soul residue | 90 s | Reinforced Bodies; 200 corpse | Semua decay rate -30% |
| Expanded Facilities | Buildings | 100 bone + 50 flesh | 50 s | - | Kapasitas worker/building +2 |
| Optimized Workflow | Buildings | 180 bone + 100 flesh | 70 s | Expanded Facilities | Maintenance building -25% |
| Mega Structures | Buildings | 400 bone + 250 flesh + 100 soul residue | 120 s | Optimized Workflow; 15 building | Kapasitas worker/building +3 |
| Efficient Necromancy | Units | 70 bone | 35 s | - | Biaya Skeleton -20% |
| Bulk Reanimation | Units | 140 bone + 70 flesh | 55 s | Efficient Necromancy | Biaya Zombie -20% |

**Catatan implementasi:** efek riset dihitung secara dinamis dari daftar
`completedResearches` melalui `getUnitEffectiveStats` dan
`getBuildingEffectiveStats` pada [`calculations.ts`](../lib/game/calculations.ts).
Dengan demikian riset yang selesai memengaruhi unit/building yang sudah ada maupun
yang dibuat setelahnya. Modifier yang diterapkan meliputi efficiency, production,
maintenance building, decay, biaya unit, dan kapasitas worker.

### 2.9 Milestone dan achievement

Belum ada sistem achievement terpisah. Milestone yang aktif adalah:

- jumlah corpse diproses untuk phase dan unlock Zombie;
- jumlah building untuk unlock Ghost dan Vampire;
- jumlah building/corpse untuk prerequisite research;
- statistik colony: tick, uptime, corpse processed, undead created, building built.

## 3. Struktur Teknis

### 3.1 Framework dan library

| Teknologi | Peran |
|---|---|
| Next.js 16 App Router | Framework aplikasi dan routing halaman |
| React 19 | Komponen UI |
| TypeScript | Tipe game dan kode aplikasi |
| Tailwind CSS 4 | Styling dan responsive layout |
| Zustand | State management |
| Zustand `immer` middleware | Mutasi state bergaya mutable yang aman |
| Zustand `persist` middleware | Persistensi state ke browser storage |
| Supabase JS | Backup/load save cloud |
| `uuid` | ID unit, building, dan save |
| Framer Motion / Headless UI | Dependensi UI yang tersedia pada project |

Manifest lengkap ada di [`package.json`](../package.json).

### 3.2 Struktur folder

```text
app/
  page.tsx                 # Halaman Colony dan handler aksi utama
  research/page.tsx        # Halaman Research Lab
  layout.tsx               # Root layout dan metadata
  globals.css              # Tema, animasi, dan global styling

components/ui/
  ResourceCard.tsx         # Jumlah dan rate resource
  UnitCard.tsx             # Unit, freshness, efficiency, maintenance
  BuildingCard.tsx         # Produksi dan assignment worker
  ResourceRatesPanel.tsx   # Ringkasan inflow/outflow
  StatsPanel.tsx           # Analytics dan economic ledger
  GamePanel.tsx            # Panel collapsible
  Toast.tsx                # Notifikasi
  ActionButton.tsx         # Tombol aksi reusable
  Icons.tsx                # Icon game

stores/
  useGameStore.ts          # State ekonomi, entity, tick, dan persist game
  useResearchStore.ts      # Progress dan status research
  useUIStore.ts            # Panel, modal, selection, notification

lib/
  game/constants.ts        # Konfigurasi, stat unit, stat building
  game/calculations.ts     # Pure calculation helpers
  game/researches.ts       # Definisi research tree
  game/debug.ts            # Utilitas debug development
  hooks/useGameLoop.ts     # Tick loop dan offline progress
  supabase.ts              # Client Supabase

types/
  game.ts                  # Resource, Unit, Building, GameState, UIState
  research.ts              # Research dan ResearchState

docs/
  GAME_DOCUMENTATION.md    # Dokumen ini
  QUICK_REFERENCE.md       # Referensi cepat assignment/formula
  UNIT_BUILDING_SYSTEM.md  # Penjelasan detail worker/building
```

### 3.3 Arsitektur state management

Terdapat tiga store Zustand:

1. **`useGameStore`** — canonical state untuk ekonomi dan simulasi.
2. **`useResearchStore`** — state research yang dipersist terpisah.
3. **`useUIStore`** — state presentasi yang tidak termasuk save ekonomi.

Update ekonomi dilakukan melalui action store (`addResource`, `addUnit`,
`addBuilding`, `assignUnitToBuilding`, `processTick`). Komponen halaman membaca
slice store melalui selector agar re-render tetap terarah. State game dan research
menggunakan `persist` dengan key:

```text
necroconomics-game-state
necroconomics-research-state
```

Contoh alur tick yang disederhanakan:

```ts
useEffect(() => {
  const interval = setInterval(() => {
    useGameStore.getState().processTick();
    useResearchStore.getState().updateResearchProgress(1);
  }, GAME_CONFIG.TICK_INTERVAL);

  return () => clearInterval(interval);
}, []);
```

Implementasi penuh ada di [`useGameLoop.ts`](../lib/hooks/useGameLoop.ts) dan
[`useGameStore.ts`](../stores/useGameStore.ts).

## 4. Data Game dan Formula

### 4.1 Model data utama

`GameState` menyimpan:

- identitas: `colony_name`, `save_id`, `user_id`;
- `resources` dan `resourceRates`;
- array `units`, `buildings`, dan `productionChains`;
- cost multiplier serta counter unit;
- `tick`, `lastSaved`, `gamePhase`, dan `totalCorpsesProcessed`;
- statistik agregat.

`ProductionChain` sudah tersedia sebagai tipe data, tetapi belum digunakan oleh
handler produksi aktif; produksi runtime saat ini langsung berasal dari building.

### 4.2 Kalkulasi yang tersedia

Helper pure utama di [`calculations.ts`](../lib/game/calculations.ts):

- `calculateTotalResourceRates` — rate agregat building dan unit;
- `calculateBuildingProduction` — output satu building dengan worker;
- `calculateBuildingMaintenance` — input satu building dengan worker;
- `calculateUnitCost` — scaling biaya unit;
- `calculateOfflineProgress` — jumlah tick offline dengan cap;
- `calculateBuildingEfficiency` — formula level `1,2^(level - 1)`;
- `calculateResourceFlowBreakdown` — ledger gains/losses.

`calculateBuildingEfficiency` dipanggil oleh action `upgradeBuilding`; construction
selalu dimulai dari level 1 dengan efficiency 1,0.

Contoh penggunaan kalkulasi:

```ts
import {
  calculateBuildingProduction,
  calculateBuildingMaintenance,
} from '@/lib/game/calculations';

const fleshPerSecond = calculateBuildingProduction(
  building.production_rate.flesh ?? 0,
  building.efficiency,
  assignedUnits,
);

const bonePerSecond = calculateBuildingMaintenance(
  building.maintenance_cost.bone ?? 0,
  assignedUnits,
);
```

### 4.3 Multiplier dan modifier

Modifier yang aktif dalam simulasi:

- unit efficiency menambah output secara linear;
- worker efficiency juga menaikkan input melalui multiplier 0,5;
- biaya unit naik 10% eksponensial per unit hidup dari tipe yang sama;
- building yang tidak aktif tidak memproduksi;
- level building meningkatkan efficiency dengan faktor 1,2 per level;
- produksi berhenti jika input building tidak cukup;
- unit maintenance diambil tiap tick dan tidak membuat resource negatif.

Modifier research yang diterapkan secara runtime:

- production multiplier research;
- unit efficiency bonus research;
- unit cost reduction research;
- maintenance reduction research pada building;
- decay reduction research;
- max worker increase research.

## 5. Penyimpanan dan Loading

### 5.1 Local save

Zustand `persist` menyimpan state game secara otomatis ke browser storage setiap
terjadi perubahan state. Save game mencakup data yang ada dalam `GameState`,
termasuk resource, unit, building, counter, tick, phase, timestamp, dan statistik.
Research disimpan terpisah oleh `useResearchStore`.

Auto-save timestamp game diperbarui setiap 60 tick:

```ts
if (state.tick % 60 === 0) {
  state.lastSaved = Date.now();
}
```

Karena interval tick adalah 1 detik, ini setara satu kali penandaan auto-save per
60 detik. Persist middleware tetap dapat menulis perubahan state lain sebelum
timestamp tersebut berubah.

### 5.2 Offline progress

Saat halaman dimuat, game menghitung:

```text
offlineTicks = min(floor((now - lastSaved) / 1000), 28.800)
```

Cap 28.800 tick berarti maksimal 8 jam. Setiap offline tick lalu diproses melalui
`processTick`, sehingga produksi, maintenance, decay, dan random corpse spawning
diproses ulang. Offline progress berjalan di client saat mount, bukan melalui
server job.

### 5.3 Cloud backup Supabase

Cloud save bersifat opsional dan dipicu dari menu **Cloud Save**. Alurnya:

1. Generate UUID jika colony belum memiliki `save_id`.
2. Ambil `getSaveData()` dari game store.
3. Cari row pada tabel `saves` berdasarkan ID.
4. `insert` jika belum ada, atau `update` jika sudah ada.
5. Load mengambil kolom `state` berdasarkan Save ID lalu melakukan `loadGame`.

Auto-sync cloud berjalan ketika `lastSaved` berubah (sekitar setiap 60 tick) dan
`save_id` tersedia. Kegagalan sync ditampilkan sebagai status error/notifikasi.
Konfigurasi client ada di [`lib/supabase.ts`](../lib/supabase.ts); kredensial
runtime harus disediakan melalui environment variable yang sesuai deployment.

## 6. UI/UX

### 6.1 Halaman Colony (`/`)

Header:

- branding **NECROCONOMICS** dan subtitle *The Dead Economy*;
- navigasi **Colony** dan **Research**;
- dropdown **Cloud Save**.

Resource strip:

- delapan `ResourceCard`;
- jumlah saat ini;
- rate `/s`;
- progress bar visual;
- flash warning jika resource baru saja habis.

Panel utama:

1. **Undead Army**
   - daftar unit berdasarkan tipe;
   - jumlah active;
   - freshness/rot state;
   - efficiency dan maintenance.
2. **Undead Incantations**
   - Raise Skeleton;
   - Raise Zombie;
   - Summon Ghost;
   - Turn Vampire.
3. **Construct Industrial Facilities**
   - Graveyard;
   - Morgue;
   - Bone Mill;
   - Necro Factory;
   - Ritual Chamber;
   - Decay Pit.
4. **Buildings / production**
   - jumlah building per tipe;
   - status Active/Halted;
   - yield dan input;
   - worker count;
   - Assign dan Remove.
5. **Resource Flow**
   - inflow/outflow per detik.
6. **Colony Stats**
   - panel yang dapat dibuka/tutup;
   - Colony Analytics;
   - Economic Ledger.

### 6.2 Halaman Research (`/research`)

Halaman Research Lab berisi:

- resource strip yang sama;
- ongoing research dengan progress bar dan tombol cancel;
- filter kategori: All, Efficiency, Production, Units, Buildings;
- kartu research dengan icon, deskripsi, cost, durasi, prerequisite, dan gating;
- status `available`, `locked`, `researching`, atau `completed`;
- kontrol Cloud Save yang sama.

### 6.3 Tombol utama

| Tombol | Fungsi |
|---|---|
| Harvest Corpse | Tambah 1 corpse aktif. |
| Butcher Corpses | Tukar 5 corpse menjadi 8 bone + 4 flesh. |
| Raise/Summon/Turn unit | Bayar biaya unit, buat unit baru, dan menambah counter. |
| Build facility | Bayar biaya bone dan menambah building aktif level 1. |
| Assign | Menempatkan unit preferred yang idle ke building yang punya slot. |
| Remove | Mengeluarkan satu worker dari tipe building terkait. |
| Start Research | Bayar cost dan memulai satu riset. |
| Cancel Research | Membatalkan riset berjalan; biaya tidak direfund. |
| Backup Colony State | Upload state ke Supabase. |
| New Save ID | Membuat UUID baru untuk target backup. |
| Load | Mengambil state Supabase berdasarkan Save ID. |
| Colony Analytics / Economic Ledger | Mengganti tab statistik. |

Notifikasi UI dibatasi maksimal lima item dan otomatis dihapus setelah lima detik.

## 7. Rencana Pengembangan dan Issue yang Diketahui

### 7.1 Fitur yang sudah tersedia sebagai fondasi

- research tree dan kategori sudah didefinisikan;
- upgrade building level 1-10 sudah tersedia;
- `ProductionChain` sudah tersedia pada type model;
- `insanity_risk` sudah tersedia pada data unit;
- cloud save/load Supabase sudah memiliki alur insert/update/load;
- debug utility tersedia untuk pemeriksaan building dan resource flow.

### 7.2 Fitur yang direncanakan/layak diprioritaskan

Prioritas implementasi berikut mengikuti gap antara model data dan perilaku runtime:

1. Implementasikan Ghoul unlock dan handler pembuatan Ghoul pada UI Colony.
2. Tambahkan event/achievement yang nyata, bukan hanya statistik milestone.
3. Implementasikan insanity/rogue event berdasarkan `insanity_risk`.
4. Gunakan `ProductionChain` untuk rantai input-output yang lebih eksplisit.
5. Tambahkan kemenangan, prestige, atau endgame loop jika desain membutuhkan
   replayability jangka panjang.
6. Tambahkan validasi/migrasi versi save agar perubahan schema lama lebih aman.

### 7.3 Bug atau issue yang diketahui

1. **Biaya research tidak direfund saat dibatalkan.** Ini adalah perilaku handler
   saat ini dan perlu diputuskan apakah memang intended.
2. **Ghoul belum dapat dibuat dari halaman Colony.** Data dan building Decay Pit
   tersedia, tetapi tidak ada handler raise ghoul pada `page.tsx`.
3. **Insanity belum diproses.** `shouldUnitGoInsane` tersedia, tetapi tidak
   dipanggil dari `processTick`.
4. **Beberapa resource belum memiliki producer aktif.** `necrotic_cement` dan
   `magic_battery` ada di type/state/UI, namun belum ada konfigurasi produksi.
5. **Offline progress memproses tick satu per satu di client.** Cap 8 jam berarti
   hingga 28.800 iterasi saat mount; ini dapat terasa berat pada perangkat lemah.
6. **Konsistensi ledger agregat perlu diawasi.** Runtime produksi memakai unit
   aktual per building, sedangkan beberapa tampilan agregat memakai asumsi tipe
   preferred dan pengelompokan building.
8. **`processDecay` kosong.** Decay saat ini sudah dilakukan langsung di
   `processTick`; action terpisah tersebut belum memiliki implementasi.

## Referensi source

- [`app/page.tsx`](../app/page.tsx) — UI Colony dan action handler.
- [`app/research/page.tsx`](../app/research/page.tsx) — UI Research dan cloud save.
- [`stores/useGameStore.ts`](../stores/useGameStore.ts) — state ekonomi dan tick.
- [`stores/useResearchStore.ts`](../stores/useResearchStore.ts) — research progress.
- [`stores/useUIStore.ts`](../stores/useUIStore.ts) — notification dan UI state.
- [`lib/game/constants.ts`](../lib/game/constants.ts) — angka balance.
- [`lib/game/calculations.ts`](../lib/game/calculations.ts) — formula pure.
- [`lib/game/researches.ts`](../lib/game/researches.ts) — research tree.
- [`types/game.ts`](../types/game.ts) dan [`types/research.ts`](../types/research.ts) —
  kontrak data.
