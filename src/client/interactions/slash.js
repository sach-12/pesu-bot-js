// Handles all slash command interactions

const { Collection, DiscordAPIError } = require("discord.js");

class Slash {

    constructor() {
        this.interactions = new Collection()
            .set(this.pride, "pride")
            // .set(this.changenick, "changenick")
            // .set(this.anon, "anon")
            // .set(this.bananon, "bananon")
            // .set(this.banuseranon, "banuseranon")
            // .set(this.userunbananon, "userunbananon")
    }

    pride = async(interaction) => {
        await interaction.deferReply()
        await interaction.editReply({content: "Pride of PESU coming your way..."})
        const messageLink = interaction.options.get('link')
        if(messageLink != null) {
            const messageId = messageLink.value.split('/').slice(-1)[0]
            let replyTo = null
            try {
                replyTo = await interaction.channel.messages.fetch(messageId)
            } catch (error) {
                if(error instanceof DiscordAPIError) {}
                else {
                    throw(error)
                }
            }
            if(replyTo === null) {
                await interaction.followUp({content: "https://tenor.com/view/pes-pesuniversity-pesu-may-the-pride-of-pes-may-the-pride-of-pes-be-with-you-gif-21274060"})
            }
            else {
                await replyTo.reply({content: "https://tenor.com/view/pes-pesuniversity-pesu-may-the-pride-of-pes-may-the-pride-of-pes-be-with-you-gif-21274060"})
            }
        }
        else {
            await interaction.followUp({content: "https://tenor.com/view/pes-pesuniversity-pesu-may-the-pride-of-pes-may-the-pride-of-pes-be-with-you-gif-21274060"})
        }
    }
}

const slashInteractions = new Slash()

module.exports = slashInteractions