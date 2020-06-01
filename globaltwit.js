const Discord = require('discord.js')
const Twitter = require('twit')
const Enmap = require('enmap')
const wait = require('util').promisify(setTimeout);

function globaltwit(twitter_client, tokens, client, config, debug, functiondate, functiontime){
    try{
    var g_acc = 0
    var g_acc_in_twitter = 0
    var old_twt = {}
    setInterval(async function(){
        try{
        g_acc = 0
        client.guilds.forEach(async g=>{
            var db = new Enmap({name:'db_'+g.id})
            if (db.get('shard_id') != client.shard.id + 1 || !db.has('shard_id')) db.set('shard_id', client.shard.id + 1)
            if (!db.has('guild_name') || db.get('guild_name') != g.name) db.set('guild_name', g.name)
            var twitter_accounts = db.has('twitter_name') ? db.get('twitter_name') : undefined
            if (twitter_accounts === undefined) return
            g_acc_in_twitter = 0
            twitter_accounts.forEach(async account=>{
                if (!account.name) return
                var twitter_params = { screen_name: account.name}

                await twitter_client.get('statuses/user_timeline', twitter_params, async (err, tweets) => {
                    var debug_header = `[${functiondate()} - ${functiontime()} - Shard ${client.shard.id + 1} - Guild ${g.id} (${g.name}) - ${g_acc_in_twitter} : ${account.name} - Channel ${account.channel} ] `
                    if (err) {
                        client.shard.send(debug_header + `Twitter GET request error: ` + err.message + ' - ' + err.code);
                        client.shard.send(err)
                        if (err.code == 34){
                            var n = 0
                            twitter_accounts.forEach(acc=>{
                                if (acc.name == account.name){
                                    twitter_accounts.splice(n,1)
                                    db.set('twitter_name', twitter_accounts)
                                    client.shard.send(`Account @${account.name} for channel ${account.channel} deleted.`)
                                    g.channels.find(c=>c.id == account.channel).send(`Account @${account.name} is not found on Twitter, the account was deleted from the database to prevent errors`)
                                }
                                n++
                            })  
                        }
                        else if (err.code == 80 || err.code == 88){
                            if (tokens.safe == false) {
                                tokens = {
                                    consumer_key:        config.safe_consumer_key,
                                    consumer_secret:     config.safe_consumer_secret,
                                    access_token:        config.safe_access_token_key,
                                    access_token_key:    config.safe_access_token_key,
                                    access_token_secret: config.safe_access_token_secret,
                                    safe: true
                                }
                                client.user.setStatus('idle')
                                client.shard.send(`TWITTER RATE LIMITED, safe mode activated`)
                            }
                            else {
                                tokens = {
                                    consumer_key:        config.consumer_key,
                                    consumer_secret:     config.consumer_secret,
                                    access_token:        config.access_token_key,
                                    access_token_key:    config.access_token_key,
                                    access_token_secret: config.access_token_secret,
                                    safe: false
                                }
                                client.user.setStatus('online')
                                client.shard.send(`TWITTER RATE LIMITED, safe mode desactivated`)
                            }
                            twitter_client = new Twitter(tokens);
                            
                        } else process.exit(err.code)
                        return
                    }
                    
                    if (old_twt[tweets[0].user.screen_name] && old_twt[tweets[0].user.screen_name].id == tweets[0].id) {
                        if (debug === true) client.shard.send(debug_header + `no new tweets`)
                    }
                    if (old_twt[tweets[0].user.screen_name] && old_twt[tweets[0].user.screen_name].id != tweets[0].id) {
                        try{

                            let embed = new Discord.RichEmbed
    
                            tweets[0].text.replace('&amp;', '&')
    
                        if (tweets[0].retweeted === true || tweets[0].text.startsWith('RT')) {
                            if (account.retweet === true){
                                if (debug === true) client.shard.send(debug_header + `Retweet from @${tweets[0].retweeted_status.user.screen_name}`)
                                embed   .setColor(account.embed_color ? account.embed_color : 'RANDOM')
                                        .setAuthor(`Retweet\n${tweets[0].retweeted_status.user.name} (@${tweets[0].retweeted_status.user.screen_name})`, tweets[0].retweeted_status.user.profile_image_url_https.replace("normal.jpg", "200x200.jpg"), `https://twitter.com/${tweets[0].user.screen_name}/status/${tweets[0].id_str}`)
                                        .setDescription(tweets[0].retweeted_status.text)
                                        .setTimestamp(tweets[0].retweeted_status.created_at)
                                        .setThumbnail('https://img.icons8.com/color/96/000000/retweet.png')
                                if (tweets[0].retweeted_status.entities.media) embed.setImage(tweets[0].retweeted_status.entities.media[0].media_url_https)
                                if (g.channels.some(c=>c.id == account.channel)) {
                                    var webhooks = await g.channels.find(c=>c.id == account.channel).fetchWebhooks()
                                    .catch(g.channels.find(c=>c.id == account.channel).createWebhook(client.user.username)
                                        .then(async wh=>{
                                            client.shard.send(`Created webhook ${wh.name} for account @${tweets[0].user.screen_name} on channel ${wh.channelID}`)
                                            webhook.send('', {
                                                username: tweets[0].user.name,
                                                avatarURL: tweets[0].user.profile_image_url_https.replace("normal.jpg", "200x200.jpg"),
                                                embeds: [embed]
                                            })
                                        })
                                    )
                                    webhooks = await g.channels.find(c=>c.id == account.channel).fetchWebhooks()
                                    var webhook = webhooks.first()
                                    webhook.send('', {
                                        username: tweets[0].user.name,
                                        avatarURL: tweets[0].user.profile_image_url_https.replace("normal.jpg", "200x200.jpg"),
                                        embeds: [embed]
                                    })
                                } else return
                            } else {
                                if (debug === true) client.shard.send(debug_header + `Retweet from @${tweets[0].retweeted_status.user.screen_name}, but retweet config is disabled`)
                            }
                        } else if (tweets[0].retweeted === false || !tweets[0].text.startsWith('RT')) {
                            if (tweets[0].in_reply_to_status_id == null || tweets[0].in_reply_to_user_id == null) {
                                if (debug === true) client.shard.send(debug_header + `Simple tweet, id ${tweets[0].id_str}`)
                                embed   .setColor(account.embed_color ? account.embed_color : 'RANDOM')
                                        .setAuthor(`${tweets[0].user.name} (@${tweets[0].user.screen_name})`, tweets[0].user.profile_image_url_https.replace("normal.jpg", "200x200.jpg"), `https://twitter.com/${tweets[0].user.screen_name}/status/${tweets[0].id_str}`)
                                        .setDescription(tweets[0].text)
                                        .setTimestamp(tweets[0].created_at)
                                if (tweets[0].entities.media) embed.setImage(tweets[0].entities.media[0].media_url_https)
                                if (g.channels.some(c=>c.id == account.channel)) {
                                    var webhooks = await g.channels.find(c=>c.id == account.channel).fetchWebhooks()
                                    .catch(g.channels.find(c=>c.id == account.channel).createWebhook(client.user.username)
                                        .then(async wh=>{
                                            client.shard.send(`Created webhook ${wh.name} for account @${tweets[0].user.screen_name} on channel ${wh.channelID}`)
                                            webhook.send('', {
                                                username: tweets[0].user.name,
                                                avatarURL: tweets[0].user.profile_image_url_https.replace("normal.jpg", "200x200.jpg"),
                                                embeds: [embed]
                                            })
                                        })
                                    )
                                    webhooks = await g.channels.find(c=>c.id == account.channel).fetchWebhooks()
                                    var webhook = webhooks.first()
                                    webhook.send('', {
                                        username: tweets[0].user.name,
                                        avatarURL: tweets[0].user.profile_image_url_https.replace("normal.jpg", "200x200.jpg"),
                                        embeds: [embed]
                                    })
                                } else return
                            } else if (tweets[0].in_reply_to_status_id != null || tweets[0].in_reply_to_user_id != null){
                                if (account.reply === false){
                                    if (debug === true) client.shard.send(debug_header + `Reply to a tweet, but reply option is off`)
                                } else {
                                    if (debug === true) client.shard.send(debug_header + `Reply to a tweet, id ${tweets[0].in_reply_to_status_id}`)
                                    embed   .setColor(account.embed_color ? account.embed_color : 'RANDOM')
                                            .setAuthor(`${tweets[0].user.name} (@${tweets[0].user.screen_name})\nReply to @${tweets[0].in_reply_to_screen_name}`, tweets[0].user.profile_image_url_https.replace("normal.jpg", "200x200.jpg"), `https://twitter.com/${tweets[0].user.screen_name}/status/${tweets[0].id_str}`)
                                            .setDescription(tweets[0].text.replace(`@${tweets[0].in_reply_to_screen_name}`, ""))
                                            .setTimestamp(tweets[0].created_at)
                                            .setThumbnail('https://cdn1.iconfinder.com/data/icons/messaging-3/48/Reply-512.png')
                                    if (tweets[0].entities.media) embed.setImage(tweets[0].entities.media[0].media_url_https)
                                    if (g.channels.some(c=>c.id == account.channel)) {
                                    var webhooks = await g.channels.find(c=>c.id == account.channel).fetchWebhooks()
                                    .catch(g.channels.find(c=>c.id == account.channel).createWebhook(client.user.username)
                                        .then(async wh=>{
                                            client.shard.send(`Created webhook ${wh.name} for account @${tweets[0].user.screen_name} on channel ${wh.channelID}`)
                                            webhook.send('', {
                                                username: tweets[0].user.name,
                                                avatarURL: tweets[0].user.profile_image_url_https.replace("normal.jpg", "200x200.jpg"),
                                                embeds: [embed]
                                            })
                                        })
                                    )
                                    webhooks = await g.channels.find(c=>c.id == account.channel).fetchWebhooks()
                                    var webhook = webhooks.first()
                                    webhook.send('', {
                                        username: tweets[0].user.name,
                                        avatarURL: tweets[0].user.profile_image_url_https.replace("normal.jpg", "200x200.jpg"),
                                        embeds: [embed]
                                    })
                                    } else return
                                }
                            }
                        }
                        old_twt[tweets[0].user.screen_name] = {
                            id: tweets[0].id
                        }
                        }catch(e){
                            if (debug === true) client.shard.send(`ERROR: ${debug_header}` + e)
                            if (debug === true) client.shard.send(tweets[0])
                            if (g.channels.some(c=>c.id == account.channel)) g.channels.find(c=>c.id == account.channel).send(`https://twitter.com/${tweets[0].user.screen_name}/status/${tweets[0].id_str}`)
                            .catch(err=>client.shard.send(`Error sending on guild ${g.id} - ${g.name}\n${err}`))
                            old_twt[tweets[0].user.screen_name] = {
                                id: tweets[0].id
                            }
                        }
                    }
                    if (!old_twt[tweets[0].user.screen_name]) {
                        if (debug === true) client.shard.send(debug_header + `old_tweets not defined, setting var`)
                        old_twt[tweets[0].user.screen_name] = {
                            id: tweets[0].id
                        }
                    }
                    g_acc_in_twitter++
                })
                g_acc++
            })
            client.shard.send('\n')
            await wait(Number(twitter_accounts.length) * 1000)
        });
    } catch (e) {
        client.shard.send(`[${functiondate()} - ${functiontime()} - Shard ${client.shard.id + 1} - Guild ${g.id} (${g.name}) ] globaltwit interval function error:` + e);
    }
    }, 60 * 1000) // 60 sec
    
    } catch (e) {
        client.shard.send(`[${functiondate()} - ${functiontime()} - Shard ${client.shard.id + 1} - Guild ${g.id} (${g.name}) ] globaltwit function error:` + e);
    }
}
module.exports = globaltwit
