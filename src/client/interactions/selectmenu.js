// Handles select menu interactions

const { Collection } = require("discord.js");
const config = require('../../config.json')

class SelectMenu {
    constructor() {
        this.interactions = new Collection()
            .set(this.helpSelect, "helpSelect")
    }

    helpSelect = async(interaction) => {
        // Get the requested page the member has chosen
        const request = interaction.values[0]
        const {targetEmbed, targetComponents} = require('../helpers/helpEmbeds')

        // Get the next embed to be displayed after checking roles
        let dispEmbed = null
        if(request === 'General') {
            dispEmbed = targetEmbed('general1')
        }
        else if((request === 'Data') && (interaction.member.roles.cache.some((role) => [config.admin, config.mod, config.botDev].includes(role.id)))){
            dispEmbed = targetEmbed('data1')
        }
        else if((request === 'Moderation') && (interaction.member.roles.cache.some((role) => [config.admin, config.mod].includes(role.id)))) {
            dispEmbed = targetEmbed('moderation1')
        }
        else if((request === 'Dev') && (interaction.member.roles.cache.some((role) => [config.admin, config.mod, config.botDev].includes(role.id)))) {
            dispEmbed = targetEmbed('dev1')
        }
        else {
            await interaction.reply({content: "You can't select this option. Don't got the roles", ephemeral: true})
            return
        }

        // Get message components based on the to-be-displayed embed and update the message
        const components = targetComponents(dispEmbed)
        await interaction.update({
            embeds: [dispEmbed],
            components, components
        })
    }
}

const smenu = new SelectMenu()

module.exports = smenu