// Handles all slash command interactions

const { Collection, DiscordAPIError, Permissions } = require("discord.js");

class Slash {

    constructor() {
        this.interactions = new Collection()
            .set(this.pride, "pride")
            .set(this.changenick, "changenick")
            // .set(this.anon, "anon")
            // .set(this.bananon, "bananon")
            // .set(this.banuseranon, "banuseranon")
            // .set(this.userunbananon, "userunbananon")
    }

    pride = async(interaction) => {
        // deferReply is making the bot "think"
        await interaction.deferReply()
        await interaction.editReply({content: "Pride of PESU coming your way..."})

        // Get message link from options if it exists
        const messageLink = interaction.options.get('link')
        if(messageLink != null) {
            const messageId = messageLink.value.split('/').slice(-1)[0]
            // Get the message to reply to if exists
            let replyTo = null
            try {
                replyTo = await interaction.channel.messages.fetch(messageId)
            } catch (error) {
                if(error instanceof DiscordAPIError) {}
                else {
                    throw(error)
                }
            }

            // Send the pride
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

    changenick = async(interaction) => {
        // Get permissions of interaction author
        const perms = interaction.memberPermissions
        // Get target member
        const target = interaction.options.get('member')
        // Can change nickname only if the author has nickname changing permissions in the first place
        // and if the author's highest role is above the target's highest role
        if((perms.has(Permissions.FLAGS.MANAGE_NICKNAMES)) && (interaction.member.roles.highest.rawPosition > target.member.roles.highest.rawPosition)) {
            try {
                // Get new nickname to change to and perform the edit
                const newNick = interaction.options.get('new_nick').value
                await interaction.deferReply({ephemeral: true})
                await target.member.edit({nick: newNick})
                await interaction.editReply({content: `Nicely changed ${target.user.tag}'s name`, ephemeral: true})
            } catch (error) {
                // If some API error, usually missing permissions when bot tries to change nickname of someone above its role
                if(error instanceof DiscordAPIError) {
                    await interaction.editReply({content: "Can't do this one. Some API error", ephemeral: true})
                }
            }
        }
        else {
            await interaction.deferReply({ephemeral: false})
            await interaction.editReply({content: `Awwww sooo cutely you're trying to change ${target.user.tag}'s nickname`, ephemeral: false})
        }
    }
}

const slashInteractions = new Slash()

module.exports = slashInteractions