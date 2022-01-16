// Handles all button interactions

const { Collection, MessageEmbed } = require("discord.js");
const config = require('../../config.json')

class ContextMenu {

    constructor() {
        this.interactions = new Collection()
            .set(this.anonban, "Ban this anon")
    }

    anonban = async(interaction) => {
        await interaction.deferReply({ephemeral: true})

        // Interaction allowed only for admin/mods
        if(interaction.member.roles.cache.some((role) => [config.admin, config.mod].includes(role.id))) {
            
            // Get the author ID
            const slash = require('./slash')
            const messageId = interaction.targetMessage.id
            const authorId = Object.keys(slash.anonCache).find(key => slash.anonCache[key].includes(messageId))
            if(authorId === undefined) {
                await interaction.editReply({content: "This wasn't an anon message only da what you doing?"})
            }
            else {
                // Since this interaction cannot be supplied with any parameters, default reason is provided
                const reason = "No reason specified"
                const {anonbanHelper} = require('../helpers/misc')

                // Anon-ban the user, returns false if he/she was already banned
                const banStatus = await anonbanHelper(authorId, reason)
                if(banStatus === false) {
                    await interaction.editReply({content: "Dude's already banned from anon messaging"})
                }
                else {
                    // Send embed DM to banned anon
                    const target = await interaction.guild.members.fetch(authorId)
                    const banEmbed = new MessageEmbed({
                        title: "Notification",
                        color: "RED",
                        timestamp: Date.now(),
                        description: "You have been banned from using anon messaging"
                    })
                        .addField("Reason", reason, false)
                        .addField("Message link", interaction.targetMessage.url, false);
                    
                    await interaction.editReply({content: `Member has been banned from anon messaging\nReason: ${reason}`})
                    try {
                        await target.send({embeds: [banEmbed]})
                    } catch (error) {
                        if(error instanceof DiscordAPIError) {
                            await interaction.followUp({content: "DMs were closed"})
                        }
                    }
                }
            }
        }
        else {
            await interaction.editReply({content: "You are not authorised to use this"})
        }
    }
}

const cmenuInteractions = new ContextMenu()

module.exports = cmenuInteractions