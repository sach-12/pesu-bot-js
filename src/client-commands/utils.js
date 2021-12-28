// commands anyone can use
const config = require('../config.json');
const clientInfo = require("./clientHelper");

class Utils {
    constructor() {
        this.commands = [
            "test",
            "uptime",
            "ping",
            "support"
        ];
    }

    uptime = async (message) => {
        clientInfo.message = message;
        const currTime = Math.floor(Date.now() / 1000);
        await message.reply("Bot was started <t:" + clientInfo.startTime + ":R>\ni.e., on <t:" + clientInfo.startTime + ":f>");
    }

    ping = async (message) => {
        clientInfo.message=message
        await message.channel.send(`Pong!!!\nPing =\`${clientInfo.client.ws.ping} ms\``);
    }
    
    test = (message, args) => {
        clientInfo.message = message;
        message.reply("test" + "accessing these from within utils.js" + clientInfo.startTime + "\n successfully updated the message variable of commands from within the utils");
        console.log(clientInfo.message == message);
    }

    support = async (message) => {
        clientInfo.message = message
        return await message.reply("You can contribute to the bot here\nhttps://github.com/sach-12/pesu-bot-js")
    }
}
const utils = new Utils()

module.exports = utils