// Commands anyone can use
const { Permissions, Collection, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const config = require('../../config.json');
const clientInfo = require("../helpers/clientHelper");

class Utils {
    constructor() {
        this.commands = new Collection()
            .set(this.uptime, ["uptime", "ut"])
            .set(this.ping, ["ping", "tp"])
            .set(this.support, ["support", "contribute"])
            .set(this.count, ["count", "c"])
            .set(this.snipe, ["snipe"])
            .set(this.editsnipe, ["editsnipe"])
            .set(this.poll, ["poll"])
            .set(this.help, ["help", "h"])

        this.deletedMessage = null;
        this.editedMessage = null;
    }

    uptime = async (message) => {
        clientInfo.message = message;
        await message.reply({
            content: "Bot was started <t:" + clientInfo.startTime + ":R>\ni.e., on <t:" + clientInfo.startTime + ":f>",
            failIfNotExists: false
        });
    }

    ping = async (message) => {
        clientInfo.message=message
        await message.reply({
            content: `Pong!!!\nPing =\`${clientInfo.client.ws.ping} ms\``,
            failIfNotExists: false
        });
    }

    support = async (message) => {
        clientInfo.message = message
        await message.reply({
            content: "You can contribute to the bot here\nhttps://github.com/sach-12/pesu-bot-js",
            failIfNotExists: false
        })
    }

    count = async (message) => {
        clientInfo.message = message

        // Get role names separated by "&"
        let roleList = []
        const args = message.content.substring(message.content.indexOf(" ")+1).trim().split("&");

        // Get role collection for each role name and add to array
        args.forEach(roleStr => {
            const role = message.guild.roles.cache.find((r) => r.name === roleStr.trim())
            if(role != null) {
                roleList.push(role)
            }
        });
        const mems = message.guild.members.cache
        if(roleList.length === 0){
            await message.channel.send("No roles found. Processing request for server stats...")
            await message.channel.sendTyping();

            // Stats:
            const total = message.guild.members.cache.size
            const verifiedRole = message.guild.roles.cache.get(config.verified)
            let verified = 0
            let hooman = 0
            let bots = 0

            // Each member is being checked if they have the verified role, if they can view the message
            // origin channel and if they are a bot or not
            mems.each(member => {
                if(member.roles.cache.has(verifiedRole.id)){
                    verified += 1
                }
                const perms = message.channel.permissionsFor(member)
                const view_channel = Permissions.FLAGS.VIEW_CHANNEL
                if(perms.has(view_channel)){
                    if(member.user.bot){
                        bots += 1
                    }
                    else {
                        hooman += 1
                    }
                }
            })
            const stats = `**Server Stats:**\n\
            Total number of people on the server: \`${total}\`\n\
            Total number of verified people: \`${verified}\`\n\
            Number of people that can see this channel: \`${hooman}\`\n\
            Number of bots that can see this channel: \`${bots}\``
            await message.reply({
                content: stats,
                failIfNotExists: false
            })
        }
        else{
            // Requested roles
            let requested = " ["
            roleList.forEach(role => requested+=`${role.name}, `)
            requested = requested.slice(0, -2) + "]"
            await message.channel.send(`Got request for${requested}`)
            await message.channel.sendTyping();

            // Check each member of the server if they have the given set of roles
            let num = 0
            mems.each(member => {
                const memberRoles = member.roles.cache
                let bool = true // This boolean turns false if a member does not have even one role in the given set
                roleList.forEach(role => {
                    if(!memberRoles.has(role.id)) {
                        bool = false
                    }
                })
                if(bool === true){
                    num += 1
                }
            })
            await message.reply({
                content: `${num} people has/have ${requested}`,
                failIfNotExists: false
            })
        }
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

                // Fetch attachments if any were deleted
                const fileUrls = []
                this.deletedMessage.attachments.forEach((attach) => {
                    fileUrls.push(attach.proxyURL)
                })

                // Send the deleted message with the reply of the original message if it exists
                await message.channel.send({
                    content: `<@${this.deletedMessage.author.id}>: ${this.deletedMessage.content}`,
                    reply: {
                        messageReference: repliedTo
                    },
                    files: fileUrls
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
                const originnalMessage = message.channel.messages.cache.get(this.editedMessage.id)

                // If the message exists, get the ID for replying to it
                let repliedTo = null

                // If the message does not exist, try replying to who he/she replied to instead
                if(originnalMessage === undefined) {
                    const reference = this.editedMessage.reference
                    if(reference != null) {
                        repliedTo = reference.messageId
                    }
                }

                // If the message exists, reply to it instead
                else {
                    repliedTo = this.editedMessage.id
                }

                let content = ""
                // If the command response has nothing to reply to or if the original message does not exist, 
                // add the message author tag to the response content
                if(repliedTo === null || originnalMessage === undefined){
                    content += `<@${this.editedMessage.author.id}>: `
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

    poll = async(message, args) => {
        clientInfo.message = message;

        // Poll help embed variable
        const pollHelpEmbed = new MessageEmbed({
            title: "Start a poll",
            color: "0x2A8A96",
            timestamp: Date.now()
        })
            .addField("!poll", "Usage:\n!poll Question [Option1][Option2]...[Option9]", false)
            .addField("\u200b", "To get the results of a poll, click the `Results` button on the poll (still under development)", false)
        
        if(args.length === 0) {
            await message.reply({
                embeds: [pollHelpEmbed],
                failIfNotExists: false
            })
        }
        else {
            // Get the poll arguments split on `[` which contains the question and options
            const pollArgs = message.content.substring(message.content.indexOf(args[0])).split("[")
            // Clean out the brackets and leading/trailing whitespaces, if any
            const pollList = []
            pollArgs.forEach(word => {
                const arg = word.replace("]", "").replace("[", "")
                if(arg != ""){
                    pollList.push(arg.trim())
                }
            })

            // Edge cases
            // When only the question is given
            if(pollList.length === 1) {
                await message.reply({
                    content: "Not enough parameters",
                    embeds: [pollHelpEmbed],
                    failIfNotExists: false
                })
            }
            // When only one option is provided
            else if(pollList.length === 2) {
                await message.reply({
                    content: "You need more than one choice",
                    embeds: [pollHelpEmbed],
                    failIfNotExists: false
                })
            }
            // When more than 9 options are provided
            else if(pollList.length > 10) {
                await message.reply({
                    content: "Choice limit is nine",
                    embeds: [pollHelpEmbed],
                    failIfNotExists: false
                })
            }
            else {
                // Question is the first element in the array. Following elements are each options
                const question = pollList.shift()
                const reactionList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
                // The poll question embed
                const pollEmbed = new MessageEmbed({
                    title: question,
                    color: "0x7289DA",
                    timestamp: Date.now()
                })
                // Add field to each option of the poll
                pollList.forEach(option => {
                    pollEmbed.addField("\u200b", `${reactionList[pollList.indexOf(option)]} ${option}`, false)
                })
                // Set the footer. This is important for the messageReactionAdd event in events.js
                pollEmbed.setFooter({text: `Poll by ${message.author.tag}`})

                // Poll statistics button
                const button = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('ps')
                            .setLabel("Stats (Button still under development)")
                            .setStyle("PRIMARY")
                    );
                
                const pollMessage = await message.channel.send({embeds: [pollEmbed], components: [button]})

                // Make the bot react for the length of options
                pollList.forEach(async (option) => {
                    await pollMessage.react(reactionList.shift())
                })
            }
        }
    }

    help = async(message) => {
        clientInfo.message = message;

        let content = "Help command is still under development. But here are the list of all available commands\n```"
        content += config.commands.join("\n")
        content += "```"
        await message.reply({
            content: content,
            failIfNotExists: false
        })
    }
}
const utils = new Utils()

module.exports = utils