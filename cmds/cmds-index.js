const Discord = require('discord.js')
const Enmap = require('enmap')

function cmds_index(message, client, config, functiondate, functiontime, publicBot, dbl){
    const prefix = `<@!${client.user.id}>` 
    const prefix2 = `<@${client.user.id}>`
    let embed = new Discord.RichEmbed
    var db = new Enmap({name:'db_'+message.guild.id})
    embed.setAuthor(client.user.username, client.user.displayAvatarURL)
    embed.setFooter(`${client.user.tag}, created by Greep#3022`)
    if (!db.has('premium')) db.set('premium', false)

    if (message.author.id == config.owner_id){
        const ownercmds = require('./owner/owner-index.js')
        ownercmds(message, client, config, functiondate, functiontime, publicBot, db, prefix, prefix2, embed)
    }

    const oobe = require('./_oobe.js')
    oobe(message, client, config, functiondate, functiontime, publicBot, db, prefix, prefix2, embed, dbl)

    const settings = require('./sets.js')
    settings(message, client, config, functiondate, functiontime, publicBot, db, prefix, prefix2, embed)

    const gdpr = require('./gdpr.js')
    gdpr(message, client, config, functiondate, functiontime, publicBot, db, prefix, prefix2, embed)

    const helpcmd = require('./help.js')
    helpcmd(message, client, config, functiondate, functiontime, publicBot, db, prefix, prefix2, embed, dbl)
}

module.exports = cmds_index