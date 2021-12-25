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
    
    verify = (message) => {
        this.message = message;

        // Check for verified role already present
        if (message.member.roles.cache.some(
            (role) => [config.verified].includes(role.id)
        )) {
            return message.reply("You're already verified. Are you trying to steal someone's identity, you naughty little...");
        }

        // MongoDB Client for user data
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://localhost:27017/";

        // Get args
        const args = message.content.slice(1).trim().split(/ +/);
        if (args.length == 1) {
            message.reply("Put your SRN/PRN");
            return;
        }

        // Get SRN/PRN, named as USN from here on
        const usn = args[1].toUpperCase();

        // Get batch year for collection name
        let year = usn.substring(6, 8);
        if (year === "21" || year === "19" || year === "20" || year === "21") {}
        else {
            message.reply("Check your SRN/PRN and try again");
            return;
        }
        var dbc = "batch_20"+year;

        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("pesu");
            dbo.collection(dbc).findOne({SRN: usn}, function(err, res) {
                if (err) throw err;

                // If USN not found
                if(res == null) {
                    message.reply("Given SRN/PRN not found. Try again!");
                    db.close();
                    return;
                }

                // Section validation for 2018 and 2022 batch
                if (usn.startsWith("PES12") || usn.startsWith("PES22")) {
                    var sec = true;
                    var check = res.Section;
                    message.reply("Now enter your section to complete verification");
                }

                // SRN validation for 2019 and 2020 batch
                else {
                    var sec = false;
                    var check = res.PRN;
                    message.reply("Now enter your PRN to complete verification");
                }

                // Message collector for awaiting for response (Section or PRN)
                const filter = m => m.author.id === message.author.id
                const collector = message.channel.createMessageCollector({filter, max: 1, time: 10000}); //Timeout in ms
                collector.on('collect', message => {

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
                        message.channel.send("Verification success");
                        collector.stop;
                    }
                    else {
                        message.channel.send("Verification failed");
                        collector.stop;
                    }
                });
                collector.on('end', collected => {
                    // Timeout message
                    if(collected.size === 0){
                        message.channel.send("Timed out. Try again");
                    }
                    db.close();
                });
            });
        });
    }

    error = (err) => {
        //upon any errors all will be dumped to BotLogs channel
        if (this.message && this.client) {
            let BotLogs = this.client.channels.cache.get(config.logs)
            if (BotLogs && this.message) {
                    BotLogs.send({ content: "Error occurred " + err + " by <@" + this.message.author.id + "> in <#" + this.message.channel + ">" });
                    this.message.reply("Error occurred " + err);
            }
        }
        else {
            console.log("Invalid token or network issue detected\nIf this is printed in github workflow, build is successful" + err);
            // this isnt a true test. just a starting of bot to check the syntax errors etc if any
        }
    }
};

const commandFunctions = new Commands()

module.exports = commandFunctions

