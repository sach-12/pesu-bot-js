// Commands anyone can use
const config = require('../config.json');
const clientInfo = require("./clientHelper");

class Utils {
    constructor() {
        this.commands = [
            "uptime",
            "ping",
            "support",
            // "count",
            // "poll",
            // "pollshow",
            // "help",
        ];
    }

    uptime = async (message) => {
        clientInfo.message = message;
        await message.reply("Bot was started <t:" + clientInfo.startTime + ":R>\ni.e., on <t:" + clientInfo.startTime + ":f>");
    }

    ping = async (message) => {
        clientInfo.message=message
        await message.channel.send(`Pong!!!\nPing =\`${clientInfo.client.ws.ping} ms\``);
    }

    support = async (message) => {
        clientInfo.message = message
        await message.reply("You can contribute to the bot here\nhttps://github.com/sach-12/pesu-bot-js")
    }
}
const utils = new Utils()

module.exports = utils