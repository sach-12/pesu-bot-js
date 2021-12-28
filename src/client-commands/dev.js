//developmental commands
const config = require('../config.json');
const clientInfo = require("./clientHelper");

class DevCommands {
    //TODO:
    // - git pull
    // - restart
    // - bash

    constructor() {
        this.commands = [
            // "gitpull",
            // "restart",
            // "bash",
            "echo",
            "purge"
        ];
    }
    echo = async (message) => {
        clientInfo.message = message
        //syntax - `+e <#channelname> whatever to be echoed
        //paste the required attachment along with that
        const args = message.content.slice(1).trim().split(/ +/);

        // check if the user has any of the given roles
        if (message.member.roles.cache.some(
            (role) => [config.admin, config.mod, config.botDev].includes(role.id)
        )) {
            if (args[1]) {
                // still too unsafe to give others perms to use the command
                let channel = message.mentions.channels;
                let channelID = channel.keys().next().value;
                if (channelID == undefined) {
                    return await message.reply("Mention the channel")
                }
                // get channel by id
                let channelObj = message.guild.channels.cache.get(channelID);
                args.shift()
                args.shift() //remove the first element i.e the channel mention and echo command
                channelObj.send(args.join(" "))
                for (let [key, value] of message.attachments) {
                    channelObj.send(value.url);
                }
                return
            }
            await message.reply("what should i even echo");
        } else {
            await message.reply("Not to you lol");
        }
    }

    purge = async (message, args) => {
        clientInfo.message=message;

        // Check authorised roles
        if (message.member.roles.cache.some(
            (role) => [config.admin, config.mod, config.botDev].includes(role.id)
        )) {
            if (!args[0]) {
                return await message.reply(
                    "Please enter the number of messages to be purged"
                ); //If I don't put return here, it will send the below messages also
            }
            if (args[0] > 100) {
                return await message.reply("You cannot delete more than 100 messages");
            }
            if (args[0] < 1 || isNaN(args[0])) {
                return await message.reply(
                    "Enter a valid number in the range of 0 to 100"
                );
            }
            let amount = parseInt(args[0]);
            await message.delete();
            await message.channel.bulkDelete(amount);
        }
        else {
            await message.channel.send("Noob, you don't have perms to purge");
        }
    }


}

const devTools = new DevCommands()

module.exports = devTools