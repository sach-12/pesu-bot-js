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
            "snipe",
            "editsnipe"
        ];

        this.deletedMessage = null;
        this.editedMessage = null;
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

    snipe = async (message) => {
        clientInfo.message = message

        // If no message was stored in snipe
        if(this.deletedMessage === null){
            await message.channel.send("There is nothing to snipe")
        }
        else{
            // Snipes only if command origin channel is the same as the sniped message origin channel
            if(this.deletedMessage.channel.id === message.channel.id){
                // If the deleted message replied to any other message, get the message ID the user replied to
                const reference = await this.deletedMessage.reference
                let repliedTo = null
                if(reference != null){
                    repliedTo = reference.messageId
                }

                // Send the deleted message with the reply of the original message if it exists
                await message.channel.send({
                    content: `<@${this.deletedMessage.author.id}>: ${this.deletedMessage.content}`,
                    reply: {
                        messageReference: repliedTo
                    }
                })
                this.deletedMessage = null
            }
            else {
                await message.channel.send("There is nothing to snipe")
            }
        }
    }

    editsnipe = async (message) => {
        clientInfo.message = message

        // If no message was stored in edit-snipe
        if(this.editedMessage === null) {
            await message.channel.send("No edited message")
        }
        else {
            // Edit-snipes only if the command origin channel is the same as the edited message origin channel
            if(this.editedMessage.channel.id === message.channel.id){
                // To check if the message still exists
                const originnalMessage = await message.channel.messages.fetch(this.editedMessage)

                // If the message exists, get the ID for replying to it
                let repliedTo = null

                // If the message does not exist, try replying to who he/she replied to instead
                if(originnalMessage === null) {
                    const reference = await this.editedMessage.reference
                    if(reference != null) {
                        repliedTo = reference.messageId
                    }
                }

                // If the message exists, reply to it instead
                else {
                    repliedTo = this.editedMessage.id
                }

                let content = ""
                // If the command response has nothing to reply to, add the message author tag to the response content
                if(repliedTo === null){
                    content += `<@${this.editedMessage.author.id}> `
                }
                content += this.editedMessage.content

                await message.channel.send({
                    content: content,
                    reply: {
                        messageReference: repliedTo
                    }
                })
                this.editedMessage = null
            }
            else {
                await message.channel.send("No edited message")
            }
        }
    }
}
const utils = new Utils()

module.exports = utils