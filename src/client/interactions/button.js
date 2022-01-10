// Handles all button interactions

const { Collection } = require("discord.js");

class Button {

    constructor() {
        this.interactions = new Collection()
            .set(this.pollshow, "ps")
    }

    pollshow = async(interaction) => {
        await interaction.reply({content: "Interaction still under development...", ephemeral: true})
    }
}

const buttonInteractions = new Button()

module.exports = buttonInteractions