// Commands anyone can use
const { Permissions, Collection, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const config = require('../../config.json');
const clientInfo = require("../helpers/clientHelper");

class Utils {
    constructor() {
        this.commands = new Collection()
            .set(this.uptime, ["uptime", "ut"])
            .set(this.ping, ["ping", "tp"])
            .set(this.support, ["support", "contribute"])
            .set(this.count, ["count", "c"])
            .set(this.snipe, ["snipe"])
            .set(this.editsnipe, ["editsnipe"])
            .set(this.poll, ["poll"])
            .set(this.help, ["help", "h"])
            .set(this.elective, ["elective"])
            .set(this.addroles, ["roles", "ar"])
            .set(this.spotify, ["spotify"])

        this.deletedMessage = null;
        this.editedMessage = null;
    }

    uptime = async (message) => {
        clientInfo.message = message;
        await message.reply({
            content: "Bot was started <t:" + clientInfo.startTime + ":R>\ni.e., on <t:" + clientInfo.startTime + ":f>",
            failIfNotExists: false
        });
    }

    ping = async (message) => {
        clientInfo.message=message
        await message.reply({
            content: `Pong!!!\nPing =\`${clientInfo.client.ws.ping} ms\``,
            failIfNotExists: false
        });
    }

    support = async (message) => {
        clientInfo.message = message
        await message.reply({
            content: "You can contribute to the bot here\nhttps://github.com/sach-12/pesu-bot-js",
            failIfNotExists: false
        })
    }

    count = async (message) => {
        clientInfo.message = message

        // Get role names separated by "&"
        let roleList = []
        const args = message.content.substring(message.content.indexOf(" ")+1).trim().split("&");

        // Get role collection for each role name and add to array
        args.forEach(roleStr => {
            const role = message.guild.roles.cache.find((r) => r.name === roleStr.trim())
            if(role != null) {
                roleList.push(role)
            }
        });
        const mems = message.guild.members.cache
        if(roleList.length === 0){
            await message.channel.send("No roles found. Processing request for server stats...")
            await message.channel.sendTyping();

            // Stats:
            const total = message.guild.members.cache.size
            const verifiedRole = message.guild.roles.cache.get(config.verified)
            let verified = 0
            let hooman = 0
            let bots = 0

            // Each member is being checked if they have the verified role, if they can view the message
            // origin channel and if they are a bot or not
            mems.each(member => {
                if(member.roles.cache.has(verifiedRole.id)){
                    verified += 1
                }
                const perms = message.channel.permissionsFor(member)
                const view_channel = Permissions.FLAGS.VIEW_CHANNEL
                if(perms.has(view_channel)){
                    if(member.user.bot){
                        bots += 1
                    }
                    else {
                        hooman += 1
                    }
                }
            })
            const stats = `**Server Stats:**\n\
            Total number of people on the server: \`${total}\`\n\
            Total number of verified people: \`${verified}\`\n\
            Number of people that can see this channel: \`${hooman}\`\n\
            Number of bots that can see this channel: \`${bots}\``
            await message.reply({
                content: stats,
                failIfNotExists: false
            })
        }
        else{
            // Requested roles
            let requested = " ["
            roleList.forEach(role => requested+=`${role.name}, `)
            requested = requested.slice(0, -2) + "]"
            await message.channel.send(`Got request for${requested}`)
            await message.channel.sendTyping();

            // Check each member of the server if they have the given set of roles
            let num = 0
            mems.each(member => {
                const memberRoles = member.roles.cache
                let bool = true // This boolean turns false if a member does not have even one role in the given set
                roleList.forEach(role => {
                    if(!memberRoles.has(role.id)) {
                        bool = false
                    }
                })
                if(bool === true){
                    num += 1
                }
            })
            await message.reply({
                content: `${num} people has/have ${requested}`,
                failIfNotExists: false
            })
        }
    }

    snipe = async (message) => {
        clientInfo.message = message

        // If no message was stored in snipe
        if(this.deletedMessage === null){
            await message.channel.send("There is nothing to snipe")
        }
        else{
            // Snipes only if command origin channel is the same as the sniped message origin channel
            if(this.deletedMessage.channel.id === message.channel.id){
                // If the deleted message replied to any other message, get the message ID the user replied to
                const reference = await this.deletedMessage.reference
                let repliedTo = null
                if(reference != null){
                    repliedTo = reference.messageId
                }

                // Fetch attachments if any were deleted
                const fileUrls = []
                this.deletedMessage.attachments.forEach((attach) => {
                    fileUrls.push(attach.proxyURL)
                })

                // Send the deleted message with the reply of the original message if it exists
                await message.channel.send({
                    content: `<@${this.deletedMessage.author.id}>: ${this.deletedMessage.content}`,
                    reply: {
                        messageReference: repliedTo
                    },
                    files: fileUrls
                })
                this.deletedMessage = null
            }
            else {
                await message.channel.send("There is nothing to snipe")
            }
        }
    }

    editsnipe = async (message) => {
        clientInfo.message = message

        // If no message was stored in edit-snipe
        if(this.editedMessage === null) {
            await message.channel.send("No edited message")
        }
        else {
            // Edit-snipes only if the command origin channel is the same as the edited message origin channel
            if(this.editedMessage.channel.id === message.channel.id){
                // To check if the message still exists
                const originnalMessage = message.channel.messages.cache.get(this.editedMessage.id)

                // If the message exists, get the ID for replying to it
                let repliedTo = null

                // If the message does not exist, try replying to who he/she replied to instead
                if(originnalMessage === undefined) {
                    const reference = this.editedMessage.reference
                    if(reference != null) {
                        repliedTo = reference.messageId
                    }
                }

                // If the message exists, reply to it instead
                else {
                    repliedTo = this.editedMessage.id
                }

                let content = ""
                // If the command response has nothing to reply to or if the original message does not exist, 
                // add the message author tag to the response content
                if(repliedTo === null || originnalMessage === undefined){
                    content += `<@${this.editedMessage.author.id}>: `
                }
                content += this.editedMessage.content

                await message.channel.send({
                    content: content,
                    reply: {
                        messageReference: repliedTo
                    }
                })
                this.editedMessage = null
            }
            else {
                await message.channel.send("No edited message")
            }
        }
    }

    poll = async(message, args) => {
        clientInfo.message = message;

        // Poll help embed variable
        const pollHelpEmbed = new MessageEmbed({
            title: "Start a poll",
            color: "0x2A8A96",
            timestamp: Date.now()
        })
            .addField("!poll", "Usage:\n!poll Question [Option1][Option2]...[Option9]", false)
            .addField("\u200b", "To get the results of a poll, click the `Results` button on the poll (still under development)", false)
        
        if(args.length === 0) {
            await message.reply({
                embeds: [pollHelpEmbed],
                failIfNotExists: false
            })
        }
        else {
            // Get the poll arguments split on `[` which contains the question and options
            const pollArgs = message.content.substring(message.content.indexOf(args[0])).split("[")
            // Clean out the brackets and leading/trailing whitespaces, if any
            const pollList = []
            pollArgs.forEach(word => {
                const arg = word.replace("]", "").replace("[", "")
                if(arg != ""){
                    pollList.push(arg.trim())
                }
            })

            // Edge cases
            // When only the question is given
            if(pollList.length === 1) {
                await message.reply({
                    content: "Not enough parameters",
                    embeds: [pollHelpEmbed],
                    failIfNotExists: false
                })
            }
            // When only one option is provided
            else if(pollList.length === 2) {
                await message.reply({
                    content: "You need more than one choice",
                    embeds: [pollHelpEmbed],
                    failIfNotExists: false
                })
            }
            // When more than 9 options are provided
            else if(pollList.length > 10) {
                await message.reply({
                    content: "Choice limit is nine",
                    embeds: [pollHelpEmbed],
                    failIfNotExists: false
                })
            }
            else {
                // Question is the first element in the array. Following elements are each options
                const question = pollList.shift()
                const reactionList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
                // The poll question embed
                const pollEmbed = new MessageEmbed({
                    title: question,
                    color: "0x7289DA",
                    timestamp: Date.now()
                })
                // Add field to each option of the poll
                pollList.forEach(option => {
                    pollEmbed.addField("\u200b", `${reactionList[pollList.indexOf(option)]} ${option}`, false)
                })
                // Set the footer. This is important for the messageReactionAdd event in events.js
                pollEmbed.setFooter({text: `Poll by ${message.author.tag}`})

                // Poll statistics button
                const button = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('ps')
                            .setLabel("Stats (Button still under development)")
                            .setStyle("PRIMARY")
                    );
                
                const pollMessage = await message.channel.send({embeds: [pollEmbed], components: [button]})

                // Make the bot react for the length of options
                pollList.forEach(async (option) => {
                    await pollMessage.react(reactionList.shift())
                })
            }
        }
    }

    help = async(message) => {
        clientInfo.message = message;

        // If user is not verified, display only one embed with !verify
        if(message.member.roles.cache.some((role) => [config.just_joined].includes(role.id))) {
            const justJoined = new MessageEmbed({
                title: "PESU Bot",
                color: "DARK_PURPLE",
                timestamp: Date.now()
            })
                .addField("Verify", "`!verify`/`!v` [SRN/PRN]\n\nVerification Process. Type `!verify` to know more", false)
            await message.reply({
                embeds: [justJoined],
                failIfNotExists: false
            })
        }
        else {
            // Get the required embed(default embed is general page 1) and message components(Buttons and Select Menu)
            const {targetEmbed, targetComponents} = require('../helpers/helpEmbeds')
            const embed = targetEmbed('general1')
            const components = targetComponents(embed)

            await message.reply({
                embeds: [embed],
                components: components,
                failIfNotExists: false
            })
        }
    }

    elective = async(message) => {
        clientInfo.message = message;

        const row1 = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('e3')
                    .setPlaceholder("Elective 3")
                    .addOptions([ // The value corresponds to channel ID
                        {
                            label: "Generic Programming",
                            value: "930394968072282113"
                        },
                        {
                            label: "Algorithms for Intelligence Web and information Retrieval",
                            value: "930395037160837150"
                        },
                        {
                            label: "Image Processing and Computer Vision",
                            value: "930395104504586241"
                        },
                        {
                            label: "Natural Language and Processing",
                            value: "930395173660266546"
                        },
                        {
                            label: "Blockchain",
                            value: "930395209529970738"
                        },
                        {
                            label: "Digital Forensics",
                            value: "930395311225045002"
                        },
                        {
                            label: "Wireless Networking Fundamentals",
                            value: "930395370272456724"
                        },
                        {
                            label: "Memory Design and Testing",
                            value: "930395418276274217"
                        },
                        {
                            label: "Quantum Transport and Logic Gates",
                            value: "930395482679816202"
                        },
                        {
                            label: "Formal Verification of Digital Design",
                            value: "931132924500267048"
                        },
                        {
                            label: "Speech Processing",
                            value: "930395537507774504"
                        },
                        {
                            label: "Introduction to Gas Dynamics",
                            value: "930396249822220328"
                        },
                        {
                            label: "Mechanical Vibrations",
                            value: "930396332596809748"
                        },
                        {
                            label: "Autonomous Vehicles",
                            value: "930396372073594920"
                        },
                        {
                            label: "Product Design and Management",
                            value: "930396405351206943"
                        },
                        {
                            label: "Smart Grid Technologies",
                            value: "930433070014791690"
                        },
                        {
                            label: "Industrial Drives and Control",
                            value: "930433121864806430"
                        },
                        {
                            label: "Robotics Modelling and Control",
                            value: "930433208800133140"
                        },
                        {
                            label: "Soft Computing Techniques",
                            value: "930433300546342922"
                        },
                        {
                            label: "Genomics and Proteomics",
                            value: "930434926275354654"
                        },
                        {
                            label: "Systems Biology",
                            value: "930434959401959464"
                        },
                        {
                            label: "Molecular Modelling and Simulation",
                            value: "930435019992883260"
                        },
                        {
                            label: "Plant Layout Design and OHS",
                            value: "930435094617935902"
                        },
                        {
                            label: "Cancer Biology",
                            value: "930435136737124362"
                        },
                        {
                            label: "Bio-sensors",
                            value: "930435164033650698 "
                        }
                    ])
            )
        const row2 = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('e4')
                        .setPlaceholder("Elective 4")
                        .addOptions([
                            {
                                label: "Heterogenous Parallelism",
                                value: "930396910320226334"
                            },
                            {
                                label: "Topics in Deep Learning",
                                value: "930396958873493554"
                            },
                            {
                                label: "Database Technologies",
                                value: "930396999176560701"
                            },
                            {
                                label: "Network Analysis and Mining",
                                value: "930397035608285194"
                            },
                            {
                                label: "Information Security",
                                value: "930397068521013339"
                            },
                            {
                                label: "Cryptography",
                                value: "930397135260753970"
                            },
                            {
                                label: "Mobile Multimedia and Security",
                                value: "930397177690353704"
                            },
                            {
                                label: "Testing of VLSI Circuits",
                                value: "930397212133957662"
                            },
                            {
                                label: "Data Converters",
                                value: "930397260896956476 "
                            },
                            {
                                label: "Advanced DIP",
                                value: "930397302898708500"
                            },
                            {
                                label: "Computational Fluid Dynamics",
                                value: "930397358838132776"
                            },
                            {
                                label: "Automotive Powertrains",
                                value: "930397424701288448"
                            },
                            {
                                label: "Machine Learning and Artificial Intelligence",
                                value: "930397465549611098"
                            },
                            {
                                label: "Fluid Power Engineering",
                                value: "930397509698871316"
                            },
                            {
                                label: "FACTS Controllers",
                                value: "930433400857325628"
                            },
                            {
                                label: "Hybrid Electric Vehicle Systems",
                                value: "930433452937994380"
                            },
                            {
                                label: "Image Processing",
                                value: "930433482218422292"
                            },
                            {
                                label: "Architectures for Hardware Acceleration",
                                value: "931132790441902100"
                            },
                            {
                                label: "VLSI Design",
                                value: "930433508181176360"
                            },
                            {
                                label: "Tissue Engineering",
                                value: "930435228730810368"
                            },
                            {
                                label: "Food Biotechnology",
                                value: "930435273609867344"
                            },
                            {
                                label: "Computational Biology",
                                value: "930435315368361984"
                            },
                            {
                                label: "Clinical Research and Data Management",
                                value: "930435369953034270"
                            },
                            {
                                label: "Health Diagnostics",
                                value: "930435418804060211"
                            },
                            {
                                label: "Nano-biotechnology",
                                value: "930435456917712926"
                            }
                        ])
                )
        await message.channel.send({
            content: "Choose your electives from the drop down select menus here to get access to the respective channels.\nIf you select the same elective again, your view access will be removed",
            components: [row1, row2]
        })
    }

    addroles = async(message) => {
        clientInfo.message = message;

        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('ar')
                    .setPlaceholder("Additional Roles")
                    .setOptions([ // The value corresponds to role ID
                        {
                            label: "None",
                            value: "0",
                            description: "Use this to de-select your choice in this menu"
                        },
                        {
                            label: "Gamer",
                            value: "778825985361051660",
                            description: "Don't ever question Minecraft logic",
                            emoji: "🎮"
                        },
                        {
                            label: "Coder",
                            value: "778875127257104424",
                            description: "sudo apt install system32",
                            emoji: "⌨️"
                        },
                        {
                            label: "Musician",
                            value: "778875199701385216",
                            description: "From Pink Floyd to Prateek Kuhad",
                            emoji: "🎸"
                        },
                        {
                            label: "Editor",
                            value: "782642024071168011",
                            description: "A peek behind-the-scenes",
                            emoji: "🎥"
                        },
                        {
                            label: "Tech",
                            value: "790106229997174786",
                            description: "Pure Linus Sex Tips",
                            emoji: "💡"
                        },
                        {
                            label: "Moto",
                            value: "836652197214421012",
                            description: "Stutututu",
                            emoji: "⚙️"
                        },
                        {
                            label: "Investors",
                            value: "936886064361144360",
                            description: "Stocks and Crypto are your friends",
                            emoji: "💸"
                        },
                        {
                            label: "PESU Bot Dev",
                            value: "810507351063920671",
                            description: "Contribute to developing PESU Bot",
                            emoji: "🤖"
                        },
                        {
                            label: "NSFW",
                            value: "778820724424704011",
                            description: "Definitely not safe for anything",
                            emoji: "👀"
                        }
                    ])
            )
        const embed = new MessageEmbed({
            title: "Additional Roles",
            color: "BLURPLE",
            description: "Pick up additional roles to get access to more channels",
            timestamp: Date.now()
        })
        await message.channel.send({
            embeds: [embed],
            components: [row]
        })
    }

    spotify = async(message) => {
        clientInfo.message=message;

        // Find target member
        // Remove mention caused by reply if it exists
        if((message.type === "REPLY") && (message.mentions.members.first().id != message.mentions.repliedUser.id)){
            message.mentions.members.delete(message.mentions.repliedUser.id);
        }
        let target = message.mentions.members.first();
        if(!target) target = message.member

        // Find Spotify activity
        const presence = target.presence
        if(presence === null) {
            await message.reply({
                content: "No spotify activity detected",
                failIfNotExists: false
            })
            return
        }
        const spoti = presence.activities.find((activity) => activity.name === "Spotify")
        if(spoti === undefined) {
            await message.reply({
                content: "No spotify activity detected",
                failIfNotExists: false
            })
        }
        else {
            // Get spotify track details
            const content = `Listening to: \`${spoti.details}\` by \`${spoti.state}\`\nSong link: https://open.spotify.com/track/${spoti.syncId}`
            await message.reply({
                content: content,
                failIfNotExists: false
            })
        }
    }
}
const utils = new Utils()

module.exports = utils