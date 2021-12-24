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
const client = new Client(
    {intents: botIntents}
);

const commandFunctions = require("./client-commands/commands");

client.once('ready', () => {
    console.log('Ready!');
    commandFunctions.init(client);
});
client.on('messageCreate', (message) => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (availableCommands.includes(command)) {
        eval("commandFunctions."+command)(message,args);
    }
    else {
        message.reply("I have no response for this shit");
    }
});

process.on("uncaughtException", function(err) {
    commandFunctions.error(err);
    // console.log("Caught exception: " + err);
});

client.login(TOKEN);
