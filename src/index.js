require('dotenv').config();
const TOKEN = process.env.TOKEN;

const config = require('./config.json');
const prefix = config["prefix"];
const availableCommands = config["commands"];


const {
    Client,
    Intents
} = require('discord.js');

const botIntents = new Intents();
botIntents.add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES
);

// Create a new client instance
const client = new Client({
    intents: botIntents
});

const clientInfo = require("./client-commands/clientHelper");
const util = require("./client-commands/utils");
const dev = require("./client-commands/dev");
const verification = require("./client-commands/verification");
const moderation = require("./client-commands/mod");
const misc = require("./client-commands/misc");

client.once('ready', () => {
    console.log('Ready!');
    clientInfo.init(client);
});
client.on('messageCreate', (message) => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if(util.commands.includes(command)){
        // fetching this command from within util
        eval("util." + command)(message,args);

    } else if (dev.commands.includes(command)){
        // fetching this command from within dev
        eval("dev." + command)(message,args);

    } else if (verification.commands.includes(command)){
        // fetching this command from within verification
        eval("verification." + command)(message,args);

    } else if (moderation.commands.includes(command)){
        // fetching this command from within moderation
        eval("moderation." + command)(message,args);

    } else if (misc.commands.includes(command)){
        // fetching this command from within misc
        eval("misc." + command)(message,args);
    
    } else {
        message.reply("I have no response for this shit");
    }
});

process.on("uncaughtException", function(err) {
    clientInfo.error(err);
    // console.log("Caught exception: " + err);
});

client.login(TOKEN);