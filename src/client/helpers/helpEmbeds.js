// Embed variables for the Help command

const { MessageEmbed } = require("discord.js");

class HelpClass {

    general1 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        description: "General",
        timestamp: Date.now()
    })
        .addField("Uptime", "`!uptime`/`!ut`\nGet the bot uptime", false)
        .addField("Ping", "`!ping`/`!tp`\nGet the bot latency with the API", false)
        .addField("Support", "`!support`/`!contribute`\nContribute and help in developing the bot\n(You could also star the repo)", false)
        .setFooter({text: "Page 1/4"})

    general2 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        description: "General",
        timestamp: Date.now()
    })
        .addField("Snipe", "`!snipe`\nRetrieves the last deleted message of the channel", false)
        .addField("Edit Snipe", "`!editsnipe`\nRetrieves the last edited message of the channel, even if deleted", false)
        .addField("Poll", "`!poll`\nCreates a poll. Type `!poll` to know more", false)
        .setFooter({text: "Page 2/4"})

    general3 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        description: "General",
        timestamp: Date.now()
    })
        .addField("Count", "`!count`/`!c` [List of roles]\nResponds with the number of people having all the given roles", false)
        .addField("Elective", "`!elective`\nGets the elective choosing menu", false)
        .addField("Additional Roles", "`!roles`/`!ar`\nGets the manu for choosing additional roles")
        .setFooter({text: "Page 3/4"})

    general4 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        description: "General",
        timestamp: Date.now()
    })
        .addField("Spotify", "`!spotify` {Member Mention: Optional(Takes self if not specified)}\nGets spotify activity details of the member", false)
        .setFooter({text: "Page 4/4"})

    data1 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        description: "Data",
        timestamp: Date.now()
    })
        .addField("Info", "`!info`/`!i` [Member ID/Name/Mention]\nFetches the stored data of the target member", false)
        .addField("Deverify", "`!deverify`/`!d` [Member ID/Name/Mention]\nRemoves the member's stored data and their roles", false)
        .addField("File", "`!file`/`!f`\nGet the stored verified data and sends it to #bot-test\n(Note: This command doesn't work for mods)", false)
        .setFooter({text: "Page 1/1"})

    moderation1 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        description: "Moderation",
        timestamp: Date.now()
    })
        .addField("Kick", "`!kick` [Member mention] {Reason: optional}\nKicks a member from the server", false)
        .addField("Mute", "`!mute` [Member mention] [Time] {Reason: optional}\nMutes a member on the guild for the specified time", false)
        .addField("Unmute", "`!unmute` [Member mention]\nUnmutes a muted member")
        .setFooter({text: "Page 1/3"})

    moderation2 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        description: "Moderation",
        timestamp: Date.now()
    })
        .addField("Lock", "`!lock` {Channel mention: Optional(takes the current channel if not mentioned)} {Reason: optional}\nLocks the target channel", false)
        .addField("Unlock", "`!unlock` {Channel mention: Optional(takes the current channel if not mentioned)}", false)
        .addField("Timeout", "`!timeout`/`!to` [Member mention] [Time] {Reason: optional}\nTimes the user out for the specified time", false)
        .setFooter({text: "Page 2/3"})

    moderation3 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        description: "Moderation",
        timestamp: Date.now()
    })
        .addField("De-Timeout", "`!detimeout`/`!dto` [Member mention]\nRemoves the member timeout", false)
        .setFooter({text: "Page 3/3"})

    dev1 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        description: "Dev",
        timestamp: Date.now()
    })
        .addField("Echo", "`!echo`/`!e` [Channel mention] [Content]\nSends a message to the target channel with the given content", false)
        .addField("Purge", "`!purge`/`!p` [Amount]\nDeletes the last 'Amount' number of messages in the channel", false)
        .addField("Bash", "`!bash`\nCommand injection\n(Works only for Han and Stark)", false)
        .setFooter({text: "Page 1/2"})

    dev2 = new MessageEmbed({
        title: "PESU Bot",
        color: "DARK_PURPLE",
        description: "Dev",
        timestamp: Date.now()
    })
        .addField("Git pull", "`!gitpull`/`!pull`\nPulls the latest version of code from the remote repository\n(Works only for Han and Stark)", false)
        .setFooter({text: "Page 2/2"})

    // Function to check if the current embed has a next page
    hasNextPage = (embed) => {
        const page = embed.footer.text.replace('Page ', '')
        const currPage = parseInt(page.split('/')[0])
        const totalPages = parseInt(page.split('/')[1])
        if(currPage < totalPages) {
            return true
        }
        else {
            return false
        }
    }

    // Function to check if the current embed has a previous page
    hasPreviousPage = (embed) => {
        const page = embed.footer.text.replace('Page ', '')
        const currPage = parseInt(page.split('/')[0])
        if(currPage != 1) {
            return true
        }
        else {
            return false
        }
    }

    // Function which returns the button row of help command
    // This function also disables the button if necessary
    helpRowOne = (embed) => {
        const { MessageActionRow, MessageButton } = require('discord.js');
        const row1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('helpPrevious')
                    .setEmoji("⬅️")
                    .setStyle("PRIMARY")
                    .setDisabled(!this.hasPreviousPage(embed))
            )
            .addComponents(
                new MessageButton()
                    .setCustomId('helpNext')
                    .setEmoji("➡️")
                    .setStyle("PRIMARY")
                    .setDisabled(!this.hasNextPage(embed))
            )
        return row1
    }
    
    // Function which returns the select menu row of the help command
    helpRowTwo = () => {
        const { MessageActionRow, MessageSelectMenu } = require('discord.js');
        const row2 = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('helpSelect')
                    .setPlaceholder('Category')
                    .addOptions([
                        {
                            label: "General",
                            value: "General",
                            description: "General commands",
                            emoji: "🖖",
                        },
                        {
                            label: "Data",
                            value: "Data",
                            description: "Commands related to verification",
                            emoji: "📃",
                        },
                        {
                            label: "Moderation",
                            value: "Moderation",
                            description: "Moderation commands",
                            emoji: "👮"
                        },
                        {
                            label: "Dev",
                            value: "Dev",
                            description: "Developmental commands",
                            emoji: "💻"
                        }
                    ])
            )
        return row2
    }

    // The following two functions are the ones which will be used externally. All other functions are not explicitly called
    // Function to retrieve the embed based on the string parameter passed
    targetEmbed = (param) => {
        if(param === 'general1') {
            return this.general1
        }
        else if(param === 'general2') {
            return this.general2
        }
        else if(param === 'general3') {
            return this.general3
        }
        else if(param === 'general4') {
            return this.general4
        }
        else if(param === 'data1') {
            return this.data1
        }
        else if(param === 'moderation1') {
            return this.moderation1
        }
        else if(param === 'moderation2') {
            return this.moderation2
        }
        else if(param === 'moderation3') {
            return this.moderation3
        }
        else if(param === 'dev1') {
            return this.dev1
        }
        else if(param === 'dev2') {
            return this.dev2
        }
    }

    // Function to retrieve the message component rows for the help command
    targetComponents = (embed) => {
        const row1 = this.helpRowOne(embed)
        const row2 = this.helpRowTwo()
        return [row1, row2]
    }
}

const helpEmbed = new HelpClass()

module.exports = helpEmbed
