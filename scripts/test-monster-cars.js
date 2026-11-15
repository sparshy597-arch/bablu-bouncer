import puppeteer from 'puppeteer-core'
import path from 'path'

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function run() {
    console.log('Testing Monster Cars in Edge...')
    const browser = await puppeteer.launch({
        executablePath: EDGE_PATH,
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--window-size=1920,1080',
            '--use-gl=angle',
            '--use-angle=d3d11'
        ],
        defaultViewport: { width: 1920, height: 1080 }
    })

    const page = await browser.newPage()

    page.on('console', msg => {
        if(msg.type() === 'error') {
            console.error('BROWSER LOG ERROR:', msg.text())
        }
    })

    page.on('pageerror', err => {
        console.error('PAGE ERROR:', err.message)
    })

    try {
        await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 })
        console.log('Waiting 6s for game to load...')
        await sleep(6000)

        // Click to start / reveal world
        console.log('Clicking to start and reveal full world...')
        await page.mouse.click(960, 540)
        await sleep(1500)
        await page.keyboard.press('Space')
        await sleep(1000)

        // Drive forward out of starting circle
        console.log('Driving out into the open world...')
        await page.keyboard.down('ArrowUp')
        await sleep(4000)
        await page.keyboard.up('ArrowUp')
        await sleep(1500)

        // Drive towards Nemesis Rex (x: 25, z: -30)
        console.log('Steering towards Nemesis Rex...')
        await page.keyboard.down('ArrowUp')
        await page.keyboard.down('ArrowRight')
        await sleep(2500)
        await page.keyboard.up('ArrowRight')
        await sleep(2000)
        await page.keyboard.up('ArrowUp')
        await sleep(1200)

        // Capture screenshot of Monster Car chase / proximity
        const ssPath = 'C:\\Users\\spars\\Downloads\\cinematic_screenshots\\06_MONSTER_CARS_SURVIVAL.png'
        await page.screenshot({ path: ssPath, fullPage: false })
        console.log('Screenshot saved to:', ssPath)

    } catch(err) {
        console.error('Test error:', err)
    } finally {
        await browser.close()
    }
}

run()
