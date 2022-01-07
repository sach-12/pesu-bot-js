// Moderation functions
const { MessageEmbed, DiscordAPIError, Permissions, Collection } = require('discord.js');
const config = require('../config.json');
const clientInfo = require("./clientHelper");
const { sleep } = require('./misc')

class Moderation {
    constructor() {
        this.commands = new Collection()
            .set(this.kick, ["kick"])
            .set(this.mute, ["mute"])
            .set(this.unmute, ["unmute"])
            .set(this.lock, ["lock"])
            .set(this.unlock, ["unlock"])
        this.mutedict = {};
    }

    kick = async(message, args) => {
        clientInfo.message=message;
        await message.channel.sendTyping()

        // Kick permission only for the admin and moderators
        if(message.member.roles.cache.some(
            (role) => [config.admin, config.mod].includes(role.id)
        )){
            // Help Embed
            const kickHelpEmbed = new MessageEmbed({
                title: "Kick",
                color: "0x48BF91",
                timestamp: Date.now(),
                description: "`!kick`\n!kick [Member mention] {Reason: optional}\n\nKicks the member from the server"
            })

            // Get the reason string
            let reason = "No reason provided"
            if(args[1] != null) {
                reason = message.content.substring(message.content.indexOf(args[1]))
            }
            
            // Find target member to be kicked
            // Remove mention caused by reply if it exists
            if((message.type === "REPLY") && (message.mentions.members.first().id != message.mentions.repliedUser.id)){
                message.mentions.members.delete(message.mentions.repliedUser.id);
            }
            const target=message.mentions.members.first();
            if(target){
                // To avoid kicing bots
                if(target.user.bot){
                    await message.reply("You dare kick one of my brothers you little twat")
                    return
                }

                // To avoid kicking admin/mods
                if(target.roles.cache.some((role => [config.admin, config.mod].includes(role.id)))){
                    await message.reply("Gomma you can't kick admin/mod")
                    return
                }

                // Kick Embed sent to message origin channel
                const kickEmbed = new MessageEmbed({
                    title: "",
                    color: "RED",
                    description: `<@${target.id}> **was kicked**`,
                    timestamp: Date.now()
                })

                // Kick logs sent to mod logs channel
                const kickLogs = new MessageEmbed({
                    title: "Kick",
                    color: "RED",
                    timestamp: Date.now()
                })
                    .addField("User", `<@${target.id}>`, true)
                    .addField("Moderator", `<@${message.author.id}>`, true)
                    .addField("Reason", reason, false);

                const modLogs = clientInfo.client.channels.cache.get(config.modlogs);
                // Some people have DMs closed
                try {
                    await target.send(`You have been kicked from **${message.guild.name}**\nReason: ${reason}`);
                } catch (error) {
                    if(error instanceof DiscordAPIError){
                        await message.channel.send("DMs were closed");
                    }
                    else{
                        throw(error)
                    }
                }
                await message.channel.send({embeds: [kickEmbed]});
                await modLogs.send({embeds: [kickLogs]});
                await target.kick(reason);
            }
            else{
                await message.reply({content: "Please mention soemone to kick", embeds: [kickHelpEmbed]});
            }
        }
        else{
            await message.reply("Noob you can't do that");
        }
    }

