import * as THREE from 'three/webgpu'
import { Game } from './Game.js'
import gsap from 'gsap'

export class MonsterCar
{
    constructor(manager, options = {})
    {
        this.manager = manager
        this.game = Game.getInstance()

        this.name = options.name || 'Nemesis'
        this.baseSpeed = options.speed || 11.5
        this.speed = this.baseSpeed
        this.patrolRadius = options.patrolRadius || 30
        this.center = options.center ? options.center.clone() : new THREE.Vector3(65, 0, -65)
        this.colorHex = options.colorHex || '#ef4444'

        this.position = this.center.clone()
        this.rotationY = Math.random() * Math.PI * 2
        this.state = 'PATROL' // 'PATROL', 'HUNT', 'STUNNED'
        this.stunTimer = 0
        this.patrolAngle = Math.random() * Math.PI * 2
        this.patrolDirection = Math.random() > 0.5 ? 1 : -1
        this.target = new THREE.Vector3()

        this.chaseDistance = 24
        this.killDistance = 2.8
        this.evadeCooldown = 0

        this.setMesh()
    }

    setMesh()
    {
        this.group = new THREE.Group()
        this.group.position.copy(this.position)

        // Procedural stylized massive Monster Truck
        this.model = new THREE.Group()

        // Heavy armored monster chassis (1.5x scale)
        const bodyGeo = new THREE.BoxGeometry(2.6, 1.4, 4.4)
        const bodyMat = new THREE.MeshLambertNodeMaterial({
            color: 0x111116
        })
        const body = new THREE.Mesh(bodyGeo, bodyMat)
        body.position.y = 1.45
        body.castShadow = true
        this.model.add(body)

        // Armored Cabin with dark tint
        const cabGeo = new THREE.BoxGeometry(2.0, 1.1, 2.3)
        const cabMat = new THREE.MeshLambertNodeMaterial({
            color: 0x07070a
        })
        const cab = new THREE.Mesh(cabGeo, cabMat)
        cab.position.set(0, 2.45, -0.3)
        cab.castShadow = true
        this.model.add(cab)

        // 4 Giant Monster Truck Knobby Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.8, 16)
        wheelGeo.rotateZ(Math.PI / 2)
        const wheelMat = new THREE.MeshLambertNodeMaterial({ color: 0x18181f })

        const wheelPositions = [
            [-1.6, 0.95, 1.5],
            [1.6, 0.95, 1.5],
            [-1.6, 0.95, -1.5],
            [1.6, 0.95, -1.5]
        ]
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat)
            wheel.position.set(...pos)
            wheel.castShadow = true
            this.model.add(wheel)
        })

        // Glowing Evil Headlights
        const eyeGeo = new THREE.SphereGeometry(0.24, 8, 8)
        const eyeMat = new THREE.MeshBasicNodeMaterial({ color: new THREE.Color(this.colorHex) })

        this.leftEye = new THREE.Mesh(eyeGeo, eyeMat)
        this.leftEye.position.set(-0.75, 1.5, 2.25)
        this.model.add(this.leftEye)

        this.rightEye = new THREE.Mesh(eyeGeo, eyeMat)
        this.rightEye.position.set(0.75, 1.5, 2.25)
        this.model.add(this.rightEye)

        this.group.add(this.model)
        this.game.materials.updateObject(this.group)
        this.game.scene.add(this.group)
    }

    stun(duration = 4.0)
    {
        this.state = 'STUNNED'
        this.stunTimer = duration
        
        // Spin out animation
        gsap.to(this.group.rotation, {
            y: this.group.rotation.y + Math.PI * 2,
            duration: Math.min(1.5, duration),
            ease: 'power2.out'
        })
    }

    update(delta, playerPosition, activeHunting)
    {
        if(!playerPosition) return 999

        if(this.evadeCooldown > 0)
            this.evadeCooldown -= delta

        // Stunned State
        if(this.state === 'STUNNED')
        {
            this.stunTimer -= delta
            if(this.stunTimer <= 0)
            {
                this.state = 'PATROL'
            }
            return 999
        }

        // Distance to Player (XZ Plane)
        const dx = playerPosition.x - this.position.x
        const dz = playerPosition.z - this.position.z
        const distance = Math.hypot(dx, dz)

        // AI State Transitions
        if(activeHunting && distance < this.chaseDistance)
        {
            if(this.state !== 'HUNT')
            {
                this.state = 'HUNT'
                this.speed = this.baseSpeed * 1.25 // Turbo speed in hunt mode
                if(this.leftEye?.material) this.leftEye.material.color.set('#ff0000')
                if(this.rightEye?.material) this.rightEye.material.color.set('#ff0000')
                this.manager.onMonsterAggro(this, distance)
            }
            this.target.set(playerPosition.x, 0, playerPosition.z)
        }
        else
        {
            if(this.state !== 'PATROL')
            {
                this.state = 'PATROL'
                this.speed = this.baseSpeed
                if(this.leftEye?.material) this.leftEye.material.color.set(this.colorHex)
                if(this.rightEye?.material) this.rightEye.material.color.set(this.colorHex)
            }

            // Patrol path around center
            this.patrolAngle += delta * 0.35 * this.patrolDirection
            this.target.set(
                this.center.x + Math.cos(this.patrolAngle) * this.patrolRadius,
                0,
                this.center.z + Math.sin(this.patrolAngle) * this.patrolRadius
            )
        }

        // Steer towards target
        const targetAngle = Math.atan2(this.target.x - this.position.x, this.target.z - this.position.z)
        let diff = targetAngle - this.rotationY
        while(diff < -Math.PI) diff += Math.PI * 2
        while(diff > Math.PI) diff -= Math.PI * 2
        this.rotationY += diff * Math.min(1, delta * 3.2)
        this.group.rotation.y = this.rotationY

        // Move forward
        const moveDist = this.speed * delta
        this.position.x += Math.sin(this.rotationY) * moveDist
        this.position.z += Math.cos(this.rotationY) * moveDist

        // Ground elevation sampling
        if(this.game.world?.floor?.getElevation)
        {
            const elevation = this.game.world.floor.getElevation(this.position.x, this.position.z)
            this.position.y = elevation || 0
        }
        this.group.position.copy(this.position)

        // Suspension bobbing
        this.model.rotation.x = Math.sin(Date.now() * 0.01) * 0.05
        this.model.rotation.z = Math.cos(Date.now() * 0.01) * 0.04

        // Collision Check with Player
        if(distance < this.killDistance)
        {
            const playerY = playerPosition.y || 0
            const monsterY = this.position.y || 0
            if(playerY > monsterY + 1.6)
            {
                // Player jumped over monster truck!
                if(this.evadeCooldown <= 0)
                {
                    this.evadeCooldown = 3.0
                    this.manager.onPlayerEvaded(this, 'JUMP')
                }
            }
            else
            {
                // DIRECT RAM IMPACT!
                this.manager.onPlayerHit(this)
            }
        }
        else if(distance < 5.5 && this.state === 'HUNT' && this.evadeCooldown <= 0)
        {
            const playerSpeed = this.game.physicalVehicle?.xzSpeed || 0
            if(playerSpeed > 10)
            {
                this.evadeCooldown = 4.0
                this.manager.onPlayerEvaded(this, 'DODGE')
            }
        }

        return distance
    }

    destroy()
    {
        this.group.removeFromParent()
    }
}

