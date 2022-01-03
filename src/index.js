// TODO -> Interactions and events

// Bot token from env
require('dotenv').config();
const TOKEN = process.env.TOKEN;

// Bot prefix
const config = require('./config.json');
const prefix = config["prefix"];


const {
    Client,
    Intents
} = require('discord.js');

// Bot Intents
const botIntents = new Intents();
botIntents.add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
);

// Create a new client instance
const client = new Client({
    intents: botIntents
});

// Commands from various files
const clientInfo = require("./client-commands/clientHelper");
const util = require("./client-commands/utils");
const dev = require("./client-commands/dev");
const verification = require("./client-commands/verification");
const moderation = require("./client-commands/mod");
const clientEvent = require("./client-commands/events")


client.once('ready', () => {
    console.log('Ready!');
    clientInfo.init(client);
});


client.on('messageCreate', async(message) => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if(util.commands.includes(command)){
        // fetching this command from within util
        await eval("util." + command)(message,args);

    } else if (dev.commands.includes(command)){
        // fetching this command from within dev
        await eval("dev." + command)(message,args);

    } else if (verification.commands.includes(command)){
        // fetching this command from within verification
        await eval("verification." + command)(message,args);

    } else if (moderation.commands.includes(command)){
        // fetching this command from within moderation
        await eval("moderation." + command)(message,args);

    } else {
        await message.reply("I have no response for this shit");
    }
});

// Other events
client.on("guildMemberAdd", async(member) => {
    await clientEvent.guildMemberAdd(member)
});

client.on("guildMemberRemove", async(member) => {
    await clientEvent.guildMemberRemove(member)
})

client.on("messageDelete", async(message) => {
    await clientEvent.messageDelete(message)
})


// Error handling
process.on("uncaughtException", function(err) {
    clientInfo.error(err);
});

client.login(TOKEN);