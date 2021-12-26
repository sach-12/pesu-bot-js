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
    }

    uptime = async (message) => {
        this.message = message;
        const currTime = Math.floor(Date.now() / 1000);
        await message.reply("Bot was started <t:" + this.startTime + ":R>\ni.e., on <t:" + this.startTime + ":f>");
    }

    ping = async (message) => {
        this.message=message
        await message.channel.send(`Pong!!!\nPing =\`${this.client.ws.ping} ms\``);
    }
    echo = async (message) => {
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

    support = async (message) => {
        this.message = message
        return await message.reply("You can contribute to the bot here\nhttps://github.com/sach-12/pesu-bot-js")
    }
    
    verify = async (message, args) => {
        this.message = message;

        // Check for verified role already present
        if (message.member.roles.cache.some(
            (role) => [config.verified].includes(role.id)
        )) {
            return await message.reply("You're already verified. Are you trying to steal someone's identity, you naughty little...");
        }

        // MongoDB Client for user data
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://localhost:27017/";

        // Check if arguments are present
        if (args.length == 0) {
            return await message.reply("Put your SRN/PRN");
        }

        // Get SRN/PRN, named as USN from here on
        const usn = args[0].toUpperCase();

        // Get batch year for collection name
        let year = usn.substring(6, 8);
        if (year === "21" || year === "19" || year === "20" || year === "21") {}
        else {
            return await message.reply("Check your SRN/PRN and try again");
        }
        var dbc = "batch_20"+year;

        MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("pesu");
            dbo.collection(dbc).findOne({SRN: usn}, async function(err, res) {
                if (err) throw err;

                // If USN not found
                if(res == null) {
                    await message.reply("Given SRN/PRN not found. Try again!");
                    db.close();
                    return;
                }

                // Section validation for 2018 and 2022 batch
                if (usn.startsWith("PES12") || usn.startsWith("PES22")) {
                    var sec = true;
                    var check = res.Section;
                    await message.reply("Now enter your section to complete verification");
                }

                // SRN validation for 2019 and 2020 batch
                else {
                    var sec = false;
                    var check = res.PRN;
                    await message.reply("Now enter your PRN to complete verification");
                }

                // Message collector for awaiting for response (Section or PRN)
                const filter = m => m.author.id === message.author.id
                const collector = message.channel.createMessageCollector({filter, max: 1, time: 10000}); //Timeout in ms
                collector.on('collect', async function(message) {

                    // For section: append "Section " before
                    if(sec == true) {
                        var res = "Section "+message.content.toUpperCase();
                    }
                    else {
                        var res = message.content.toUpperCase();
                    }

                    // If Section/PRN matches and verification success
                    // TODO: Add appropriate roles
                    if (check === res) {
                        await message.channel.send("Verification success");
                        collector.stop;
                    }
                    else {
                        await message.channel.send("Verification failed");
                        collector.stop;
                    }
                });
                collector.on('end', async function(collected) {
                    // Timeout message
                    if(collected.size === 0){
                        await message.channel.send("Timed out. Try again");
                    }
                    db.close();
                });
            });
        });
    }

    error = async (err) => {
        //upon any errors all will be dumped to BotLogs channel
        if (this.message && this.client) {
            let BotLogs = this.client.channels.cache.get(config.logs)
            if (BotLogs && this.message) {
                    await BotLogs.send({ content: "Error occurred " + err + " by <@" + this.message.author.id + "> in <#" + this.message.channel + ">" });
                    await this.message.reply("Error occurred " + err);
            }
        }
        else {
            console.log("Invalid token or network issue detected\nIf this is printed in github workflow, build is successful\n" + err);
            // this isnt a true test. just a starting of bot to check the syntax errors etc if any
        }
    }
    
    purge = async (message, args) => {
        this.message=message;

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

    kick = async(message, args) => {
        this.message=message;
        let modLogs = this.client.channels.cache.get(config.modlogs);

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
};

const commandFunctions = new Commands()

module.exports = commandFunctions

