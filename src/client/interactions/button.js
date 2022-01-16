// Handles all button interactions

const { Collection } = require("discord.js");
const config = require('../../config.json')

class Button {

    constructor() {
        this.interactions = new Collection()
            .set(this.pollshow, ["ps"])
            .set(this.help, ["helpPrevious", "helpNext"])
            .set(this.deleteAnon, ["deleteAnon"])
    }

    pollshow = async(interaction) => {
        await interaction.reply({content: "Interaction still under development...", ephemeral: true})
    }

    help = async(interaction) => {
        const {targetEmbed, targetComponents} = require('../helpers/helpEmbeds')

        // This interaction is called whenever the previous or the next button is invoked in the help command
        const currEmbed = interaction.message.embeds[0]
        const page = currEmbed.footer.text.replace('Page ', '')
        let requestPageNumber = parseInt(page.split('/')[0])

        // Add or subtract page number depending on which button was pressed
        if(interaction.customId === "helpPrevious") {
            requestPageNumber -= 1
        }
        else {
            requestPageNumber += 1
        }

        // Get the current page which is displayed at the moment
        const currPage = currEmbed.description

        // Get target page name for targetEmbed paramter
        const targetPageName = currPage.toLowerCase() + requestPageNumber.toString()
        let dispEmbed = null

        // Get the next embed to be displayed after checking interaction member roles from targetPageName
        if(currPage === 'General') {
            dispEmbed = targetEmbed(targetPageName)
        }
        else if((currPage === 'Data') && (interaction.member.roles.cache.some((role) => [config.admin, config.mod, config.botDev].includes(role.id)))){
            dispEmbed = targetEmbed(targetPageName)
        }
        else if((currPage === 'Moderation') && (interaction.member.roles.cache.some((role) => [config.admin, config.mod].includes(role.id)))) {
            dispEmbed = targetEmbed(targetPageName)
        }
        else if((currPage === 'Dev') && (interaction.member.roles.cache.some((role) => [config.admin, config.mod, config.botDev].includes(role.id)))) {
            dispEmbed = targetEmbed(targetPageName)
        }
        else {
            await interaction.reply({content: "You can't use this button. Don't got the roles", ephemeral: true})
            return
        }
        
        // Get message components based on the to-be-displayed embed and update the message
        const components = targetComponents(dispEmbed)
        await interaction.update({
            embeds: [dispEmbed],
            components, components
        })
    }

    deleteAnon = async(interaction) => {
        await interaction.deferReply({ephemeral: true})
        const slash = require('./slash')
        const messageId = interaction.message.id
        const authorId = Object.keys(slash.anonCache).find(key => slash.anonCache[key].includes(messageId))
        const deleteAuthorId = interaction.member.id
        if(authorId === deleteAuthorId) {
            await interaction.editReply({content: "Your anon message has been deleted"})
            await interaction.message.delete()
        }
        else {
            await interaction.editReply({content: "Not yours to delete"})
        }
    }
}

const buttonInteractions = new Button()

module.exports = buttonInteractions