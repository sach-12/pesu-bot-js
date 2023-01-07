// Helper functions used in other files
const cron = require('node-cron')

class Misc {
    constructor() {
        this.commands = [

        ];
    }

    sleep = (seconds) => 
        new Promise(resolve => setTimeout(resolve, seconds*1000))

    // Function to deverify members when they leave the server or when !d is used
    deverifyFunc = async(mid) => {
        const mongoose = require('mongoose')
        const {verified} = require('./models')

        mongoose.connect(process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const ret = await verified.findOneAndDelete({ID: mid})
        if(ret === null) {
            return false
        }
        else {
            return true
        }
    }

    // Function to run shell scripts in a promisified way
    shell = (cmd) => {   
        const { exec } = require('child_process')
        return new Promise((resolve, reject) => {
            cmd = cmd.replace(/\n/g, " && ")
            exec(
                cmd,
                (error, stdout, stderr) => {
                    if(error) throw error
                    resolve(stdout? stdout : stderr)
                })  
        })

    }

    // This function is used to register slash commands and context menu commands to discord
    // through the discord API. This function can be called in any other common function
    // and commands need to be registered only once
    applicationCommandRegister = async() => {
        const {REST} = require('@discordjs/rest')
        const {Routes} = require('discord-api-types/v9')
        const {SlashCommandBuilder, ContextMenuCommandBuilder} = require('@discordjs/builders')
        const token = process.env.TOKEN;
        const clienId = "980529206276526100"
        const guildId = "742797665301168220"

        let interList = [] // List of interaction builders
        
        const pride = new SlashCommandBuilder()
            .setName('pride')
            .setDescription('Flourishes you with the pride of PESU')
            .addStringOption(option => 
                option.setName('link')
                    .setDescription('The message link to reply with the pride to')
                    .setRequired(false));
        interList.push(pride)
        
        const changenick = new SlashCommandBuilder()
            .setName('changenick')
            .setDescription('Change someone else\'s nickname')
            .addUserOption(option => 
                option.setName('member')
                .setDescription('The member who\'s name you want to change')
                .setRequired(true))
            .addStringOption(option => 
                option.setName('new_nick')
                .setDescription('The new nickname you wanna give this user')
                .setRequired(true));
        interList.push(changenick);
        
        const anon = new SlashCommandBuilder()
            .setName('anon')
            .setDescription('Send messages anonymously to the general lobby channel')
            .addStringOption(option => 
                option.setName('message')
                .setDescription('The message you want to send')
                .setRequired(true))
            .addStringOption(option => 
                option.setName('link')
                .setDescription('Message link you want to reply to')
                .setRequired(false));
        interList.push(anon);

        const bananon = new SlashCommandBuilder()
            .setName('bananon')
            .setDescription('Ban a user from using anon based on message link')
            .addStringOption(option => 
                option.setName('link')
                .setDescription('The message link you want to use to ban')
                .setRequired(true))
            .addStringOption(option => 
                option.setName('reason')
                .setDescription('Reason for ban')
                .setRequired(false));
        interList.push(bananon)

        const bananoncontext = new ContextMenuCommandBuilder()
            .setName('Ban this anon')
            .setType(3)
        interList.push(bananoncontext)

        const userbananon = new SlashCommandBuilder()
            .setName('userbananon')
            .setDescription('Ban a user from using anon messaging feature')
            .addUserOption(option => 
                option.setName('member')
                .setDescription('The member who you wanna ban')
                .setRequired(true))
            .addStringOption(option => 
                option.setName('reason')
                .setDescription('Reason for banning')
                .setRequired(false));
        interList.push(userbananon);

        const userunbananon = new SlashCommandBuilder()
            .setName('userunbananon')
            .setDescription('Unban a user from using anon messaging')
            .addUserOption(option => 
                option.setName('member')
                .setDescription('The member you wanna unban')
                .setRequired(true));
        interList.push(userunbananon)
        
        // Registration process
        const rest = new REST({version: '9'}).setToken(token)
        try {
            console.log("Started...")
            const res = await rest.put(
                Routes.applicationGuildCommands(clienId, guildId),
                {body: interList}
            );
            console.log(res)
            console.log("Success")
        } catch (error) {
            console.log(error)
        }
    }

    // Function to add anon banned users to the database
    // Returns true if operation was a success, false if the document already existed
    anonbanHelper = async(mid, reason) => {
        const {connect} = require('mongoose')
        const {anonban} = require('./models')

        connect(process.env.MONGO_URI,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const res = await anonban.findOne({ID: mid})
        if(res != null) {
            return false
        }

        else {
            const banDoc = new anonban(
            {
                ID: mid,
                Reason: reason
            }
            );
            await banDoc.save((err, verified) => {
                if(err) throw err;
            })
            return true
        }
    }

    // A daily task to flush the anonCache data
    dailyTask = cron.schedule('0 0 0 */1 * *', () => {
        const slash = require('../interactions/slash')
        slash.anonCache = {}
    })
}
const misc = new Misc()

module.exports = misc