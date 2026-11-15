# SPARSH - 3D Open World Driving Game & Portfolio

An interactive, high-performance 3D driving exploration game built for the modern web browser using **Three.js (WebGPU/WebGL)**, **Rapier Physics (WASM)**, and **Vite**.

Drive an agile vehicle across a stylized floating island, conquer high-speed racetracks, knock down giant bowling pins, bake cookies in a colossal oven, trigger ancient cataclysms at the dark altar, unlock over 25 unique achievements, and even **time travel 5 seconds back in time** when you make a mistake!

---

## 📖 The Story & Concept

You awaken as the driver of an exploratory vehicle in the surreal world of **SPARSH**.

The floating world is filled with curious landmarks, forgotten structures, and chaotic interactive physics playgrounds:
- An ancient **Landing Sanctuary** with an eternal bonfire (inspired by the bonfires of Dark Souls and Elden Ring) that allows you to reset reality whenever the world has fallen into chaos.
- A legendary **Grand Prix Circuit** featuring tight corners, bouncing air dancers, turbo pads, obstacles, and an electronic leaderboard tracking your lap times.
- A **Gigantic Bowling Alley** with physics-driven pins, movable safety bumpers, and a retro jukebox playing lo-fi beats.
- An eccentric **Cookie Factory** where you can blast endless stacks of freshly baked cookies out of a high-power industrial oven into the open air.
- A forbidden **Altar of Chaos** adorned with glowing demonic runes and a bottomless sacrificial void. Driving into it sacrifices your vehicle to the dark forces and advances the global Cataclysm counter.
- A secret **Moonlit Outhouse**, explosive TNT crates hidden across islands, breakable monuments, and dynamic weather storms where lightning strikes can shock your chassis.

---

## 🗺️ Areas & Interactive Missions

| Area | Location & Role | Gameplay & Secrets |
|---|---|---|
| **Landing Sanctuary** | Central hub where your adventure begins. | • **Bonfire ("Res(e)t")**: Park at the bonfire to restore all broken crates and knocked-over items.<br>• **Information Kiosk**: Opens the world minimap.<br>• **Controls Board**: Displays keyboard, touch, and gamepad configurations. |
| **The Circuit (Race Track)** | High-speed neon racing course. | • **Starting Grid**: Pull onto the grid to trigger the 3-2-1 countdown lights.<br>• **Checkpoints & Obstacles**: Speed through every checkpoint without flying off the rails.<br>• **KA-CHOW! Mission**: Complete a full lap in under 30 seconds for the ultimate racing achievement! |
| **Mega Bowling Alley** | Full-scale physics bowling arena. | • **Pin Deck**: 10 dynamic pins with real mass and impact sound effects.<br>• **Interactive Bumpers**: Toggle raised bumpers to guarantee your ball stays on track.<br>• **Jukebox**: Change between custom background music tracks.<br>• **Strike**: Knock down all 10 pins in one go to trigger confetti celebrations! |
| **The Cookie Stand** | Whimsical automated bakery. | • **Oven Blast**: Press interact at the cookie counter to shoot cookies out of the chimney.<br>• **Cookie Clicker Milestones**: Bake 1, 10, 100, and 1,000 cookies to unlock baking titles! |
| **Altar of Chaos** | Dark mystical pit with ominous red beams. | • **Sacrifice Zone**: Drive into the beam to disintegrate your vehicle and hear the death bell chime.<br>• **The Cataclysm**: Advance the sacrificial ritual counter. |
| **The Latrine (Outhouse)** | Hidden rustic wooden outhouse. | • **Candlelight**: Only lights up under the night cycle.<br>• **Do Not Disturb**: Ram the cabin at high speed to tip it over! |
| **Hall of Achievements** | Monument grounds tracking your progress. | • Live podium and trophy statues that light up as you complete each mission. |
| **Open Sea & Skies** | The surrounding ocean and airspace. | • Drive off the edge into deep water to unlock the **"Under the sea"** achievement.<br>• Hit jumps or ramp up obstacles to reach 15m altitude for the **"Limit the sky"** achievement! |

---

## 🏆 Key Achievements & Missions

Here are some of the secret and public missions you can complete:

1. **"I’m going on an adventure!"**: Leave the initial Landing Area.
2. **"Traveler"**: Visit all 13 areas across the map.
3. **"KA-CHOW!"**: Finish the Circuit race in less than 30 seconds.
4. **"F*** it, dude. Let's go bowling"**: Score a clean strike at the bowling alley.
5. **"One for the god of Chaos"**: Sacrifice your car into the glowing Altar.
6. **"Wake & bake" / "Cookie Clicker"**: Bake up to 1,000 cookies at the cookie stand.
7. **"Do not disturb"**: Knock down the latrine cabin.
8. **"Teeth first" & "Flip of faith"**: Land a clean front flip or back flip on all four wheels.
9. **"Great Explosion Murder God Dynamight"**: Find and blow up all 20 explosive TNT crates.
10. **"1.21 Gigawatts!"**: Get struck by real lightning during a thunderstorm.
11. **"Lowrider"**: Trigger the hydraulic vehicle suspensions.
12. **"Don't you have work to do?"**: Stay in the game through an entire day/night cycle.
13. **"Up up down down…"**: Enter the legendary Konami code on your keyboard!

---

## 🎮 Controls

### Keyboard & Mouse
- **Drive / Steer**: `W, A, S, D` or `Arrow Keys`
- **Turbo Boost**: `Left Shift` or `Right Shift`
- **Handbrake**: `Space` or `B` / `Ctrl`
- **⏳ Time Travel (Rewind 5s)**: `T` or `Z` *(or click the on-screen ⏳ button)*
- **Reset / Respawn**: `R`
- **Horn**: `H`
- **Interact / Action**: `E`, `Enter`, or `F`
- **Hydraulic Suspensions**: `Numpad 1-9` (or `Space` for full bounce)
- **Minimap**: Click the Map icon on the top right
- **Menu / Settings**: Click the Hamburger menu icon on the top right

### Gamepad (Xbox / PlayStation / Generic)
- **Steer**: `Left Stick` / `D-Pad`
- **Accelerate / Brake**: `R2 / RT` (Accelerate), `L2 / LT` (Reverse/Brake)
- **Turbo Boost**: `B / Circle`
- **Handbrake**: `X / Square`
- **⏳ Time Travel**: `L1 / LB`
- **Interact**: `A / Cross`
- **Respawn**: `Select / Back`
- **Horn**: `L3 (Left Stick Click)`

---

## ⚡ 60 FPS Performance Optimizations

The game has been tuned to deliver a smooth 60 FPS:
- **Optimized Pixel Ratio**: Capped to `1.25` on high-DPI/Retina screens to avoid 4x overdraw and eliminate GPU stuttering.
- **Lightweight Post-Processing**: Optimized `cheapDOF` sampling passes (reduced by 76%) to provide realistic depth-of-field without fragment shader bottlenecks.
- **Efficient Shadow Maps**: Balanced shadow cascade map size to `1024` for crisp shadows with low VRAM usage.
- **Hardware Acceleration**: Built with Three.js WebGPU pipeline with automatic WebGL2 fallback.

---

## 🚀 Running the Game Locally

### Prerequisites
- [Node.js](https://nodejs.org/en/download/) (v18 or higher recommended)

### Quick Start
```bash
# 1. Install dependencies
npm install --force

# 2. Start the local development server
npm run dev

# 3. Open in your browser
# Navigate to: http://localhost:5173/
```

### Production Build
```bash
# Create optimized production bundle in dist/
npm run build

# Preview production build locally
npm run preview
```
