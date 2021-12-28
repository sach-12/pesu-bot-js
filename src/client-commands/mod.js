//moderation functions
const config = require('../config.json');
const clientInfo = require("./clientHelper");

class Moderation {
    constructor() {
        this.commands = [
            "kick"
        ];
    }
    kick = async(message, args) => {
        clientInfo.message=message;
        let modLogs = clientInfo.client.channels.cache.get(config.modlogs);

        // Kick permissionf only for the admin and moderators
        if(message.member.roles.cache.some(
            (role) => [config.admin, config.mod].includes(role.id)
        )){
            // Find target member to be kicked
            const target=message.mentions.users.first();
            let reason="";
            for(let i=1;i<args.length;++i){
                reason=reason+" "+args[i];
            }
            if(target){
                const memberTarget=message.guild.members.cache.get(target.id);
                if(!reason) reason = "No reason mentioned";

                // Some people have DMs closed
                try {
                    await memberTarget.send(`You have been kicked from **${message.guild.name}** \nReason:${reason}`);
                } catch (error) {
                    await message.channel.send("DMs were closed");
                }
                await message.channel.send(`**${target.tag}** has been kicked \nReason:${reason}`);
                await modLogs.send(`**${target.tag}** has been kicked by <@${message.member.id}> \nReason:${reason}`);
                await memberTarget.kick(reason);
            }
            else{
                await message.reply("Please mention soemone to kick");
            }
        }
        else{
            await message.reply("Noob you can't do that");
        }
    }
}

const modTools = new Moderation()

module.exports = modTools