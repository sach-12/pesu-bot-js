// Handles all slash command interactions

const { Collection, DiscordAPIError, Permissions, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { anonbanHelper } = require('../helpers/misc')
const config = require('../../config.json')

class Slash {

    constructor() {
        this.interactions = new Collection()
            .set(this.pride, "pride")
            .set(this.changenick, "changenick")
            .set(this.anon, "anon")
            .set(this.bananon, "bananon")
            .set(this.userbananon, "userbananon")
            .set(this.userunbananon, "userunbananon")
        this.anonCache = {}
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
                await interaction.deferReply({ephemeral: true}) // "ephemeral" makes the interaction reply/defer hidden
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

    anon = async(interaction) => {
        await interaction.deferReply({ephemeral: true})

        // MongoDB access to check if interaction origin member is banned from using anon messaging
        const {connect} = require('mongoose')
        const {anonban} = require('../helpers/models')

        connect('mongodb://localhost:27017/pesu',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const res = await anonban.findOne({ID: interaction.member.id})

        // If the member is not banned
        if(res === null) {
            // Get message content and message to reply to, if exists
            const message = interaction.options.get('message').value
            const link = interaction.options.get('link')
            let replyTo = null
            if(link != null) {
                const messageLink = link.value
                const messageId = messageLink.split('/').slice(-1)[0]
                try {
                    replyTo = await interaction.channel.messages.fetch(messageId)
                } catch (error) {
                    if(error instanceof DiscordAPIError) {}
                    else {
                        throw(error)
                    }
                }
            }

            // Anon embed variable
            const anonEmbed = new MessageEmbed({
                title: "Anon Message",
                color: "RANDOM",
                timestamp: Date.now(),
                description: message
            })

            // Delete button
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('deleteAnon')
                        .setEmoji("🗑️")
                        .setStyle("DANGER")
                        .setLabel("Delete")
                )

            // Send anon message to lobby
            const lobbyChannel = interaction.guild.channels.cache.get("860224115633160203")
            await interaction.editReply({content: `:white_check_mark: Your anon message has been sent to <#${lobbyChannel.id}>`})
            const anonMessage = await lobbyChannel.send({
                embeds: [anonEmbed],
                reply: {
                    messageReference: replyTo
                },
                // components: [row]
            })

            // Store the anon message ID in memory with the anon message author
            // This is done only for the "bananon" command which relies on message ID
            if(interaction.member.id in this.anonCache) {
                this.anonCache[interaction.member.id].push(anonMessage.id)
            }
            else {
                this.anonCache[interaction.member.id] = [anonMessage.id]
            }
        }
        else {
            await interaction.editReply({content: ":x: You have been banned from using anon messaging"})
        }
    }

    bananon = async(interaction) => {
        await interaction.deferReply({ephemeral: true})

        // Interaction allowed only for admin/mods
        if(interaction.member.roles.cache.some((role) => [config.admin, config.mod].includes(role.id))) {

            // Get author of anon message from memory
            const link = interaction.options.get('link').value
            const messageId = link.split('/').slice(-1)[0]
            const authorId = Object.keys(this.anonCache).find(key => this.anonCache[key].includes(messageId))

            if(authorId === undefined) {
                await interaction.editReply({content: "This wasn't an anon message only da what you doing?"})
            }
            else {
                // Get reason from interaction options
                let reason = "No reason specified"
                const reasonOption = interaction.options.get('reason')
                if(reasonOption != null) {
                    reason = reasonOption.value
                }

                // Add member ID to the databse, returns false if it already exists
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
                        .addField("Message link", link, false);
                    
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
            await interaction.editReply({content: "You ain't authorised to run this command"})
        }
    }

    userbananon = async(interaction) => {
        await interaction.deferReply({ephemeral: true})

        // Interaction allowed only for admin/mods
        if(interaction.member.roles.cache.some((role) => [config.admin, config.mod].includes(role.id))) {
            // Get target member and reason from interaction options
            const target = interaction.options.get('member').member
            let reason = "No reason specified"
            const reasonOption = interaction.options.get('reason')
            if(reasonOption != null) {
                reason = reasonOption.value
            }

            // Anon-ban the user, returns false if he/she was already banned
            const banStatus = await anonbanHelper(target.id, reason)
            if(banStatus === false) {
                await interaction.editReply({content: "Dude's already banned from anon messaging"})
            }
            else {
                // Send embed DM to banned anon
                const banEmbed = new MessageEmbed({
                    title: "Notification",
                    color: "RED",
                    timestamp: Date.now(),
                    description: "You have been banned from using anon messaging"
                })
                    .addField("Reason", reason, false)
                
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
        else {
            await interaction.editReply({content: "You ain't authorised to run this command"})
        }
    }

    userunbananon = async(interaction) => {
        await interaction.deferReply({ephemeral: true})

        // Interaction allowed only for admin/mods
        if(interaction.member.roles.cache.some((role) => [config.admin, config.mod].includes(role.id))) {
            // Get the target member from interaction options
            const target = interaction.options.get('member').member

            // Connect to mongoDB
            const {connect} = require('mongoose')
            const {anonban} = require('../helpers/models')

            connect('mongodb://localhost:27017/pesu',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            // Remove the document from the database, returns null if it was never present in the first place
            const res = await anonban.findOneAndDelete({ID: target.id})
            if(res === null) {
                await interaction.editReply({content: "This fellow wasn't even anon-banned in the first place"})
            }
            else {
                await interaction.editReply({content: "Member unbanned succesfully"})
                // Send embed DM to unbanned anon
                const unbanEmbed = new MessageEmbed({
                    title: "Notification",
                    color: "GREEN",
                    timestamp: Date.now(),
                    description: "Your anon messaging ban has been revoked"
                })
                try {
                    await target.send({embeds: [unbanEmbed]})
                } catch (error) {
                    if(error instanceof DiscordAPIError) {
                        await interaction.followUp({content: "DMs were closed"})
                    }
                }
            }
        }
        else {
            await interaction.editReply({content: "You ain't authorised to run this command"})
        }
    }
}

const slashInteractions = new Slash()

module.exports = slashInteractions