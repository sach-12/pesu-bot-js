//anything verification related

const config = require('../config.json');
const clientInfo = require("./clientHelper");

let {batch_2018, batch_2019, batch_2020, batch_2021, verified} = require('./models');

class Verification {
    constructor() {
        this.commands = [
            "verify"
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

        // Get batch year for model object
        const year = usn.substring(6, 8);
        let dbc = null;
        if (year === "18") dbc = batch_2018;
        else if (year === "19") dbc = batch_2019;
        else if (year === "20") dbc = batch_2020;
        else if (year === "21") dbc = batch_2021;
        else {
            await message.reply("Check your SRN/PRN and try again");
            return;
        }

        mongoose.connect('mongodb://localhost:27017/pesu',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const batchRes = await dbc.findOne({SRN: usn});
        console.log(batchRes.PRN);
        const verRes = await verified.findOne({PRN: "PES1201900075"});
        console.log(verRes);

        // MongoClient.connect(url, function(err, db) {
        //     if (err) throw err;
        //     var dbo = db.db("pesu");
        //     dbo.collection(dbc).findOne({SRN: usn}, function(err, res) {
        //         if (err) throw err;
        //         batchRes = res;
        //     });
        //     dbo.collection("verified").findOne({prn: batchRes.prn}, function(err, vRes) {
        //         if (err) throw err;
        //         verRes = vRes;
        //     });
        // });

        // console.log(batchRes);
        // console.log(verRes);
        return;
        // If USN not found
        if(res == null) {
            await message.reply("Given SRN/PRN not found. Try again!");
            db.close();
            return;
        }

        // If user's details already exists in the verified collection
        var exists = false;
        dbo.collection("verified").findOne({prn: res.prn}, async function(err, verres) {
            if (verres != null) {
                await message.reply("SRN already verified");
                exists = true;
                return;
            }
        });
        if (exists === true) return;

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
    }

}

const verifyFunctions = new Verification()

module.exports = verifyFunctions