export class MonsterCarsManager
{
    constructor()
    {
        this.game = Game.getInstance()
        this.monsterCars = []
        this.active = true
        this.isRespawning = false
        this.gracePeriod = 15.0 // 15 seconds grace period before active hunting starts
        this.elapsedTime = 0
        this.playerMaxHealth = 3
        this.playerHealth = 3
        this.hitCooldown = 0

        this.setAudioEngine()
        this.setUI()
        this.spawnMonsters()
        this.setEvents()

        // Game Ticker
        this.tickCallback = () =>
        {
            this.update()
        }
        this.game.ticker.events.on('tick', this.tickCallback, 7)
    }

    setUI()
    {
        // Only a clean damage vignette flash on impact - NO TEXT BANNERS ON SCREEN
        this.damageOverlay = document.createElement('div')
        this.damageOverlay.className = 'js-monster-damage'
        this.damageOverlay.style.cssText = 'position:fixed;inset:0;box-shadow:inset 0 0 120px rgba(220,38,38,0.9);opacity:0;pointer-events:none;z-index:99999;transition:opacity 0.2s ease;'
        document.body.appendChild(this.damageOverlay)
    }

    setAudioEngine()
    {
        // Dynamic procedural horror tension heartbeat synth via Web Audio API
        this.audioCtx = null
        this.tensionOsc = null
        this.tensionGain = null
        this.heartbeatTimer = 0

        const initAudio = () =>
        {
            if(!this.audioCtx)
            {
                const AudioContext = window.AudioContext || window.webkitAudioContext
                if(AudioContext)
                {
                    this.audioCtx = new AudioContext()
                    
                    // Low tension drone
                    this.tensionOsc = this.audioCtx.createOscillator()
                    this.tensionOsc.type = 'sawtooth'
                    this.tensionOsc.frequency.setValueAtTime(46, this.audioCtx.currentTime) // Low C#

                    // Filter to keep it deep & ominous
                    const filter = this.audioCtx.createBiquadFilter()
                    filter.type = 'lowpass'
                    filter.frequency.setValueAtTime(140, this.audioCtx.currentTime)

                    this.tensionGain = this.audioCtx.createGain()
                    this.tensionGain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime)

                    this.tensionOsc.connect(filter)
                    filter.connect(this.tensionGain)
                    this.tensionGain.connect(this.audioCtx.destination)
                    this.tensionOsc.start()
                }
            }
            if(this.audioCtx && this.audioCtx.state === 'suspended')
            {
                this.audioCtx.resume()
            }
        }

