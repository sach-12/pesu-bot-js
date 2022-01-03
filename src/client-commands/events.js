// This file handles event triggers
const config = require('../config.json')
const {sleep, nqnTest} = require("./misc")
const utils = require("./utils")
const {MessageEmbed} = require('discord.js')

class Events {

    constructor() {
        this.events = [
            "guildMemberAdd", // Send to bot logs and add just joined role
            "guildMemberRemove", // Send to bot logs and deverify if needed
            "guildMemberUpdate", // Birthday
            "messageDelete", // Snipe and ghost ping check
            "messageReactionAdd" // Polls
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
        const {deverifyFunc} = require("./misc")
        const ret = await deverifyFunc(member.id)
        if(ret === true) {
            await botLogs.send("De-verified the user")
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
}

const clientEvent = new Events()

module.exports = clientEvent