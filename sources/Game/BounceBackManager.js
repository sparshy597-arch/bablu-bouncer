import { Game } from './Game.js'
import { bounceBackMissions } from '../data/bounceBackMissions.js'

export class BounceBackManager
{
    constructor()
    {
        this.game = Game.getInstance()
        this.missions = bounceBackMissions
        this.modal = document.querySelector('.js-bounce-back-modal')
        this.trigger = document.querySelector('.js-bounce-back-trigger')
        this.closeBtn = document.querySelector('.js-bounce-back-close')
        this.listEl = document.querySelector('.js-bounce-missions-list')
        this.overallText = document.querySelector('.js-bounce-overall-text')
        this.overallFill = document.querySelector('.js-bounce-overall-fill')

        if(!this.modal)
            return

        this.setEvents()
        this.renderMissions()
        this.update()

        // Re-check progress whenever an achievement updates
        this.game.ticker.events.on('tick', () =>
        {
            if(this.modal.classList.contains('is-open'))
            {
                this.update()
            }
        })
    }

    setEvents()
    {
        this.trigger?.addEventListener('click', () =>
        {
            this.open()
        })

        this.closeBtn?.addEventListener('click', () =>
        {
            this.close()
        })

        this.modal.addEventListener('click', (e) =>
        {
            if(e.target === this.modal)
                this.close()
        })

        window.addEventListener('keydown', (e) =>
        {
            if(e.key === 'Escape' && this.modal.classList.contains('is-open'))
            {
                this.close()
            }
        })
    }

    open()
    {
        this.modal.classList.add('is-open')
        this.update()
    }

    close()
    {
        this.modal.classList.remove('is-open')
    }

    renderMissions()
    {
        if(!this.listEl)
            return

        this.listEl.innerHTML = ''

        this.missionElements = new Map()

        for(const m of this.missions)
        {
            const card = document.createElement('div')
            card.className = 'mission-card'
            card.dataset.id = m.id

            card.innerHTML = `
                <div class="mission-icon">${m.icon}</div>
                <div class="mission-info">
                    <div class="mission-title-row">
                        <span class="mission-title">${m.title}</span>
                        <span class="mission-count js-count">0 / ${m.target}</span>
                    </div>
                    <div class="mission-desc">${m.themeStory}</div>
                    <div class="mission-bar-bg">
                        <div class="mission-bar-fill js-fill"></div>
                    </div>
                </div>
                <div class="mission-check">✓</div>
            `

            this.listEl.appendChild(card)
            this.missionElements.set(m.id, {
                card,
                countEl: card.querySelector('.js-count'),
                fillEl: card.querySelector('.js-fill'),
                target: m.target
            })
        }
    }

    update()
    {
        if(!this.game.achievements || !this.missionElements)
            return

        let completedTotal = 0

        for(const [ id, data ] of this.missionElements)
        {
            const group = this.game.achievements.groups.get(id)
            const current = group ? Math.min(group.progress, data.target) : 0
            const ratio = Math.min(1, current / data.target)

            data.countEl.textContent = `${current} / ${data.target}`
            data.fillEl.style.width = `${ratio * 100}%`

            if(current >= data.target)
            {
                data.card.classList.add('is-completed')
                completedTotal++
            }
            else
            {
                data.card.classList.remove('is-completed')
            }
        }

        if(this.overallText)
            this.overallText.textContent = `${completedTotal} / ${this.missions.length} Completed`

        if(this.overallFill)
            this.overallFill.style.width = `${(completedTotal / this.missions.length) * 100}%`
    }
}
