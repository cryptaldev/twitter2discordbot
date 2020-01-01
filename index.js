try{
const Discord = require('discord.js');
const client = new Discord.Client({
  fetchAllMembers: true
});
const fs = require('fs');
const configfile = "./config.json";
var config
config = JSON.parse(fs.readFileSync(configfile, "utf8"));

const debug = config.verbose

const Twitter = require('twitter')
const tokens = {
    consumer_key:        config.consumer_key,
    consumer_secret:     config.consumer_secret,
    access_token:        config.access_token_key,
    access_token_key:    config.access_token_key,
    access_token_secret: config.access_token_secret
};

const twitter_client = new Twitter(tokens);

function functiondate() { 
    const datefu = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const year = datefu.getFullYear();
    const month = months[datefu.getMonth()];
    const getdate = datefu.getDate();
    const date = getdate + ' ' + month + ' ' + year;
    return date;
};

function functiontime() {
    const datefu = new Date();
    const hour = datefu.getHours();
    const min = datefu.getMinutes();
    const sec = datefu.getSeconds();
    const time = hour + ':' + min + ':' + sec;
    return time
}

client.on('ready', () => { 
    try{
    const readylog = `Logged in as ${client.user.tag}!\nOn ${functiondate(0)} at ${functiontime(0)}`
    console.log(readylog);

    if (client.user.id == '661967218174853121'){
        client.user.setActivity('your tweets | Mention me to setup!', { type: 'WATCHING' })
        const globaltwit = require('./twitter-function.js')
        globaltwit(twitter_client, client, config, debug, functiondate, functiontime)
    } else {
        var twitter_params = { screen_name: config.twitter_name };
        var old_avatar = undefined
        var old_tweets = undefined
        var old_count = undefined
        var old_name = undefined
        const twit = require('./twitter-function.js')
        twit(twitter_client, twitter_params, client, config, debug, functiondate, functiontime, old_avatar, old_count, old_name, old_tweets)
    }

   }catch(err){
      console.error(`[${functiondate()} - ${functiontime()}] ${err}`)
   }
})

client.on('message', message =>{
    if (client.user.id === '661967218174853121'){
        const setup = require('./public-setup.js')
        setup(message, client, config, functiondate, functiontime)
    }
})

client.on('guildCreate', guild => {
    const botjoinguildlog = `${client.user.username} joined __${guild.name}__\n*ID: ${guild.id}*`
    console.log(`[${functiondate(0)} - ${functiontime(0)}]\n${botjoinguildlog}`)
})

client.on('guildDelete', guild => {
    const botleftguildlog = `${client.user.username} left __${guild.name}__\n*ID: ${guild.id}*`
    console.log(`[${functiondate(0)} - ${functiontime(0)}]\n${botleftguildlog}`)
})

client.on('disconnect', event => {
    var eventcodemsg = 'Event Code Message not set for this code'
    if (event === '1000') eventcodemsg = 'Normal closure'
    if (event === '1001') eventcodemsg = 'Can\'t connect to WebSocket'
    const eventmsg = `Bot down : code ${event}: "${eventcodemsg}"`
    console.log(`[${functiondate(0)} - ${functiontime(0)}] ` + eventmsg)
    getlogchannel().send(eventmsg)
})

client.on('reconnecting', () => {
    const eventmsg = `reconnecting to WebSocket`
    console.log(`[${functiondate(0)} - ${functiontime(0)}] ` + eventmsg)
})

client.login(config.discord_token)
}catch(e){
    console.error(e)
}