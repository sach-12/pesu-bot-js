//The main file for shared attributes like message, startime and client
const config = require('../../config.json');

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
            console.log("Invalid token or network issue detected\nIf this is printed in github workflow, build is successful\n" + err);
            // this isnt a true test. just a starting of bot to check the syntax errors etc if any
        }
    }
};

const commandFunctions = new Commands()

module.exports = commandFunctions