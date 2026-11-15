import * as THREE from 'three/webgpu'
import { pass, mrt, output, emissive, renderOutput, vec4 } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { Game } from './Game.js'
import { cheapDOF } from './Passes/cheapDOF.js'
import { Inspector } from 'three/addons/inspector/Inspector.js'

export class Rendering
{
    constructor()
    {
        this.game = Game.getInstance()

        if(this.game.debug.active)
        {
            this.debugPanel = this.game.debug.panel.addFolder({
                title: '📸 Rendering',
                expanded: false,
            })
        }
    }

    start()
    {
        this.setStats()

        this.game.ticker.events.on('tick', () =>
        {
            this.render()
        }, 998)

        this.game.viewport.events.on('change', () =>
        {
            this.resize()
        })

        // Screenshot shortcut: Press 'P' key anytime to capture a cinematic shot
        window.addEventListener('keydown', (e) =>
        {
            if((e.key === 'p' || e.key === 'P') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName))
            {
                this.requestScreenshot()
            }
        })
    }

    async setRenderer()
    {
        const urlParams = new URLSearchParams(window.location.search)
        let forceWebGL = urlParams.get('webgl') !== null || urlParams.get('renderer') === 'webgl' || localStorage.getItem('forceWebGL') === '1'

        if(!forceWebGL && !navigator.gpu)
        {
            forceWebGL = true
        }

        const buildRenderer = (useWebGL) =>
        {
            const r = new THREE.WebGPURenderer({
                canvas: this.game.canvasElement,
                powerPreference: 'high-performance',
                forceWebGL: useWebGL,
                preserveDrawingBuffer: true,
                antialias: this.game.viewport.pixelRatio < 2
            })
            r.setSize(this.game.viewport.width, this.game.viewport.height)
            r.setPixelRatio(this.game.viewport.pixelRatio)
            r.sortObjects = false
            r.domElement.classList.add('experience')
            r.shadowMap.enabled = true
            r.setOpaqueSort((a, b) => a.renderOrder - b.renderOrder)
            r.setTransparentSort((a, b) => a.renderOrder - b.renderOrder)
            if(location.hash.match(/inspector/i))
            {
                r.inspector = new Inspector()
            }
            r.setAnimationLoop((elapsedTime) => { this.game.ticker.update(elapsedTime) })
            return r
        }

        this.renderer = buildRenderer(forceWebGL)

        try
        {
            await this.renderer.init()
        }
        catch(err)
        {
            console.warn('WebGPU initialization error, auto-activating universal WebGL2 fallback:', err)
            localStorage.setItem('forceWebGL', '1')
            this.renderer = buildRenderer(true)
            await this.renderer.init()
        }

        return this.renderer
    }

    setPostprocessing()
    {
        this.postProcessing = new THREE.RenderPipeline(this.renderer)

        const scenePass = pass(this.game.scene, this.game.view.camera)
        const scenePassColor = scenePass.getTextureNode('output')

        this.bloomPass = bloom(scenePassColor)
        this.bloomPass._nMips = this.game.quality.level === 0 ? 5 : 2
        this.bloomPass.threshold.value = 1
        this.bloomPass.strength.value = 0.25
        this.bloomPass.smoothWidth.value = 1

        this.cheapDOFPass = cheapDOF(renderOutput(scenePass))

        // Quality
        const qualityChange = (level) =>
        {
            if(level === 0)
            {
                this.postProcessing.outputNode = this.cheapDOFPass.add(this.bloomPass)
            }
            else if(level === 1)
            {
                this.postProcessing.outputNode = scenePassColor.add(this.bloomPass)
            }

            this.postProcessing.needsUpdate = true
        }
        qualityChange(this.game.quality.level)
        this.game.quality.events.on('change', qualityChange)

        // Debug
        if(this.game.debug.active)
        {
            const bloomPanel = this.debugPanel.addFolder({
                title: 'bloom',
                expanded: false,
            })

            bloomPanel.addBinding(this.bloomPass.threshold, 'value', { label: 'threshold', min: 0, max: 2, step: 0.01 })
            bloomPanel.addBinding(this.bloomPass.strength, 'value', { label: 'strength', min: 0, max: 3, step: 0.01 })
            bloomPanel.addBinding(this.bloomPass.radius, 'value', { label: 'radius', min: 0, max: 1, step: 0.01 })
            bloomPanel.addBinding(this.bloomPass.smoothWidth, 'value', { label: 'smoothWidth', min: 0, max: 1, step: 0.01 })

            const blurPanel = this.debugPanel.addFolder({
                title: 'blur',
                expanded: true,
            })

            blurPanel.addBinding(this.cheapDOFPass.start, 'value', { label: 'start', min: 0, max: 0.5, step: 0.001 })
            blurPanel.addBinding(this.cheapDOFPass.end, 'value', { label: 'end', min: 0, max: 0.5, step: 0.001 })
            // blurPanel.addBinding(this.cheapDOFPass.size, 'value', { label: 'size', min: 1, max: 5, step: 1 })
            // blurPanel.addBinding(this.cheapDOFPass.separation, 'value', { label: 'separation', min: 0, max: 5, step: 0.001 })
            blurPanel.addBinding(this.cheapDOFPass.repeats, 'value', { label: 'repeats', min: 1, max: 100, step: 1 })
            blurPanel.addBinding(this.cheapDOFPass.amount, 'value', { label: 'amount', min: 0, max: 0.02, step: 0.0001 })
        }
    }

    setStats()
    {
        if(!location.hash.match(/stats/i))
            return
            
        this.stats = {}
        this.stats.feed = {}
        this.stats.update = () =>
        {
            this.stats.feed.drawCalls = this.renderer.info.render.drawCalls.toLocaleString()
            this.stats.feed.triangles = this.renderer.info.render.triangles.toLocaleString()
            this.stats.feed.geometries = this.renderer.info.memory.geometries.toLocaleString()
            this.stats.feed.textures = this.renderer.info.memory.textures.toLocaleString()
        }

        this.stats.update()

        // Debug
        if(this.game.debug.active)
        {
             const debugPanel = this.debugPanel.addFolder({
                title: 'Stats',
                expanded: true,
            })

            for(const feedName in this.stats.feed)
            {
                debugPanel.addBinding(this.stats.feed, feedName, { readonly: true })
            }
        }
    }

    resize()
    {
        this.renderer.setSize(this.game.viewport.width, this.game.viewport.height)
        this.renderer.setPixelRatio(this.game.viewport.pixelRatio)
    }

    async render()
    {
        try
        {
            this.postProcessing.render()
        }
        catch(err)
        {
            if(!this.hasFallenBack && (err?.message?.includes('drawIndexed') || err?.message?.includes('GPU') || err?.name === 'TypeError'))
            {
                this.hasFallenBack = true
                console.warn('WebGPU driver crash caught, auto-recovering in universal WebGL2 fallback mode:', err)
                localStorage.setItem('forceWebGL', '1')
                const url = new URL(window.location.href)
                url.searchParams.set('webgl', '1')
                window.location.replace(url.href)
                return
            }
        }

        if(this.stats)
            this.stats.update()

        if(this.game.monitoring?.stats)
        {
            this.game.rendering.renderer.resolveTimestampsAsync(THREE.TimestampQuery.RENDER)
            this.game.monitoring.stats.update()
        }

        if(this.pendingScreenshot)
        {
            const filename = typeof this.pendingScreenshot === 'string' ? this.pendingScreenshot : `cinematic-${Date.now()}.png`
            this.pendingScreenshot = null
            try
            {
                const canvas = this.game.canvasElement
                const link = document.createElement('a')
                link.download = filename
                link.href = canvas.toDataURL('image/png')
                link.click()
                this.showScreenshotToast()
            }
            catch(err)
            {
                console.warn('Screenshot error:', err)
            }
        }
    }

    requestScreenshot(filename)
    {
        this.pendingScreenshot = filename || `sparsh-cinematic-${Date.now()}.png`
    }

    showScreenshotToast()
    {
        let toast = document.querySelector('.js-screenshot-toast')
        if(!toast)
        {
            toast = document.createElement('div')
            toast.className = 'js-screenshot-toast'
            toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(15,23,42,0.92);color:#38bdf8;padding:12px 24px;border-radius:999px;font-family:sans-serif;font-weight:700;font-size:14px;box-shadow:0 10px 25px rgba(0,0,0,0.5);border:1px solid rgba(56,189,248,0.5);z-index:99999;pointer-events:none;transition:opacity 0.3s ease;'
            document.body.appendChild(toast)
        }
        toast.textContent = '📸 Cinematic Screenshot Saved!'
        toast.style.opacity = '1'
        clearTimeout(this.toastTimeout)
        this.toastTimeout = setTimeout(() => { toast.style.opacity = '0' }, 2200)
    }
}