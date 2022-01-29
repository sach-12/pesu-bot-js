// Handles select menu interactions

const { Collection } = require("discord.js");
const config = require('../../config.json')

class SelectMenu {
    constructor() {
        this.interactions = new Collection()
            .set(this.helpSelect, ["helpSelect"])
            .set(this.elective, ["e3", "e4"])
            .set(this.roles, ["ar"])
    }

    helpSelect = async(interaction) => {
        // Get the requested page the member has chosen
        const request = interaction.values[0]
        const {targetEmbed, targetComponents} = require('../helpers/helpEmbeds')

        // Get the next embed to be displayed after checking roles
        let dispEmbed = null
        if(request === 'General') {
            dispEmbed = targetEmbed('general1')
        }
        else if((request === 'Data') && (interaction.member.roles.cache.some((role) => [config.admin, config.mod, config.botDev].includes(role.id)))){
            dispEmbed = targetEmbed('data1')
        }
        else if((request === 'Moderation') && (interaction.member.roles.cache.some((role) => [config.admin, config.mod].includes(role.id)))) {
            dispEmbed = targetEmbed('moderation1')
        }
        else if((request === 'Dev') && (interaction.member.roles.cache.some((role) => [config.admin, config.mod, config.botDev].includes(role.id)))) {
            dispEmbed = targetEmbed('dev1')
        }
        else {
            await interaction.reply({content: "You can't select this option. Don't got the roles", ephemeral: true})
            return
        }

        // Get message components based on the to-be-displayed embed and update the message
        const components = targetComponents(dispEmbed)
        await interaction.update({
            embeds: [dispEmbed],
            components, components
        })
    }

    elective = async(interaction) => {
        await interaction.deferReply({ephemeral: true})

        // Get member who invoked the interaction and check if he/she belongs to 2018/19 batch
        const member = interaction.member
        if(member.roles.cache.some((role) => role.name.includes("Junior") || role.name.includes("Kid"))) {
            await interaction.editReply({content: "This feature is only for the 2019 batch"})
        }
        else if(member.roles.cache.has(config.just_joined)) {
            await interaction.editReply({content: "You need to verify yourself first"})
        }
        else if(member.roles.cache.some((role) => [config.admin, config.mod].includes(role.id))) {
            await interaction.editReply({content: "How does it matter to you anyway? You can see all of them"})
        }
        else {
            // Get the member requested channel
            const request = interaction.values[0]
            const targetChannel = interaction.guild.channels.cache.get(request)

            // Revoke access if member was already present
            if(targetChannel.permissionOverwrites.cache.has(member.id)) {
                await interaction.editReply({content: "You already had access to this elective channel. I am now revoking it"})
                await targetChannel.permissionOverwrites.delete(member)
            }
            // Add channel override to target channel
            else {
                await targetChannel.permissionOverwrites.create(member, {VIEW_CHANNEL: true})
                await interaction.editReply({content: `You now have access to <#${targetChannel.id}>`})
            }
        }
    }

    roles = async(interaction) => {

        // Get member who invoked the interaction and check if he/she is verified
        const member = interaction.member
        if(member.roles.cache.has(config.just_joined)) {
            await interaction.deferReply({ephemeral: true})
            await interaction.editReply({content: "You need to verify yourself first"})
        }
        else {
            // Get role ID from interaction
            const roleId = interaction.values[0]

            // If user chooses none
            if(roleId === "0") {
                await interaction.reply({content: "\u200b"})
                await interaction.deleteReply()
            }

            else {
                await interaction.deferReply({ephemeral: true})
                // Remove role if already present. Add role if not present
                if(member.roles.cache.has(roleId)) {
                    await interaction.editReply({content: "Role was already present. Removing now..."})
                    await member.roles.remove(roleId)
                }
                else {
                    const roleName = interaction.guild.roles.cache.get(roleId)
                    await member.roles.add(roleId)
                    await interaction.editReply({content: `You now have the ${roleName} role`})
                }
            }
        }
    }
}

const smenu = new SelectMenu()

module.exports = smenu