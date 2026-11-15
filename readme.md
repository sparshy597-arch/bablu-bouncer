Bablu Bouncer

Bablu Bouncer is an open-world three-dimensional driving and vehicle survival game built directly for modern web browsers. Players take control of an agile vehicle navigating an expansive floating sandbox territory composed of interconnected thematic districts, ranging from high-speed circuits and skate parks to rugged badlands and obstacle courses. The core experience balances arcade driving mechanics with evasive maneuvers, challenging players to explore the world while surviving aggressive monster trucks patrolling the territory.

Gameplay Overview

Survival depends on agility, map awareness, and momentum. The map is actively hunted by heavy-duty monster trucks that initiate pursuit whenever the player approaches. Players must utilize natural terrain, elevation changes, ramps, speed boosts, and tight drift turns to dodge direct impacts and escape pursuit. While repeated hits damage vehicle integrity, successful evasive maneuvers, ramp jumps, and near-miss dodges reward players with opportunities to continue their run.

Beyond the survival threat, the world features numerous interactive environments and milestones. Players can race through timed checkpoint courses on the grand prix circuit, interact with a full-scale physics bowling alley, trigger environmental events, discover hidden secrets across distant landmarks, and complete over twenty-five gameplay objectives.

Controls

Steering and acceleration are handled using either WASD or the arrow keys on a standard keyboard. Nitro boost is engaged using the spacebar or shift keys, while handbraking and drifting are performed using the spacebar or B key. Players can trigger the vehicle horn using H, or activate an electrical pulse to stun oncoming monster vehicles using the L key. If the vehicle is overturned or wedged against steep obstacles, pressing R resets the car to the nearest road checkpoint.

Full gamepad support is integrated for standard controllers, utilizing the left analog stick or directional pad for steering, triggers for acceleration and braking, and standard face buttons for boost and handbrake actions.

Technical Architecture and Compatibility

The project is built on Three.js utilizing modern node materials alongside the Rapier three-dimensional physics engine compiled to WebAssembly. The engine simulates dynamic raycast vehicle suspension, real-time wheel contacts, tire friction, and impulse responses. Visuals feature custom cartoon toon shading, dynamic directional shadows, and screen-space post-processing.

To guarantee universal stability across all consumer devices, the rendering pipeline features an automated multi-layer fallback architecture. The renderer supports WebGPU on compatible systems while automatically falling back to WebGL2 on older integrated graphics chipsets, avoiding driver incompatibilities and ensuring high-framerate performance on laptops, desktops, and mobile devices without requiring browser extensions or local installation.

Local Development and Setup

To run the project locally, install Node.js version 18 or higher. Install the project dependencies by executing npm install in the project directory, then start the local development server with npm run dev. The application can be viewed by navigating to http://localhost:5173/ in any modern browser. To compile an optimized static bundle for deployment, run npm run build.

Credits

Bablu Bouncer was designed and developed by Sparsh and Divydev.
