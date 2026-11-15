import { Area } from './Area.js'

// Plain scenery area: keeps the physical objects and visuals of the model
// but has no extra interactions, menus or external links.
export class DecorArea extends Area
{
    constructor(model, name)
    {
        super(model)

        this.events.on('boundingIn', () =>
        {
            this.game.achievements.setProgress('areas', name)
        })
    }
}