        window.addEventListener('keydown', initAudio, { once: true })
        window.addEventListener('click', initAudio, { once: true })
    }

    playHeartbeat(rateMultiplier = 1)
    {
        if(!this.audioCtx || this.audioCtx.state !== 'running') return

        const now = this.audioCtx.currentTime
        const osc = this.audioCtx.createOscillator()
        const gain = this.audioCtx.createGain()

        osc.type = 'sine'
        // Pitch drop for heavy heartbeat thump
        osc.frequency.setValueAtTime(80, now)
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.12)

        gain.gain.setValueAtTime(0.35, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

        osc.connect(gain)
        gain.connect(this.audioCtx.destination)

        osc.start(now)
        osc.stop(now + 0.16)

        // Second beat (lub-dub)
        setTimeout(() =>
        {
            if(!this.audioCtx || this.audioCtx.state !== 'running') return
            const now2 = this.audioCtx.currentTime
            const osc2 = this.audioCtx.createOscillator()
            const gain2 = this.audioCtx.createGain()
            osc2.type = 'sine'
            osc2.frequency.setValueAtTime(70, now2)
            osc2.frequency.exponentialRampToValueAtTime(28, now2 + 0.14)
            gain2.gain.setValueAtTime(0.28, now2)
            gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.16)
            osc2.connect(gain2)
            gain2.connect(this.audioCtx.destination)
            osc2.start(now2)
            osc2.stop(now2 + 0.17)
        }, 130 / rateMultiplier)
    }

    spawnMonsters()
    {
        // Monsters spawn FAR AWAY across the map (> 85m away from player) with wide distance between each other (> 150m)
        // 1. "Nemesis": At far corner of the Grand Prix Circuit track
        this.monsterCars.push(new MonsterCar(this, {
            name: 'Nemesis',
            speed: 12.0,
            colorHex: '#ef4444',
            center: new THREE.Vector3(65, 0, -65),
            patrolRadius: 35
        }))

        // 2. "Gorgon": In the far rugged badlands
        this.monsterCars.push(new MonsterCar(this, {
            name: 'Gorgon',
            speed: 11.0,
            colorHex: '#9333ea',
            center: new THREE.Vector3(-75, 0, 55),
            patrolRadius: 35
        }))
    }

    setEvents()
    {
        // Stun nearest monster car when player strikes lightning (Key L)
        window.addEventListener('keydown', (e) =>
        {
            if((e.key === 'l' || e.key === 'L') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName))
            {
                this.stunNearestMonster()
            }
            // Toggle Monster mode (Key M)
            if((e.key === 'm' || e.key === 'M') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName))
            {
                this.active = !this.active
                this.monsterCars.forEach(m => m.group.visible = this.active)
                if(this.tensionGain && this.audioCtx)
                {
                    this.tensionGain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime)
                }
            }
        })
    }

    stunNearestMonster()
    {
        const playerPos = this.game.player?.position
        if(!playerPos) return

        for(const monster of this.monsterCars)
        {
            const dist = monster.position.distanceTo(playerPos)
            if(dist < 38)
            {
                monster.stun()
            }
        }
    }

    onMonsterAggro(monster, distance)
    {
        // Monster aggroed
    }

    onPlayerEvaded(monster, type)
    {
        this.game.achievements?.addProgress('bounceRespawn', 1)
    }

    onPlayerHit(monster)
    {
        if(this.isRespawning || this.hitCooldown > 0) return
        this.hitCooldown = 2.5 // 2.5 seconds invulnerability cooldown

        this.playerHealth--

        if(this.playerHealth > 0)
        {
            // Survive hit: stun monster, flash red damage vignette, and apply knockback bump
            monster.stun(2.0)

            if(this.damageOverlay)
            {
                this.damageOverlay.style.opacity = '0.75'
                setTimeout(() => { if(this.damageOverlay) this.damageOverlay.style.opacity = '0' }, 350)
            }

            const playerPos = this.game.player?.position
            if(playerPos && this.game.explosions)
            {
                this.game.explosions.explode(playerPos, 3, 2, false)
            }

            // Bump player away from monster
            const body = this.game.physicalVehicle?.chassis?.physical?.body
            if(body && playerPos)
            {
                const diff = new THREE.Vector3().subVectors(playerPos, monster.position).normalize()
                body.applyImpulse({ x: diff.x * 20, y: 7, z: diff.z * 20 }, true)
            }
            return
        }

        // 3rd hit -> Fatal crash & clean respawn
        this.isRespawning = true
        this.playerHealth = this.playerMaxHealth

        // 1. Flash damage vignette
        if(this.damageOverlay)
        {
            this.damageOverlay.style.opacity = '1'
            setTimeout(() => { if(this.damageOverlay) this.damageOverlay.style.opacity = '0' }, 450)
        }

        // 2. Heavy crash explosion physics
        const playerPos = this.game.player?.position
        if(playerPos && this.game.explosions)
        {
            this.game.explosions.explode(playerPos, 8, 5, true)
        }

        // 3. CLEAN INSTANT RESPAWN - PREVENT BLACK SCREEN FREEZE
        setTimeout(() =>
        {
            try
            {
                // Ensure black overlay is completely disabled so screen never hangs black
                if(this.game.overlay)
                {
                    this.game.overlay.progress.value = 0
                    if(this.game.overlay.mesh)
                        this.game.overlay.mesh.visible = false
                }

                // Deactivate bullet time if active
                if(this.game.time?.bulletTime)
                {
                    this.game.time.bulletTime.active = false
                }

                // Smoothly relocate physical vehicle to safe landing respawn point
                const respawn = this.game.respawns.getDefault()
                if(respawn && this.game.physicalVehicle)
                {
                    this.game.physicalVehicle.moveTo(respawn.position, respawn.rotation)
                    
                    const body = this.game.physicalVehicle.chassis?.physical?.body
                    if(body)
                    {
                        body.setLinvel({ x: 0, y: 0, z: 0 }, true)
                        body.setAngvel({ x: 0, y: 0, z: 0 }, true)
                    }
                }

                if(this.game.player)
                {
                    this.game.player.state = 1 // Player.STATE_DEFAULT
                }

                // Reset monster car positions back to their patrol centers
                this.monsterCars.forEach(m => {
                    m.position.copy(m.center)
                    m.state = 'PATROL'
                    m.speed = m.baseSpeed
                })

                // Achievement progress
                this.game.achievements?.addProgress('bounceRespawn', 1)
            }
            catch(err)
            {
                console.warn('Respawn recovery error:', err)
            }
            finally
            {
                this.isRespawning = false
            }
        }, 600)
    }

    update()
    {
        if(!this.active) return

        const playerPos = this.game.player?.position
        if(!playerPos) return

        const delta = this.game.ticker.deltaScaled || this.game.ticker.delta || 0.016
        this.elapsedTime += delta

        if(this.hitCooldown > 0)
        {
            this.hitCooldown -= delta
        }

        const activeHunting = this.elapsedTime > this.gracePeriod

        let closestDist = 999
        for(const monster of this.monsterCars)
        {
            const dist = monster.update(delta, playerPos, activeHunting)
            if(dist !== undefined && dist < closestDist)
            {
                closestDist = dist
            }
        }

        // DYNAMIC TENSE MUSIC / HEARTBEAT AUDIO SYSTEM
        if(this.audioCtx && this.tensionGain)
        {
            if(closestDist < 35 && activeHunting)
            {
                // Volume ramps up from 0 to 0.25 as distance shrinks from 35m to 5m
                const tensionVol = THREE.MathUtils.clamp((35 - closestDist) / 30 * 0.25, 0.001, 0.25)
                this.tensionGain.gain.setValueAtTime(tensionVol, this.audioCtx.currentTime)

                // Frequency of heartbeat increases as distance decreases
                const rate = closestDist < 12 ? 2.2 : (closestDist < 20 ? 1.6 : 1.0)
                const interval = (1.2 / rate)

                this.heartbeatTimer += delta
                if(this.heartbeatTimer >= interval)
                {
                    this.heartbeatTimer = 0
                    this.playHeartbeat(rate)
                }
            }
            else
            {
                this.tensionGain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime)
            }
        }
    }

    destroy()
    {
        this.game.ticker.events.off('tick', this.tickCallback)
        this.monsterCars.forEach(m => m.destroy())
        this.damageOverlay?.remove()
        if(this.tensionOsc)
        {
            try { this.tensionOsc.stop() } catch(e) {}
        }
    }
}
