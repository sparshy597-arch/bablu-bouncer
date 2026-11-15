import './threejs-override.js'
import { Game } from './Game/Game.js'
import consoleLog from './data/consoleLog.js'

if(import.meta.env.VITE_LOG)
    console.log(
        ...consoleLog
    )

window.game = new Game()

// Time Travel Button click binding
document.querySelector('.js-time-travel')?.addEventListener('click', () =>
{
    window.dispatchEvent(new CustomEvent('time-travel-click'))
})