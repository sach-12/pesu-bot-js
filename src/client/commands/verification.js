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
        await message.reply({
            content: "`!verify` is no longer supported. Please check out the new verification process at <#742946580285620225>.",
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
                        content: "Mention a valid user (either @ them or type their username or put their user ID)",
                        failIfNotExists: false
                    })
                }
                else{

                    // Connect to MongoDB
                    const mongoose = require('mongoose');
                    const {batch, verified} = require('../helpers/models');
                    await mongoose.connect(process.env.MONGO_URI,
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

                    // Get Batch Data for remaining data
                    const batchRes = await batch.findOne({PRN: verRes.PRN})

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
                        content: "Mention a valid user (either @ them or type their username or put their user ID)",
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

            mongoose.connect(process.env.MONGO_URI,
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

