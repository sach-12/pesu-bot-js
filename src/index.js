// Pending -> help command, restart command, mongodb setup in digital ocean
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
const clientInfo = require("./client/helpers/clientHelper");
const util = require("./client/commands/utils");
const dev = require("./client/commands/dev");
const verification = require("./client/commands/verification");
const moderation = require("./client/commands/mod");
const clientEvent = require("./client/events/events");
const buttonInteractions = require("./client/interactions/button");
const slashInteractions = require("./client/interactions/slash");
const cmenuInteractions = require('./client/interactions/cmenu');

client.once('ready', async() => {
    clientInfo.init(client);
    await clientEvent.ready(client)
});


// Handling commands
client.on('messageCreate', async(message) => {

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    await message.channel.sendTyping()

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


// Handling interactions
client.on("interactionCreate", async(interaction) => {
    
    let interactionFunc = async() => {}
    // Context menu -> The options you get when you right click on a message and then go to "Apps"
    if(interaction.isMessageContextMenu()) {
        interactionFunc = cmenuInteractions.interactions.findKey(inter => inter === interaction.commandName)
    }
    // Slash commands
    else if(interaction.isCommand()) {
        interactionFunc = slashInteractions.interactions.findKey(inter => inter === interaction.commandName)
    }
    // Buttons on messages
    else if(interaction.isButton()) {
        interactionFunc = buttonInteractions.interactions.findKey(inter => inter === interaction.customId)
    }
    // Just in case, shouldn't ever happen though
    else {
        interactionFunc = async() => {await interaction.reply("Something's wrong. Try later")}
    }
    await interactionFunc(interaction);
})

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
    if(err == "Error [TOKEN_INVALID]: An invalid token was provided."){
        console.log("Invalid token or network issue detected\nIf this is printed in github workflow, build is successful\n" + err);
        // this isnt a true test. just a starting of bot to check the syntax errors etc if any
        process.exit(1);

        // in the recent commits the build is observed to be going into loops even with the above error
        // the wrong taken error is shifted to here from ./client/helpers/clientHelper.js
    }
    clientInfo.error(err);
});

client.login(TOKEN);