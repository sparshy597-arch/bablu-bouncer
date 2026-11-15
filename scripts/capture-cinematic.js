import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const OUTPUT_DIR = 'C:\\Users\\spars\\Downloads\\cinematic_screenshots'

if(!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function capture() {
    console.log('Launching Edge for cinematic capture...')
    const browser = await puppeteer.launch({
        executablePath: EDGE_PATH,
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1920,1080',
            '--ignore-gpu-blocklist',
            '--enable-gpu-rasterization',
            '--enable-zero-copy',
            '--use-gl=angle',
            '--use-angle=d3d11'
        ],
        defaultViewport: { width: 1920, height: 1080 }
    })

    try {
        const page = await browser.newPage()
        console.log('Navigating to http://localhost:5173/ ...')
        await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 })

        console.log('Waiting for game assets & WebGL to initialize...')
        await sleep(8000)

        // Wake up game / skip intro if any by clicking canvas or pressing Enter/Space/ArrowUp
        await page.keyboard.press('Space')
        await sleep(1000)
        await page.keyboard.press('ArrowUp')
        await sleep(2000)

        // Shot 1: Starting area / Sanctuary gameplay
        console.log('Taking Shot 1: Sanctuary Gameplay...')
        await page.screenshot({
            path: path.join(OUTPUT_DIR, '01_GAMEPLAY_SANCTUARY.png'),
            fullPage: false
        })

        // Drive car forward along track
        console.log('Driving car along track...')
        await page.keyboard.down('ArrowUp')
        await sleep(2500)
        await page.keyboard.up('ArrowUp')
        await sleep(500)

        // Shot 2: Driving action on track
        console.log('Taking Shot 2: Driving Action...')
        await page.screenshot({
            path: path.join(OUTPUT_DIR, '02_GAMEPLAY_DRIVING_TRACK.png'),
            fullPage: false
        })

        // Trigger hydraulics jump
        await page.keyboard.press('Space')
        await sleep(300)
        console.log('Taking Shot 3: Mid-air Jump...')
        await page.screenshot({
            path: path.join(OUTPUT_DIR, '03_GAMEPLAY_HYDRAULIC_JUMP.png'),
            fullPage: false
        })
        await sleep(1000)

        // Trigger THUNDER AND LIGHTNING!
        console.log('Triggering Thunder and Lightning (Key L)...')
        await page.keyboard.press('KeyL')
        // Wait for anticipation (0.3s) + electric arc strike (0.15s)
        await sleep(400)

        console.log('Taking Shot 4: Thunder and Lightning Strike...')
        const lightningPath = path.join(OUTPUT_DIR, '04_THUNDER_AND_LIGHTNING_STRIKE.png')
        await page.screenshot({
            path: lightningPath,
            fullPage: false
        })

        // Also take another angle / follow-up thunder strike
        await sleep(800)
        await page.keyboard.press('KeyL')
        await sleep(380)
        await page.screenshot({
            path: path.join(OUTPUT_DIR, '05_THUNDER_STRIKE_ELECTRIC_ARC.png'),
            fullPage: false
        })

        // Copy the best thunder screenshot to main submission hero
        fs.copyFileSync(lightningPath, 'C:\\Users\\spars\\Downloads\\BEST_HERO_SUBMISSION_SCREENSHOT.png')
        console.log('All cinematic screenshots captured successfully!')

    } catch (err) {
        console.error('Error during capture:', err)
    } finally {
        await browser.close()
    }
}

capture()
