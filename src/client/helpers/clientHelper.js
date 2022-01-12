//The main file for shared attributes like message, startime and client
const config = require('../../config.json');
const {dailyTask} = require('./misc')

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
        dailyTask.start()
    }

    error = async (err) => {
        //upon any errors all will be dumped to BotLogs channel
        if (this.message && this.client) {
            let BotLogs = this.client.channels.cache.get(config.logs)
            if (BotLogs && this.message) {
                await BotLogs.send({
                    content: "Error occurred " + err + " by <@" + this.message.author.id + "> in <#" + this.message.channel + ">"
                });
                await this.message.reply("Error occurred " + err);
            }
        } else {
            console.log("Critical Failure" + err);
            //if this occurs, it means that the bot is not initialized properly
            //or the bot is kicked from the server of the message
        }
    }
};

const commandFunctions = new Commands()

module.exports = commandFunctions