const config = require('../config.json');

class Commands {
    constructor() {
        this.startTime = 0,
        this.client = {},
        this.message = NaN
    }
    init = (client) => {
        this.startTime = Math.floor(Date.now() / 1000);
        this.client = client;
        this.message = NaN;
    },

    uptime = (message) => {
        this.message = message;
        const currTime = Math.floor(Date.now() / 1000);
        let timeElapsed = currTime - this.startTime;

        message.reply("Bot was started <t:" + this.startTime + ":R>\ni.e., on <t:" + this.startTime + ":f>");
    }

    ping = (message) => {
        this.message=message
        message.channel.send(`Pong!!!\nPing =${this.client.ws.ping} ms`);
    }
    echo = (message) => {
        this.message = message
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
                    return message.reply("Mention the channel")
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
            message.reply("what should i even echo");
        } else {
            message.reply("Not to you lol");
        }
    }

    support = (message) => {
        this.message = message
        return message.reply("You can contribute to the bot here\nhttps://github.com/sach-12/pesu-bot-js")
    }
    error = (err) => {
        //upon any errors all will be dumped to BotLogs channel
        if (this.message && this.client) {
            let BotLogs = this.client.channels.cache.get(config.logs)
            if (BotLogs && this.message) {
                BotLogs.send({ content: "Error occurred " + err + " by <@" + this.message.author.id + "> in <#" + this.message.channel + ">" })

                this.message.reply("Error occurred " + err);
            }
        } else {
            console.log("Invalid token or network issue detected\nIf this is printed in github workflow, build is successful" + err);
            // this isnt a true test. just a starting of bot to check the syntax errors etc if any
        }
    }
};

const commandFunctions = new Commands()

module.exports = commandFunctions

