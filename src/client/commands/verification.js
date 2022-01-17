// Verification Related

const config = require('../../config.json');
const clientInfo = require("../helpers/clientHelper");
const {sleep} = require('../helpers/misc');
const {MessageEmbed, DiscordAPIError, Collection} = require('discord.js')


class Verification {
    constructor() {
        this.commands = new Collection()
            .set(this.verify, ["verify", "VERIFY", "Verify", "V", "v"])
            .set(this.info, ["info", "i"])
            .set(this.deverify, ["deverify", "d"])
            .set(this.file, ["file", "f"])
    }

    verify = async (message, args) => {
        clientInfo.message = message;

        // Embed objects
        let successEmbed = new MessageEmbed({
            title: "Success",
            color: "GREEN",
            timestamp: Date.now()
        })

        let failEmbed = new MessageEmbed({
            title: "Fail",
            color: "RED",
            timestamp: Date.now()
        })

        let processEmbed = new MessageEmbed({
            title: "Verification",
            color: "BLUE",
            timestamp: Date.now()
        })
            .addField("Process", "1. Enter SRN (PES1UG19.....) as argument\n2. Enter PRN (PES12019.....) as text when prompted by the bot")
            .addField("Process for 2018 batch", "1. Enter PRN (PES12018.....) as argument\n2. Enter section as text when prompted by the bot")
            .setImage("https://media.discordapp.net/attachments/746058859604606987/932689253677301801/unknown.png")

        var purgeMessageList = [message]; // Accumulating messages to later purge

        // Check if arguments are present
        if (args.length == 0) {
            const msg2 = await message.reply({
                embeds: [processEmbed],
                failIfNotExists: false
            });
            return;
        }

        // Check for verified role already present
        if (message.member.roles.cache.some(
            (role) => [config.verified].includes(role.id)
        )) {
            const msg2 = await message.reply({
                content: "You're already verified. Are you trying to steal someone's identity, you naughty little...",
                failIfNotExists: false
            });
            purgeMessageList.push(msg2);
            await sleep(10);
            await message.channel.bulkDelete(purgeMessageList);
            return;
        }

        // Get SRN/PRN, named as USN from here on
        const usn = args[0].toUpperCase();

        // Get collection from batch year
        const {batch_2018, batch_2019, batch_2020, batch_2021, verified} = require('../helpers/models');
        const year = usn.substring(6, 8);
        let dbc = null; // Collection object
        let sec = false; // This is done because PRN based verification use section for validation
        if (year === "18"){
            dbc = batch_2018;
            sec = true;
        }
        else if (year === "19"){
            dbc = batch_2019;
        }
        else if (year === "20"){
            dbc = batch_2020;
        }
        else if (year === "21"){
            dbc = batch_2021;
        }
        else {
            const msg2 = await message.reply({
                content: "Check your SRN/PRN and try again",
                embeds: [processEmbed],
                failIfNotExists: false
            });
            purgeMessageList.push(msg2);
            await sleep(30);
            await message.channel.bulkDelete(purgeMessageList);
            return;
        }

        // Mongoose for user data
        const mongoose = require('mongoose');

        // Mongoooooooooooooooooooooooooooose
        mongoose.connect('mongodb://localhost:27017/pesu',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get PESU academy details from SRN/PRN
        const batchRes = await dbc.findOne({SRN: usn});
        if(batchRes === null ){
            const msg2 = await message.reply({
                content: "Given SRN/PRN not found. Try again",
                embeds: [processEmbed],
                failIfNotExists: false
            });
            return;
        }

        // To check if given SRN is already verified
        const verRes = await verified.findOne({PRN: batchRes.PRN});
        if(verRes != null) {
            const adminRole = message.guild.roles.cache.get(config.admin).name
            const botDevRole = message.guild.roles.cache.get(config.botDev).name
            const msg2 = await message.reply({
                content: `You have already been verified.\n\
            To avoid spamming, we allow only one account per user.\n\
            If you think someone else has used your SRN, please ping \`${adminRole}\` or \`${botDevRole}\` without fail`,
                failIfNotExists: false
            });
            return;
        }

        // Section/PRN based validation step
        var validate = ""; // User response. Will be filled in message collector later
        var check = ""; // Database response with which validation happens
        if(sec === true) {
            var msg2 = await message.reply({
                content: "Now enter your section to complete verification",
                failIfNotExists: false
            });
            validate = "Section ";
            check = batchRes.Section;
        }
        else {
            var msg2 = await message.reply({
                content: "Now enter your PRN to complete verification",
                failIfNotExists: false
            });
            check = batchRes.PRN;
        }
        purgeMessageList.push(msg2);

        // Message collector for validation response by user
        const filter = m => m.author.id === message.author.id // Filter for message collector
        const collector = message.channel.createMessageCollector({filter, max: 1, time: 60000}); //Timeout in ms
        var success = null;
        collector.on('collect', function(msg) {
            // If Section/PRN matches and verification success
            var msg3 = msg;
            purgeMessageList.push(msg3);
            validate += msg.content.toUpperCase();
            if (check===validate){
                success = true;
            }
            else {
                success = false;
            }
            message = msg
        });
        collector.on('end', async function(collected) {
            // Timeout message
            if(collected.size === 0){
                failEmbed.addField("Time-out", "You took too long to respond. Time limit is 1 minute. Try again")
                const msg4 = await message.reply({
                    embeds: [failEmbed],
                    failIfNotExists: false
                });
                purgeMessageList.push(msg4);
            }
            else {
                // On validation success
                if(success === true) {
                    successEmbed.addField("PRN", batchRes.PRN, true)
                        .addField("SRN", batchRes.SRN, true)
                        .addField("Semester", batchRes.Semester, true)
                        .addField("Section", batchRes.Section, true)
                        .addField("Cycle", batchRes.Cycle, true)
                        .addField("Stream/Campus", batchRes.CandB, true)
                        .addField("Stream", batchRes.Branch, true)
                        .addField("Campus", batchRes.Campus, true)
                    const msg4 = await message.reply({
                        embeds: [successEmbed],
                        failIfNotExists: false
                    });
                    purgeMessageList.push(msg4);

                    // DMs the member with a welcome message
                    try {
                        await message.member.send({
                            content: `Thanks for verifying yourself. <#860224115633160203> is the general lobby where you can say hi and talk with everyone. You can also head over to <#778823213345538068> to pick up additional roles for certain private channels.\nIf you need any help, you can text any online \`${message.member.guild.roles.cache.get(config.admin).name}\` or \`${message.member.guild.roles.cache.get(config.mod).name}\`. Have fun!\n\n(Do not reply to this bot. This message was auto-generated)`
                        })
                    } catch (error) {
                        if(error instanceof DiscordAPIError) {
                            successEmbed.addField("\u200b", "DMs were closed")
                        }
                        else {
                            throw(error)
                        }
                    }

                    // Get appropriate role based on branch and year of study
                    if (year === "18"){
                        const roleId = "802008729191972905";
                        var role = message.guild.roles.cache.get(roleId);
                    }
                    else if (year === "19"){
                        const roleStr = batchRes.CandB.toString().replace(' Campus', '').replace(' ', '').replace('BIOTECHNOLOGY','BT')
                        var role = message.guild.roles.cache.find((r) => r.name === roleStr)
                    }
                    else if (year === "20"){
                        const roleStr = batchRes.Branch + "(Junior)"
                        var role = message.guild.roles.cache.find((r) => r.name === roleStr)
                    }
                    else {
                        const roleStr = batchRes.Branch + "(Kid)"
                        var role = message.guild.roles.cache.find((r) => r.name === roleStr)
                    }

                    // Get verified and 'just joined' role
                    const verified_role = message.guild.roles.cache.get(config.verified);
                    const just_joined_role = message.guild.roles.cache.get(config.just_joined);

                    // Add required roles and remove just joined role
                    await message.member.roles.add([role, verified_role]);
                    await message.member.roles.remove(just_joined_role);

                    // Add data to verified collection in mongoDB
                    const verifiedDoc = new verified(
                        {
                            Username: message.member.displayName,
                            ID: message.member.id.toString(),
                            PRN: batchRes.PRN
                        }
                    );
                    await verifiedDoc.save(function (err, verified) {
                        if (err) throw err;
                    });

                    // Send success embed to bot logs
                    const botLogs = message.guild.channels.cache.get(config.logs)
                    await botLogs.send({content: `<@${message.member.id}>`,embeds: [successEmbed]})
                }
                else {
                    failEmbed.addField("Validation failed", "Given PRN/Section does not match the record")
                    const msg4 = await message.reply({
                        embeds: [failEmbed],
                        failIfNotExists: false
                    });
                    purgeMessageList.push(msg4);
                }
            }

            // Purge the messages
            await sleep(10);
            await message.channel.bulkDelete(purgeMessageList);
        });
    }
    

    info = async (message, args) => {
        clientInfo.message = message;

        // Check appropriate roles
        if (message.member.roles.cache.some((role => [config.admin, config.mod, config.botDev].includes(role.id)))) {
            if (args.length == 0) {
                await message.reply({
                    content: "Mention a user to get info about",
                    failIfNotExists: false
                })
            }
            else {
                // Mentions check
                // Since reply is also a mention technically, need to remove it first if it exists
                if(message.type === "REPLY"){
                    message.mentions.members.delete(message.mentions.repliedUser.id);
                }
                var membMention = message.mentions.members.first();

                // Get arguments
                const mem = args[0].toString();

                // Find member ID based on either mention, nickname or ID
                const member = message.guild.members.cache.find((m) => {
                    if(membMention != null) {
                        return membMention.id === m.id
                    }
                    else if (isNaN(mem)) {
                        return mem === m.user.username
                    }
                    else {
                        return mem === m.id
                    }
                })
                if(member === undefined) {
                    await message.reply({
                        content: "Mention a valid user (either @ them or type their username or put their user ID",
                        failIfNotExists: false
                    })
                }
                else{

                    // Connect to MongoDB
                    const mongoose = require('mongoose');
                    const {batch_2018, batch_2019, batch_2020, batch_2021, verified} = require('../helpers/models');
                    mongoose.connect('mongodb://localhost:27017/pesu',
                    {
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                    });

                    // Get user data from verified collection
                    const verRes = await verified.findOne({ID: member.id});
                    if(verRes === null){
                        await message.reply({
                            content: "This user is not verified yet",
                            failIfNotExists: false
                        })
                        return
                    }

                    // Get year of study for getting batch data
                    const year = verRes.PRN.substring(6, 8)
                    let dbc = null;
                    if(year === "18"){
                        dbc = batch_2018
                    }
                    else if(year === "19"){
                        dbc = batch_2019
                    }
                    else if(year === "20"){
                        dbc = batch_2020
                    }
                    else{
                        dbc = batch_2021
                    }

                    // Get Batch Data for remaining data
                    const batchRes = await dbc.findOne({PRN: verRes.PRN})

                    if(batchRes === null) {
                        await message.reply({
                            content: "Missing data!!!\n<@723377619420184668>",
                            failIfNotExists: false
                        })
                    }
                    else {
                        const details = {
                            "Username": verRes.Username,
                            "MemberID": verRes.ID,
                            "PRN": batchRes.PRN,
                            "SRN": batchRes.SRN,
                            "Semester": batchRes.Semester,
                            "Section": batchRes.Section,
                            "Cycle": batchRes.Cycle,
                            "Stream/Campus": batchRes.CandB,
                            "Stream": batchRes.Branch,
                            "Campus": batchRes.Campus
                        }

                        // Create Embed to send
                        let sendEmbed = new MessageEmbed(
                            {
                                title: "User Info",
                                timestamp: Date.now(),
                                color: "0x48BF91"
                            }
                        )

                        // Add each details field in the embed
                        for (const key in details) {
                            sendEmbed.addField(key, details[key], true)
                        }
                        await message.reply({
                            embeds: [sendEmbed],
                            failIfNotExists: false
                        })
                    }
                }
            }
        }
        else {
            await message.reply({
                content: "You are not authorised to run this command",
                failIfNotExists: false
            })
        }
    }


    deverify = async(message, args) => {
        clientInfo.message = message;

        // Check appropriate roles
        if (message.member.roles.cache.some((role => [config.admin, config.mod, config.botDev].includes(role.id)))) {
            if (args.length == 0) {
                await message.reply({
                    content: "Mention a user to get info about",
                    failIfNotExists: false
                })
            }
            else {
                // Mentions check
                // Since reply is also a mention technically, need to remove it first if it exists
                if(message.type === "REPLY"){
                    message.mentions.members.delete(message.mentions.repliedUser.id);
                }
                var membMention = message.mentions.members.first();

                // Get arguments
                const mem = args[0].toString();

                // Find member ID based on either mention, nickname or ID
                const member = message.guild.members.cache.find((m) => {
                    if(membMention != null) {
                        return membMention.id === m.id
                    }
                    else if (isNaN(mem)) {
                        return mem === m.user.username
                    }
                    else {
                        return mem === m.id
                    }
                })
                if(member === null) {
                    await message.reply({
                        content: "Mention a valid user (either @ them or type their username or put their user ID",
                        failIfNotExists: false
                    })
                }
                else{
                    // Remove member details from verified collection
                    const {deverifyFunc} = require("../helpers/misc")
                    const ret = await deverifyFunc(member.id)
                    if(ret === true){
                        // Remove all roles of the member
                        let roleCollection = member.roles.cache
                        roleCollection.delete("742797665301168220") // @everyone role should be removed from the collection
                        const just_joined = member.guild.roles.cache.get(config.just_joined); // Adding just joined role
                        
                        // De-bugging purpose. Whenever admin or bot dev is testing something, their roles will not be affected
                        try {
                            await member.roles.remove(roleCollection);
                            await member.roles.add(just_joined)
                        } catch (error) {
                            if (error instanceof DiscordAPIError){}
                            else{
                                throw error
                            }
                        }
                        await message.reply({
                            content: "De-verified <@"+member.id+">",
                            failIfNotExists: false
                        })
                    }
                    else{
                        await message.reply({
                            content: "This user was not verified in the first place",
                            failIfNotExists: false
                        })
                    }
                }
            }
        }
        else {
            await message.reply({
                content: "You are not authorised to run this command",
                failIfNotExists: false
            })
        }
    }


    file = async(message) => {
        clientInfo.message = message;
        
        // Check appropriate roles
        if (message.member.roles.cache.some((role => [config.admin, config.botDev].includes(role.id)))) {
            await message.reply({
                content: "You have clearance",
                failIfNotExists: false
            })

            // Get bot-test channel to send the file to
            const botTest = message.guild.channels.cache.get("749473757843947671")
            await botTest.sendTyping()

            // Mongoose for user data
            const mongoose = require('mongoose')
            const {verified} = require('../helpers/models')
            const fs = require('fs')

            mongoose.connect('mongodb://localhost:27017/pesu',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

            const res = await verified.find().lean()

            // Write to file and send
            fs.writeFileSync('verified.json', JSON.stringify(res, null, 4))
            await botTest.send({files: ["./verified.json"]})


        }
        else {
            await message.reply({
                content: "You are not authorised to run this command",
                failIfNotExists: false
            })
        }
    }

}

const verifyFunctions = new Verification()

module.exports = verifyFunctions