    mute = async(message, args) => {
        clientInfo.message=message;
        await message.channel.sendTyping()

        // Find target member to be muted
        // Remove mention caused by reply if it exists
        if((message.type === "REPLY") && (message.mentions.members.first().id != message.mentions.repliedUser.id)){
            message.mentions.members.delete(message.mentions.repliedUser.id);
        }
        const target = message.mentions.members.first();

        const muteHelpEmbed = new MessageEmbed({
            title: "Mute",
            color: "0x48BF91",
            description: "`!mute`\n!mute [Member mention/Self] [Time] {Reason: optional}\n\nMutes the user for the specified time\nLimit: 14 days",
            timestamp: Date.now()
        })

        if(target){
            // To enable self mute
            let mod = null
            if(message.member.id === target.id){
                mod = await message.guild.members.fetch("749484661717204992")
            }
            else{
                mod = message.member
            }

            // Mute command available to only admin and mods and self-mute case
            if(mod.roles.cache.some((role => [config.admin, config.mod].includes(role.id))) || mod.id === "749484661717204992"){
                // Parse time into seconds
                let seconds = 0
                if(args[1] != null){
                    const time = args[1].toLowerCase()
                    if(time.endsWith("d")) {
                        seconds += parseInt(time.slice(0, -1)) * 60 * 60 * 24
                    }
                    else if(time.endsWith("h")) {
                        seconds += parseInt(time.slice(0, -1)) * 60 * 60
                    }
                    else if(time.endsWith("m")) {
                        seconds += parseInt(time.slice(0, -1)) * 60
                    }
                    else if(time.endsWith("s")) {
                        seconds += parseInt(time.slice(0, -1))
                    }
                    else {
                        muteHelpEmbed.addField("Accepted Time Format", "Should end with `d/h/m/s`")
                        await message.reply({content: "Mention the proper amount of time to be muted", embeds: [muteHelpEmbed]})
                        return
                    }

                    // Handling all edge cases in the following if-else clause
                    // If mute limit is over the border
                    if((seconds <= 0) || (seconds > 1209600)) {
                        await message.reply({content: "Mute time limit is 14 days only", embeds: [muteHelpEmbed]})
                    }
                    // If self-muting, minimum limit is an hour
                    else if((mod.id === "749484661717204992") && (seconds < 3600)) {
                        await message.reply("Self-mute is only for 1 hour or more")
                    }
                    // If the user is already muted
                    else if(message.member.roles.cache.has(config.muted)) {
                        await message.reply("Brother, leave the already muted poor soul alone")
                    }
                    // If you're trying to mute the admin or a mod
                    else if(target.roles.cache.some((role => [config.admin, config.mod].includes(role.id)))) {
                        await message.reply("Leyy, he's admin/mod. Can't mute them")
                    }
                    // If you're trying to mute a bot
                    else if(target.user.bot){
                        await message.reply("You dare mute of of my kind nin amn")
                    }

                    // If none of the above conditions are satisfied, it is safe to mute
                    else{
                        // Get reason string
                        let reason = "no reason provided"
                        if(args[2] != null) {
                            reason = message.content.substring(message.content.indexOf(args[2]))
                        }

                        // Add muted role to target
                        await target.roles.add(config.muted)

                        // Send an embed reply acknowledgment
                        const muteEmbed = new MessageEmbed({
                            title: "Mute",
                            color: "RED",
                            timestamp: Date.now()
                        })
                            .addField("Muted User", `<@${target.id}> was muted`);
                        await message.reply({embeds: [muteEmbed]})

                        // Mute logs to mod-logs
                        const modLogs = message.guild.channels.cache.get(config.modlogs)
                        const muteLogsEmbed = new MessageEmbed({
                            title: "Mute",
                            color: "RED",
                            timestamp: Date.now()
                        })
                            .addField("Muted User", `<@${target.id}>\nTime: ${time}\nReason: ${reason}\nModerator: <@${mod.id}>`)
                        await modLogs.send({embeds: [muteLogsEmbed]})
                        
                        // Add mute timestamp to avoid duplicate mute memories while auto-unmuting
                        const muteTime = Date.now()
                        this.mutedict[target.id] = muteTime

                        // Serve the mute time
                        await sleep(seconds)

                        // After mute is served, check if the target still has muted role in case he was manually unmuted
                        if(target.roles.cache.has(config.muted)) {
                            // If the time in memory of auto-unmute is the same as the time of the mute
                            // then it is the correct mute-unmute pair
                            if((target.id in this.mutedict) && (this.mutedict[target.id] === muteTime)) {
                                const unmuteEmbed = new MessageEmbed({
                                    title: "Unmute",
                                    color: "GREEN",
                                    timestamp: Date.now()
                                })
                                    .addField("Unmute user", `<@${target.id}> welcome back`)
                                await message.channel.send({embeds: [unmuteEmbed]})

                                // Mod logs embed
                                const unmuteLogsEmbed = new MessageEmbed({
                                    title: "Unmute",
                                    color: "GREEN",
                                    timestamp: Date.now()
                                })
                                    .addField("Unmuted user", `<@${target.id}>\nModerator: Auto`);
                                await modLogs.send({embeds: [unmuteLogsEmbed]})
                                await target.roles.remove(config.muted)
                                delete this.mutedict[target.id]
                            }
                        }
                        else if(target.id in this.mutedict) {
                            delete this.mutedict[target.id]
                        }
                    }
                }
                else {
                    await message.reply({content: "Mention the time to be muted for", embeds: [muteHelpEmbed]})
                }
            }
            else {
                await message.reply("You are not authorised to do that")
            }
        }

        else {
            await message.reply({content: "Mention someone (or yourself) to mute", embeds: [muteHelpEmbed]})
        }
    }

    unmute = async(message) => {
        clientInfo.message=message;
        await message.channel.sendTyping()

        // Find target member to be muted
        // Remove mention caused by reply if it exists
        if((message.type === "REPLY") && (message.mentions.members.first().id != message.mentions.repliedUser.id)){
            message.mentions.members.delete(message.mentions.repliedUser.id);
        }
        const target = message.mentions.members.first();

        // Help embed
        const unmuteHelpEmbed = new MessageEmbed({
            title: "Unmute",
            color: "0x48BF91",
            description: "`!unmute`\n!unmute [Member mention]\n\nUnmutes the user",
            timestamp: Date.now()
        })

        // Unmute permissions only for admin/mods
        if(message.member.roles.cache.some((role => [config.admin, config.mod].includes(role.id)))) {
            if(target) {
                // If the user was never muted/already unmuted
                if(!target.roles.cache.has(config.muted)) {
                    await message.reply("Why you trynna unmute someone who ain't muted?")
                }
                else {
                    // Response embed
                    const unmuteEmbed = new MessageEmbed({
                        title: "Unmute",
                        color: "GREEN",
                        timestamp: Date.now()
                    })
                        .addField("Unmuted user", `<@${target.id}> welcome back`);
                    await message.reply({embeds: [unmuteEmbed]})

                    // Mod logs embed
                    const modLogs = message.guild.channels.cache.get(config.modlogs)
                    const unmuteLogsEmbed = new MessageEmbed({
                        title: "Unmute",
                        color: "GREEN",
                        timestamp: Date.now()
                    })
                        .addField("Unmuted user", `<@${target.id}>\nModerator: <@${message.author.id}>`);
                    await modLogs.send({embeds: [unmuteLogsEmbed]})

                    // Remove muted role and timestamp memory
                    await target.roles.remove(config.muted)
                    delete this.mutedict[target.id]
                }
            }
            else {
                await message.reply({content: "Mention someone to unmute", embeds: [unmuteHelpEmbed]})
            }
        }
        else {
            await message.reply("You are not authorised to do this")
        }
    }

