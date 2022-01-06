// Moderation functions
const { MessageEmbed, DiscordAPIError } = require('discord.js');
const config = require('../config.json');
const clientInfo = require("./clientHelper");

class Moderation {
    constructor() {
        this.commands = [
            "kick",
            // "mute",
            // "unmute",
            // "lock",
            // "unlock"
        ];
    }
    kick = async(message, args) => {
        clientInfo.message=message;

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

            // Get the reason after removing the first two args
            const firstArgIncluded = message.content.slice(message.content.indexOf(" ", 1)+1)
            let reason = firstArgIncluded.slice(firstArgIncluded.indexOf(" ")+1)
            
            // This happens when no reason is provided
            if(reason === firstArgIncluded){
                reason = "No reason provided"
            }
            
            // Find target member to be kicked
            // Remove mention caused by reply if it exists
            if(message.type === "REPLY"){
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
}

const modTools = new Moderation()

module.exports = modTools