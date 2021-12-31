// This file handles event triggers
const config = require('../config.json')

class Events {

    constructor() {
        this.events = [
            "guildMemberAdd", // Send to bot logs and add just joined role
            "guildMemberRemove", // Send to bot logs and deverify if needed
            "guildMemberUpdate", // Birthday
            "message delete", // Snipe and ghost ping check
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
        const {deverify} = require("./misc")
        const ret = await deverify(member.id)
        if(ret === true) {
            await botLogs.send("De-verified the user")
        }
    }
}

const clientEvent = new Events()

module.exports = clientEvent