    lock = async(message, args) => {
        clientInfo.message=message;
        await message.channel.sendTyping()

        // Only admin/mods can use lock command
        if(message.member.roles.cache.some((role => [config.admin, config.mod].includes(role.id)))) {
            // Get target channel and reason to lock
            let target = message.mentions.channels.first()
            let reason = "No reason provided"
            // If no channel is mentioned, target is message origin channel
            if(target === undefined){
                target = message.channel
                if(args[0] != null) {
                    reason = message.content.substring(message.content.indexOf(args[0]))
                }
            }
            else {
                if(args[1] != null) {
                    reason = message.content.substring(message.content.indexOf(args[1]))
                }
            }

            // Get permissions override for @everyone role for target channel
            const perms = target.permissionOverwrites.cache.get(config.everyone)

            // If the channel is already locked
            if(perms.deny.has(Permissions.FLAGS.SEND_MESSAGES)) {
                await message.reply("This channel is already locked")
            }
            else {
                // Edit permissions and lock the channel
                await perms.edit({SEND_MESSAGES: false})

                // Embed variables
                // Embed to the locked channel announcing the lock and the reason
                const lockEmbed = new MessageEmbed({
                    title: "Channel Locked :lock:",
                    color: "RED",
                    description: reason,
                    timestamp: Date.now()
                })
                await target.send({embeds: [lockEmbed]})

                // Lock acknowledgment embed reply to the moderator who locked it
                const lockAckEmbed = new MessageEmbed({
                    color: "RED",
                    description: `Locked <#${target.id}>`,
                    timestamp: Date.now()
                })
                await message.reply({embeds: [lockAckEmbed]})

                // Lock logs embed for mod-logs
                const modLogs = message.guild.channels.cache.get(config.modlogs)
                const lockLogsEmbed = new MessageEmbed({
                    title: "Lock",
                    color: "RED",
                    timestamp: Date.now()
                })
                    .addField("Channel", `<#${target.id}>`, true)
                    .addField("Moderator", `<@${message.author.id}>`, true)
                    .addField("Reason", reason, false);
                await modLogs.send({embeds: [lockLogsEmbed]})
            }
        }
        else {
            await message.reply("I am not dyno to let you do this")
        }
    }

    unlock = async(message) => {
        clientInfo.message=message;
        await message.channel.sendTyping()

        // Only admin/mods can use lock command
        if(message.member.roles.cache.some((role => [config.admin, config.mod].includes(role.id)))) {
            // Get target channel to unlock
            let target = message.mentions.channels.first()
            // If no channel is mentioned, target is message origin channel
            if(target === undefined){
                target = message.channel
            }

            // Get permissions override for @everyone role for target channel
            const perms = target.permissionOverwrites.cache.get(config.everyone)

            // If the channel is not locked in the first place
            if((!perms.allow.has(Permissions.FLAGS.SEND_MESSAGES)) && (!perms.deny.has(Permissions.FLAGS.SEND_MESSAGES))) {
                await message.reply("This channel ain't locked bruh whatcha doin")
            }
            else {
                // Edit permissions and unlock the channel
                await perms.edit({SEND_MESSAGES: null})

                // Embed variables
                // Embed to the unlocked channel announcing the unlock
                const unlockEmbed = new MessageEmbed({
                    title: "Channel Unlocked :unlock:",
                    color: "GREEN",
                    timestamp: Date.now()
                })
                await target.send({embeds: [unlockEmbed]})

                // Unlock acknowledgment embed reply to the moderator who unlocked it
                const unlockAckEmbed = new MessageEmbed({
                    color: "GREEN",
                    description: `Unlocked <#${target.id}>`,
                    timestamp: Date.now()
                })
                await message.reply({embeds: [unlockAckEmbed]})

                // Unlock logs embed for mod-logs
                const modLogs = message.guild.channels.cache.get(config.modlogs)
                const unlockLogsEmbed = new MessageEmbed({
                    title: "Unlock",
                    color: "GREEN",
                    timestamp: Date.now()
                })
                    .addField("Channel", `<#${target.id}>`, true)
                    .addField("Moderator", `<@${message.author.id}>`, true);
                await modLogs.send({embeds: [unlockLogsEmbed]})
            }
        }
        else {
            await message.reply("You think I am like dyno ah?")
        }
    }
}

const modTools = new Moderation()

module.exports = modTools