// Handles all button interactions

const { Collection } = require("discord.js");

class ContextMenu {

    constructor() {
        this.interactions = new Collection()
            .set(this.anonban, "Ban this anon")
    }

    anonban = async(interaction) => {
        await interaction.reply({content: "Interaction still under development...", ephemeral: true})
    }
}

const cmenuInteractions = new ContextMenu()

module.exports = cmenuInteractions