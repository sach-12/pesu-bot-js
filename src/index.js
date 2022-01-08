// TODO -> Interactions

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
    clientInfo.init(client);
    console.log('Ready!');
});


client.on('messageCreate', async(message) => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    let commandFunc = async() => {}

    if(util.commands.some(aliases => aliases.includes(command))) {
        commandFunc = util.commands.findKey(aliases => aliases.includes(command));
    }
    else if(dev.commands.some(aliases => aliases.includes(command))) {
        commandFunc = dev.commands.findKey(aliases => aliases.includes(command))
    }
    else if(verification.commands.some(aliases => aliases.includes(command))) {
        commandFunc = verification.commands.findKey(aliases => aliases.includes(command))
    }
    else if(moderation.commands.some(aliases => aliases.includes(command))) {
        commandFunc = moderation.commands.findKey(aliases => aliases.includes(command))
    }
    else {
        commandFunc = async() => {await message.reply("I have no response for this shit")}
    }
    await commandFunc(message, args)
});

// Other events
client.on("guildMemberAdd", async(member) => {
    await clientEvent.guildMemberAdd(member)
});

client.on("guildMemberRemove", async(member) => {
    await clientEvent.guildMemberRemove(member)
})

client.on("guildMemberUpdate", async(oldMember, newMember) => {
    await clientEvent.guildMemberUpdate(oldMember, newMember)
})

client.on("messageDelete", async(message) => {
    await clientEvent.messageDelete(message)
})

client.on("messageUpdate", async(oldMessage, newMessage) => {
    await clientEvent.messageUpdate(oldMessage, newMessage)
})

client.on("messageReactionAdd", async(messageReaction, user) => {
    await clientEvent.messageReactionAdd(messageReaction, user)
})

client.on("threadCreate", async(threadChannel) => {
    await clientEvent.threadCreate(threadChannel)
})

// Error handling
process.on("uncaughtException", function(err) {
    clientInfo.error(err);
});

client.login(TOKEN);