// This file handles event triggers
const config = require('../config.json')
const {sleep, nqnTest, deverifyFunc} = require("./misc")
const utils = require("./utils")
const {MessageEmbed} = require('discord.js')

class Events {

    constructor() {
        this.events = [
            "guildMemberAdd", // Send to bot logs and add just joined role
            "guildMemberRemove", // Send to bot logs and deverify if needed
            "guildMemberUpdate", // Birthday alert
            "messageDelete", // Snipe and ghost ping check
            "messageUpdate", // Edit-snipe
            // "messageReactionAdd", // Polls
            "threadCreate" // To join threads automatically
        ]
    }

    guildMemberAdd = async(member) => {
        const botLogs = member.guild.channels.cache.get(config.logs)
        const justJoined = member.guild.roles.cache.get(config.just_joined)
        await botLogs.send(`${member.displayName} Joined\ni.e., <@${member.id}> just joined`)
        await member.roles.add(justJoined);
    }

    guildMemberRemove = async(member) => {
        const botLogs = member.guild.channels.cache.get(config.logs)
        await botLogs.send(`${member.displayName} left\ni.e., <@${member.id}> just left`)
        const ret = await deverifyFunc(member.id)
        if(ret === true) {
            await botLogs.send("De-verified the user")
        }
    }

    guildMemberUpdate = async(oldMember, newMember) => {
        const budday = newMember.guild.roles.cache.get("842294715415396383") // Birthday role
        if(!oldMember.roles.cache.some((role) => role === budday) && (newMember.roles.cache.some((role) => role === budday))) {
            const lobby = newMember.guild.channels.cache.get("860224115633160203") // Kids section channel
            await lobby.send(`Yo, it's <@${newMember.id}>'s birthday`)
        }
    }

    messageDelete = async(message) => {
        if(message.author.bot === true) return;
        await sleep(0.5)
        const nqn = await nqnTest(message)
        if(nqn === false) {
            // To check ghost ping
            const allMentions = message.mentions

            const ghostPingEmbed = new MessageEmbed({
                title: "Ghost Ping Alert",
                timestamp: Date.now(),
                color: "BLUE"
            })

            // @everyone or @here ghost ping
            if(allMentions.everyone === true) {
                ghostPingEmbed.addField("@everyone/@here pings", `<@${message.author.id}> ghost pinged \`@everyone/@here\` in <#${message.channel.id}>`)
            }

            // If any role was ghost pinged
            if(allMentions.roles.size > 0) {
                const mentionsCollect = allMentions.roles
                let pingList = ""
                mentionsCollect.each(role => pingList += "<@&"+role.id+"> ")
                ghostPingEmbed.addField("Role pings", `<@${message.author.id}> ghost pinged ${pingList}in <#${message.channel.id}>`)
            }

            // Member ghost ping. Filtering out all bot pings
            if(allMentions.members.filter(member => !member.user.bot).size > 0) {
                const mentionsCollect = allMentions.members
                let pingList = ""
                mentionsCollect.filter(member => !member.user.bot).each(member => pingList += "<@"+member.id+"> ")
                ghostPingEmbed.addField("Member pings", `<@${message.author.id}> ghost pinged ${pingList}in <#${message.channel.id}>`)
            }

            // Send embed if there's any ghost ping to mod logs
            if(ghostPingEmbed.fields.length > 0) {
                const modLogs = message.guild.channels.cache.get(config.modlogs)
                await modLogs.send({embeds: [ghostPingEmbed]})
            }

            // For sniping
            utils.deletedMessage = message
            await sleep(60)

            // Deleted message becomes null after 60 seconds of non-snipe only if the current deletedMessage is the same one
            // as what triggered the event
            if(utils.deletedMessage != null && utils.deletedMessage.id === message.id){
                utils.deletedMessage = null
            }
        }
    }

    messageUpdate = async(oldMessage, newMessage) => {

        // To check ghost ping
        const allMentions = oldMessage.mentions
        const newMentions = newMessage.mentions
        if(allMentions != newMentions){
            const ghostPingEmbed = new MessageEmbed({
                title: "Ghost Ping Alert (Edited Message)",
                timestamp: Date.now(),
                color: "BLUE"
            })
    
            // @everyone or @here ghost ping
            if(allMentions.everyone === true) {
                ghostPingEmbed.addField("@everyone/@here pings", `<@${oldMessage.author.id}> ghost pinged \`@everyone/@here\` in <#${oldMessage.channel.id}>`)
            }
    
            // If any role was ghost pinged
            if(allMentions.roles.size > 0) {
                const mentionsCollect = allMentions.roles
                let pingList = ""
                mentionsCollect.each(role => pingList += "<@&"+role.id+"> ")
                ghostPingEmbed.addField("Role pings", `<@${oldMessage.author.id}> ghost pinged ${pingList}in <#${oldMessage.channel.id}>`)
            }
    
            // Member ghost ping. Filtering out all bot pings
            if(allMentions.members.filter(member => !member.user.bot).size > 0) {
                const mentionsCollect = allMentions.members
                let pingList = ""
                mentionsCollect.filter(member => !member.user.bot).each(member => pingList += "<@"+member.id+"> ")
                ghostPingEmbed.addField("Member pings", `<@${oldMessage.author.id}> ghost pinged ${pingList}in <#${oldMessage.channel.id}>`)
            }
    
            // Send embed if there's any ghost ping to mod logs
            if(ghostPingEmbed.fields.length > 0) {
                // Set Jump URL
                ghostPingEmbed.addField("Jump URL", oldMessage.url)

                const modLogs = oldMessage.guild.channels.cache.get(config.modlogs)
                await modLogs.send({embeds: [ghostPingEmbed]})
            }
        }


        // Store old message for editsnipe
        utils.editedMessage = oldMessage
        await sleep(60)

        // Edited message is made null after 60 seconds only if the current stored message is the same one
        // which triggered this event
        if(utils.editedMessage != null && utils.editedMessage.id === oldMessage.id) {
            utils.editedMessage = null
        }
    }

    threadCreate = async(threadChannel) => {
        await threadChannel.join()
    }
}

const clientEvent = new Events()

module.exports = clientEvent