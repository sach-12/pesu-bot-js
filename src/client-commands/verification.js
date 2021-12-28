// Verification Related

const config = require('../config.json');
const clientInfo = require("./clientHelper");


class Verification {
    constructor() {
        this.commands = [
            "verify",
            // "info",
            // "deverify",
            // "file"
        ];
    }
    verify = async (message, args) => {
        clientInfo.message = message;

        // Check for verified role already present
        if (message.member.roles.cache.some(
            (role) => [config.verified].includes(role.id)
        )) {
            return await message.reply("You're already verified. Are you trying to steal someone's identity, you naughty little...");
        }

        // Mongoose for user data
        const mongoose = require('mongoose');

        // Check if arguments are present
        if (args.length == 0) {
            return await message.reply("Put your SRN/PRN");
        }

        // Get SRN/PRN, named as USN from here on
        const usn = args[0].toUpperCase();

        // Get collection from batch year
        const {batch_2018, batch_2019, batch_2020, batch_2021, verified} = require('./models');
        const year = usn.substring(6, 8);
        let dbc = null; // Collection object
        let sec = null; // This is done because PRN based verification use section for validation
        var finder = {SRN: usn}; // Default collection finder will be SRN based. Only for 2021 batch, it is PRN based (for now)
        if (year === "18"){
            dbc = batch_2018;
            sec = true;
        }
        else if (year === "19"){
            dbc = batch_2019;
            sec = false;
        }
        else if (year === "20"){
            dbc = batch_2020;
            sec = false;
        }
        else if (year === "21"){
            dbc = batch_2021;
            sec = true;
            finder = {PRN: usn};
        }
        else {
            await message.reply("Check your SRN/PRN and try again");
            return;
        }

        // Mongoooooooooooooooooooooooooooose
        mongoose.connect('mongodb://localhost:27017/pesu',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Get PESU academy details from SRN/PRN
        const batchRes = await dbc.findOne(finder);
        console.log(batchRes);
        if(batchRes === null ){
            await message.reply("Given SRN/PRN not found. Try again");
            return;
        }

        // To check if given SRN is already verified
        const verRes = await verified.findOne({PRN: batchRes.PRN});
        console.log(verRes);
        if(verRes != null) {
            await message.reply("SRN already verified");
            return;
        }

        // Section/PRN based validation step
        var validate = ""; // User response. Will be filled in message collector later
        var check = ""; // Database response with which validation happens
        if(sec === true) {
            await message.reply("Now enter your section to complete verification");
            validate = "Section ";
            check = batchRes.Section;
        }
        else {
            await message.reply("Now enter your PRN to complete verification");
            check = batchRes.PRN;
        }

        // Message collector for validation response by user
        const filter = m => m.author.id === message.author.id // Filter for message collector
        const collector = message.channel.createMessageCollector({filter, max: 1, time: 30000}); //Timeout in ms
        collector.on('collect', async function(message) {
            // If Section/PRN matches and verification success
            // TODO: Add appropriate roles
            validate += message.content.toUpperCase();
            if (check === validate) {
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
        });
    }

}

const verifyFunctions = new Verification()

module.exports = verifyFunctions

