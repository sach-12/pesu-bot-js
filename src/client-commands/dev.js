// Developmental commands and commands BotDev can use
const { Collection, MessageEmbed } = require('discord.js');
const config = require('../config.json');
const clientInfo = require("./clientHelper");
const { shell } = require('./misc')

class DevCommands {

    constructor() {
        this.commands = new Collection()
            .set(this.echo, ["echo", "e"])
            .set(this.purge, ["purge", "p"])
            .set(this.gitpull, ["gitpull", "pull"])
            // .set(this.restart, ["restart"])
            .set(this.bash, ["bash"])
    }

    echo = async (message, args) => {
        clientInfo.message = message

        // check if the user has any of the given roles
        if (message.member.roles.cache.some(
            (role) => [config.admin, config.mod, config.botDev].includes(role.id)
        )) {
            // Help embed variable
            const echoHelpEmbed = new MessageEmbed({
                title: "Echo",
                color: "AQUA",
                description: "`!echo`\n!echo [Channel Mention] [Message(with any attachment)]\n\nEchoes a message to the target channel\n",
                timestamp: Date.now()
            })

            // Get the target destination channel
            const target = message.mentions.channels.first()
            if(target) {
                // Get the content to echo
                if(args[1]) {
                    const content = message.content.substring(message.content.indexOf(args[1]))
                    
                    // Fetch attachments if any
                    const fileUrls = []
                    message.attachments.forEach((attach) => {
                        fileUrls.push(attach.proxyURL)
                    })
                    // Delete the message if it's the same channel echo
                    if(target.id === message.channel.id) {
                        await message.delete()
                    }

                    // Send the echo
                    await target.send({content: content, files: fileUrls})
                }
                else {
                    await message.reply({content: "What to echo?", embeds: [echoHelpEmbed]})
                }
            }
            else {
                await message.reply({content: "Echo to what channel?", embeds: [echoHelpEmbed]})
            }
        }
        else {
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

    gitpull = async(message) => {
        clientInfo.message = message;

        // git pull can be run only by Han or Stark
        if((message.author.id === "723377619420184668") || (message.author.id === "718845827413442692")) {
            const shellRes = await shell("cd .. && git pull")
            await message.reply(shellRes)
        }
        else {
            await message.reply("You are not authorised to run this command")
        }
    }

    bash = async(message) => {
        clientInfo.message = message;

        // bash can be run only by Han or Stark
        if((message.author.id === "723377619420184668") || (message.author.id === "718845827413442692")) {
            await message.reply("Enter the command");
            const filter = m => m.author.id === message.author.id // Filter for message collector
            const collector = message.channel.createMessageCollector({filter, max: 1, time: 60000}); //Timeout in ms
            let args;
            collector.on('collect', async(msg) => {
                message = msg
                // Remove markdown if exists
                try{
                    let removeMD = message.content.replace(/```/g, "")
                    args = removeMD.trim().split(/ +/);
                } catch(err){
                    args = message.content.trim().split(/ +/);
                }

                // Dis-allow system changes
                if (args.includes("sudo") || args.includes("su") || message.content.includes(">")) {
                    await message.reply("This might overwrite the file contents, not gonna do")
                    return
                }
                
                // Run the shell script
                const shellRes = await shell(args.join(" "))
                if (shellRes) {
                    await message.reply(shellRes)
                } else {
                    await message.reply("Command executed successfully with no output")
                }
            });
            collector.on('end', async function(collected) {
                // Timeout message
                if(collected.size === 0){
                    await message.reply("Command timed out")
                }    
            });
        }
        else {
            await message.reply("You are not authorised to run this command")
        }
    }
}

const devTools = new DevCommands()

module.exports = devTools