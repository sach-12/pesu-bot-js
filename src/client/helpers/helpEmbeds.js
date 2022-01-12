// Embed variables for the Help command

const { MessageEmbed } = require("discord.js");

class HelpClass {

    utils1 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        timestamp: Date.now()
    })
        .addField("Uptime", "`!uptime`/`!ut`\n\nGet the bot uptime", false)
        .addField("Ping", "`!ping`/`!tp`\n\nGet the bot latency with the API", false)
        .addField("Support", "`!support`/`!contribute`\n\nContribute and help in developing the bot\n(You could also star the repo)", false)
        .addField("Count", "`!count`/`!c` [List of roles]\n\nResponds with the number of people having all the given roles", false)
        .setFooter({text: "Page 1/2"})

    utils2 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        timestamp: Date.now()
    })
        .addField("Snipe", "`!snipe`\n\nRetrieves the last deleted message of the channel", false)
        .addField("Edit Snipe", "`!editsnipe`\n\nRetrieves the last edited message of the channel, even if deleted", false)
        .addField("Poll", "`!poll`\n\nCreates a poll. Type `!poll` to know more", false)
        .setFooter({text: "Page 2/2"})

    details = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        timestamp: Date.now()
    })
        .addField("Info", "`!info`/`!i` [Member ID/Name/Mention]\n\nFetches the stored data of the target member", false)
        .addField("Deverify", "`!deverify`/`!d` [Member ID/Name/Mention]\n\nRemoves the member's stored data and their roles", false)
        .addField("File", "`!file`/`!f`\n\nGet the stored verified data and sends it to #bot-test\n(Note: This command doesn't work for mods)", false)

    moderation1 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        timestamp: Date.now()
    })
        .addField("Kick", "`!kick` [Member mention] {Reason: optional}\n\nKicks a member from the server", false)
        .addField("Mute", "`!mute` [Member mention] [Time] {Reason: optional}\n\nMutes a member on the guild for the specified time", false)
        .addField("Unmute", "`!unmute` [Member mention]\n\nUnmutes a muted member")
        .setFooter({text: "Page 1/2"})

    moderation2 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        timestamp: Date.now()
    })
        .addField("Lock", "`!lock` {Channel mention: Optional(takes the current channel if not mentioned)} {Reason: optional}\m\mLocks the target channel", false)
        .addField("Unlock", "`!unlock` {Channel mention: Optional(takes the current channel if not mentioned)}", false)
        .setFooter({text: "Page 2/2"})

    dev1 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        timestamp: Date.now()
    })
        .addField("Echo", "`!echo`/`!e` [Channel mention] [Content]\n\nSends a message to the target channel with the given content", false)
        .addField("Purge", "`!purge`/`!p` [Amount]\n\nDeletes the last 'Amount' number of messages in the channel", false)
        .addField("Bash", "`!bash`\n\nCommand injection\n(Works only for Han and Stark)", false)
        .setFooter({text: "Page 1/2"})

    dev2 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        timestamp: Date.now()
    })
        .addField("Git pull", "`!gitpull`/`!pull`\n\nPulls the latest version of code from the remote repository\n(Works only for Han and Stark)", false)
        .setFooter({text: "Page 2/2"})
}

const helpEmbed = new HelpClass()

module.exports = helpEmbed
