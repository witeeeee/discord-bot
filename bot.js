const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const moment = require("moment");
const weather = require("weather-js");
const https = require("https");
const { link } = require("snekfetch");
const urban = require("urban");
const { readlink } = require("fs");
const { timeStamp } = require("console");


client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);

    //client.user.setPresence({ activity: { name: `Prefix: ? | Serving ${client.guilds.cache.size} servers` }, status: 'dnd' })
});

client.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setPresence({ activity: { name: `Dear Uncle Tacitus...` }, status: 'dnd' })
});


client.on("guildDelete", guild => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setPresence({ activity: { name: `Dear Uncle Tacitus...` }, status: 'dnd' })
});


client.on("guildMemberAdd", member => {
    if(member.id == "424554503904165888" && member.guild.id != "807635969423573003") 
    {
        member.kick("Anti Saru missiles activated");
    }
});

client.on("shardReady", () => {
    console.log(`Bot is connected`)
    client.user.setPresence({ activity: { name: `Dear Uncle Tacitus...` }, status: 'dnd' })
})

client.on("message", async message => {
    if (message.author.bot) return;

    if (message.author.id == "545160834918121497" && message.content.includes(">>daily"))
    {
        message.channel.send("stop. ")
    }

    if (message.content.toLowerCase() == 'f')
    {
        await(message.react("🇫"))
    }

    if(message.content.includes("<@!433271419304935466>"))
    {
        message.channel.send("https://tenor.com/view/disingenuous-darkviper-darkviperau-you-dense-gif-19969413")
    }

    

    if (message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    //COMMANDS PRETTY MUCH EVERY BOT HAS 

    if (command === "ping") {
        (await message.channel.send("Ping!")).edit(`Pong!\`\`${Math.round(client.ws.ping)}ms\`\``)
        return;
    }

    if (command === "uptime") {
        let seconds = Math.floor(client.uptime / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);

        message.channel.send(`${hours} hours ${minutes % 60} minutes ${seconds % 60} seconds`)
        return;
    }

    if (command === "purge") {
        const deleteCount = parseInt(args[0], 10);

        if (!deleteCount || deleteCount < 2 || deleteCount > 100)
            return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");

        const fetched = await message.channel.messages.fetch({ limit: deleteCount });
        message.channel.bulkDelete(fetched)
            .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
    }

    if (command === "mute" && message.guild.id == "807635969423573003") {
        if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            message.channel.send("You do not have the necessary permissions");
            return;
        }

        let target = message.mentions.members.first();
        if (!target) {
            message.channel.send("Couldn't find a user to mute");
            return;
        }

        if (target.hasPermission("MANAGE_MESSAGES")) {
            message.channel.send("This user cannot be muted");
            return;
        }

        if (target.roles.cache.has("807640606842028043")) {
            message.channel.send("The user is already muted");
            return;
        }

        await (target.roles.add("807640606842028043"));
        message.channel.send(`**${target.user.username}#${target.user.discriminator}** has been muted`);
        return;
    }

    if (command === "unmute") {
        if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            message.channel.send("You do not have the necessary permissions");
            return;
        }

        let target = message.mentions.members.first();
        if (!target) {
            message.channel.send("Please mention a valid user");
            return;
        }

        if (!target.roles.cache.has("807640606842028043")) {
            message.channel.send("The user is not muted")
            return;
        }

        await (target.roles.remove("807640606842028043"));
        message.channel.send(`**${target.user.username}#${target.user.discriminator}** has been unmuted`);
        return;
    }

    if(command === "weather")
    {
        weather.find({search: args.join(" "), degreeType: 'C'}, function(error, result){
            if(error)
                return message.channel.send(error);
            if(!args[0])
                return message.channel.send("Specifiy a location");
            if(result === undefined || result.length === 0)
                return message.channel.send("Not a valid place");

            var current = result[0].current;
            var location = result[0].location;

            const embed = new Discord.MessageEmbed()
                .setDescription(`**${current.skytext}**`)
                .setTitle(`Weather forecast for ${current.observationpoint}`)
                .setThumbnail(current.imageUrl)
                .setColor(`RANDOM`)
                .setFooter(`UTC${location.timezone}`)
                .addField('Temperature', `${current.temperature}C`, true)
                .addField('Feels like', `${current.feelslike}C`, true)
                .addField('Wind', `${current.winddisplay}`)
                .addField('Humidity', `${current.humidity}%`, true)

            message.channel.send(embed);
        })
    }

    if (command === "help") {
        const embed = new Discord.MessageEmbed()
            .setTitle("Available Commands")
            .setColor(`RANDOM`)

            .addField("__Common commands__", 
            `**?ping:** Finds the response time of the bot
            **?serverinfo:** Displays info about the server
            **?listemoji:** Displays all the custom emoji of the guild
            **?roles:** Displays roles of a server
            **?info:** Info about the user, @user can be added to find info about a specific user
            **?avatar:** Sends the avatar of the user, @user can be added to get the avatar of a specific user
            **?weather:** Returns the current weather of a specified place
            **?invite:** Creates an invite link to the server
            **?ud:** Urban dictionary command
            **?echo:** Basically just repeats what you type in the command
            **?help:** You probably figured this one by now
            **?uptime:** Sends the time the bots been online for
            **?calc:** Basic calculator commands`
            )

            .addField("__Mod commands__", 
            `**?purge:** Deletes a specified number of messages from chat
            **?addemoji:** Adds a new emoji to the server given the link and name in the format ?addemoji link emojiname
            **?nick:** Command to change the nickname of other people in the server
            **?kick:** Kicks a specified user with optional reason
            **?ban:** Bans a specified user with optional reason`
            )

            .addField("__Fun commands__", 
            `**?coinflip:** Flips a coin
            **?roll:** Rolls a die
            **?random:** Basically just a random number generator
            **?8ball: **8ball responds to a question
            **?choose:** Chooses a random option from those specified, seperated by spaces
            **?meme:** Fetches a meme from r/memes
            **?joke:** Fetches a joke from r/jokes
            **?showerthought:** You get the gist by now
            **?pun:** Yes
            **?copypasta:** Searches for a given substring in a self defined list of copypastas. For example, try ?copypasta yee yee`
            )
            .setThumbnail(client.user.avatarURL)
            .setTimestamp();

        message.channel.send(embed)
    }

    if (command === "botinvite") {
        const embed = new Discord.MessageEmbed()
            .setColor(`RANDOM`)
            .setTitle("Invite link for Witeeeee's Bot")
            .setDescription("Click [here](https://discord.com/api/oauth2/authorize?client_id=433271419304935466&permissions=1543892087&scope=bot) to invite me to your server")
            .setTimestamp();
        message.channel.send(embed)
    }

    if (command === "info") {

        let mentioned = message.mentions.members.first();
        if (mentioned) {
            const embed = new Discord.MessageEmbed()
                .setDescription(`${mentioned.user}`)
                .setColor(`RANDOM`)
                .setThumbnail(`${mentioned.user.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 })}`)
                .addField('Created at:', `${moment.utc(mentioned.user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`)
                .addField('Joined at:', `${moment.utc(mentioned.joinedAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, true)
                .addField('Status:', mentioned.presence.status)
                .setAuthor(mentioned.user.username + '#' + mentioned.user.discriminator, mentioned.user.displayAvatarURL())
                .addField('Roles:', mentioned.roles.cache.map(r => `${r}`).slice(0, -1).join(' | '), true)
                .setFooter(`ID: ${mentioned.id}`)
                .setTimestamp();
            message.channel.send(embed);
        }
        else {
            const embed = new Discord.MessageEmbed()
                .setAuthor(message.member.user.username + '#' + message.member.user.discriminator, message.member.user.displayAvatarURL())
                .setDescription(`${message.member}`)
                .setColor(`RANDOM`)
                .setThumbnail(`${message.member.user.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 })}`)
                .addField('Created at:', `${moment.utc(message.member.user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`)
                .addField('Joined at:', `${moment.utc(message.member.joinedAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, true)
                .addField('Status:', message.member.presence.status)
                .addField('Roles:', message.member.roles.cache.map(r => `${r}`).slice(0,-1).join(' | '), true)
                .setFooter(`ID: ${message.member.id}`)
                .setTimestamp();
            message.channel.send(embed);
        }
        return;
    }

    if (command === "roles") {
        let a = message.guild.roles.cache.map(r => `${r}`).slice(1).join("\n")
        const embed = new Discord.MessageEmbed()
            .setTitle("Roles")
            .setThumbnail(message.guild.iconURL())
            .setColor(`RANDOM`)
            .setDescription(a)
            .setTimestamp()
        message.channel.send(embed)
        return;
    }

    if (command === "echo") {
        let msg = args.join(" ");
        message.channel.send(msg);
        return;
    }

    if (command === "choose") {
        let choice = Math.floor(Math.random() * args.length);
        message.channel.send(`I choose ${args[choice]}`);
        return;
    }

    if (command === "urban" || command === "ud" || command === "udict") {
        let target = args.join();
        try{
            let search = urban(target)
            search.first(res => {
                if(!res) {
                    message.channel.send("No results found")
                    return;
                }
                let {word, definition, example, thumbs_up, thumbs_down, permalink, author} = res

                let embed = new Discord.MessageEmbed()
                    .setColor(`RANDOM`)
                    .setTitle(`Urban Dictionary | ${word}`)
                    .setURL(`${permalink}`)
                    .setDescription(`\:thumbsup: ${thumbs_up} | \:thumbsdown: ${thumbs_down}`)
                    .addField("**Definition**", `${definition || "No definition"}`)
                    .addField("**Example**", `${example || "No Example"}\n\n`)
                    .setTimestamp()
                    .setFooter(`Written by ${author || "unknown"}`)

                message.channel.send(embed);          
            })
        }catch(e) {
            console.log(e)
            message.channel.send("Error!!");
        }
    }


colorss = {"red": "807639800583553065", "blue": "807639828044578877", "green": "807639874055307295", "black": "807641017007341639", "yellow": "807639851062525972", "purple": "807639900341665890", "pink": "828319519315066900", "orange": "830503848057503764"}
    if (command === "color") {
        if(args[0] == "remove") {
            for(i in colorss) {
                message.member.roles.remove(colorss[i])
            }
            message.channel.send(`**${message.member.user.username}**'s color successfully removed`)
        }
        else if(!(args[0].toLowerCase() in colorss)) {
            message.channel.send(`Not an available color. Available colors: red, blue, green, black, yellow, purple, pink, orange`)
            return;
        }
        else{
            for(i in colorss){
                message.member.roles.remove(colorss[i])
            }
            await(message.member.roles.add(colorss[args[0].toLowerCase()]))
            message.channel.send(`**${message.member.user.username}**'s colour changed to ${args[0].toLowerCase()}`);
        }
    }

    if (command === "serverinfo" || command === "si") {
        const embed = new Discord.MessageEmbed()
            .setAuthor(message.guild.name)
            .setColor("RANDOM")
            .setThumbnail(message.guild.iconURL({ dynamic: true, format: 'png', size: 1024 }))
            .addField("Region: ", message.guild.region)
            .addField("Owner: ", message.guild.owner, true)
            .addField('Member count: ', message.guild.members.cache.filter(m => m.user.bot == false).size, true) 
            .addField('Bot count', message.guild.members.cache.filter(m => m.user.bot == true).size, true)
            .addField('Created at: ', `${moment.utc(message.guild.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`)
            .addField('Text channels', message.guild.channels.cache.filter(c => c.type == "text").size, true)
            .addField('Voice channels', message.guild.channels.cache.filter(c => c.type == "voice").size, true)  
            .addField('Categories', message.guild.channels.cache.filter(c=> c.type == 'category').size, true)          
            .addField("Verification level: ", message.guild.verificationLevel)
            .addField(`Roles [${message.guild.roles.cache.size}]`, message.guild.roles.cache.map(r => `${r}`).slice(1,25).join(' | '))
            .setFooter(`ID: ${message.member.id}`)
            .setTimestamp();
        message.channel.send(embed);
        return;
    }

    if (command === "listemoji") {
        message.channel.send(message.guild.emojis.cache.map(r => `${r}`).join(" "))
        return;
    }

    if (command === "addemoji") {
        if (args[1]) {
            message.guild.emojis.create(args[0], args[1])
                .catch(error => message.reply(`Couldn't add emoji because of ${error}`));
            
        }
        else
            message.channel.send("The correct format is ?addemoji emojiURL emojiname")
        return;
    }

    if (command === "avatar") {
        let mentioned = message.mentions.members.first();
        if (mentioned)
            message.channel.send(mentioned.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }))
        else
            message.channel.send(message.member.user.avatarURL({ dynamic: true, format: 'png', size: 1024 }))
        return;
    }

    if (command === "invite") {
        message.channel.createInvite({unique: true})
        .then(invite => {
        message.channel.send("https://discord.gg/" + invite.code)
        })
        return;
    }

    if(command === "spotify") {
        let mentioned = message.mentions.members.first() || message.member
        if(mentioned.user.presence.activities.length != 0){
            let ind = mentioned.user.presence.activities.length;
            let flag = 0;
            for(let index = 0; index<ind; index++) {
                if(mentioned.user.presence.activities !== null && mentioned.user.presence.activities[index].type === 'LISTENING' && mentioned.user.presence.activities[index].name === 'Spotify' && mentioned.user.presence.activities[index].assets !== null) {
                    flag = 1;
                    let trackIMG = `https://i.scdn.co/image/${mentioned.user.presence.activities[index].assets.largeImage.slice(8)}`;
                    let trackURL = `https://open.spotify.com/track/${mentioned.user.presence.activities[index].syncID}`;
                    let trackName = mentioned.user.presence.activities[index].details;
                    let trackAuthor = mentioned.user.presence.activities[index].state;
                    let trackAlbum = mentioned.user.presence.activities[index].assets.largeText;

                    const embed = new Discord.MessageEmbed()
                        .setAuthor('Spotify Track Info', mentioned.user.avatarURL())
                        .setColor(`RANDOM`)
                        .addField('Song Name', trackName, true)
                        .addField('Album', trackAlbum, true)
                        .addField('Artist', trackAuthor, true)
                        .addField('Listen to Track', `${trackURL}`, false)
                        .setImage(trackIMG)
                        .setFooter(mentioned.user.username, mentioned.user.displayAvatarURL())
                        .setTimestamp()

                    message.channel.send(embed);
                    break;
                }
            } 
            if(flag == 0){
                message.channel.send(`**${mentioned.user.username}#${mentioned.user.discriminator} (${mentioned.nickname || mentioned.user.username})** is not listening toe Spotify`)
            }
        }
        else{
            message.channel.send(`**${mentioned.user.username}#${mentioned.user.discriminator} (${mentioned.nickname || mentioned.user.username})** is not listening to Spotify`)
        }
    }

    if (command === "nick") {
        let mentioned = message.mentions.members.first();
        if (message.member.permissions.has("MANAGE_NICKNAMES"))
            if (args[1]) {
                let nickname = args.slice(1).join(" ");
                mentioned.setNickname(nickname)
            }
            else
                mentioned.setNickname(mentioned.user.username)
        else
            message.channel.send("You do not have the necessary permissions to do that")
        return;
    }

    if(command === "kick") {
        let mentioned = message.mentions.members.first();
        let reason = args.slice(1).join(" ");
        if(!mentioned)
        {
            message.channel.send(`Kicking ${message.member.user.username} in 3... 2... 1...`);
            return;
        }
        if(message.member.hasPermission('KICK_MEMBERS'))
        {
            try{
                await(mentioned.kick(`${reason || "No Reason"}`)).then(message.channel.send(`Successfully kicked ${mentioned.user.username} for reason: ${reason || "No Reason"}`))
            }catch(e){
                message.channel.send(`Couldn't kick because of ${e}`);
            }   
        }
        else
        {
            message.channel.send("You do not have the necessary permissions to do that")
        }
        return; 
    }

    if(command === "ban") {
        let mentioned = message.mentions.members.first();
        let reason = args.slice(1).join(" ");
        if(!mentioned)
        {
            message.channel.send(`smh atleast mention someone to ban`);
            return;
        }
        if(message.member.hasPermission('BAN_MEMBERS'))
        {
            try{
                await(mentioned.ban(`${reason || "No Reason"}`)).then(message.channel.send(`Successfully kicked ${mentioned.user.username} for reason: ${reason || "No Reason"}`))
            }catch(e){
                message.channel.send(`Couldn't kick because of ${e}`);
            }   
        }
        else
        {
            message.channel.send("You do not have the necessary permissions to do that")
        }
        return; 
    }

    //FUN COMMANDS

let copypasta = [
    "Shut the fuck up you absolute lobotomite. What a joke. Get a grip on reality, stop saying \"I just blocked you! On Discord! You know what that fucking means, kid? It means fuck nothing because you can still see me, and I can still click and see your messages! Imagine that. How fucking stupid is that? It's almost as if I'm not mature enough to just be the bigger person and ignore the person that\'s bothered me. But no, I have to announce it to the entire server \"Hey idiot, I blocked you hahaha!\" What a stand up move, truly a sight to behold. Especially in the controversial world that is 2021, to actually block somebody and let them know that I did it! Amazing right? I wish I could be as edgy and cool as you to block a person on Discord that I don\'t like! But I am just a small nobody plebian that has no reason for being in your sight as you are truly on a higher social status than myself. Oh great guy I am truly blessed and honored to be in your presence, considering all the great things you have done for this server, and Discord as a whole unified platform!\" during a serious conversation just because your two braincells cant ever send signals to eachother to form a response. Honestly pathetic. Oh guys look at me Im so funny! Its so funny and quirky right guys? Hahah. Shut the fuck up you absolute fucking dusty toilet. I would flush you down the drain in an instant.",
    "Where are you going, you're lost; Dollar tree headset; So free, freer then a public restroom; You're literally dog water; 0 PR; Earnings check, oh wait you have none.",
    "I'd just like to interject for a moment. What you're referring to as Linux, is in fact, GNU/Linux, or as I've recently taken to calling it, GNU plus Linux. Linux is not an operating system unto itself, but rather another free component of a fully functioning GNU system made useful by the GNU corelibs, shell utilities and vital system components comprising a full OS as defined by POSIX. Many computer users run a modified version of the GNU system every day, without realizing it. Through a peculiar turn of events, the version of GNU which is widely used today is often called \"Linux\", and many of its users are not aware that it is basically the GNU system, developed by the GNU Project. There really is a Linux, and these people are using it, but it is just a part of the system they use. Linux is the kernel: the program in the system that allocates the machine's resources to the other programs that you run. The kernel is an essential part of an operating system, but useless by itself; it can only function in the context of a complete operating system. Linux is normally used in combination with the GNU operating system: the whole system is basically GNU with Linux added, or GNU/Linux. All the so-called \"Linux\" distributions are really distributions of GNU/Linux.",
    "What the fuck did you just fucking say about me, you little bitch? I’ll have you know I graduated top of my class in the Navy Seals, and I’ve been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills.\n\n I am trained in gorilla warfare and I’m the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words.\n\n You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You\’re fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that\’s just with my bare hands.\n\n Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little \“clever\” comment was about to bring down upon you, maybe you would have held your fucking tongue.\n\n But you couldn\’t, you didn\’t, and now you\’re paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it.",
    "Ah nigga don't hate me cause I'm beautiful nigga. Maybe if you got rid of that old yee yee ass haircut, you'd get some bitches on yo dick. Oh, better yet, maybe Tanisha'll call your dog ass if she stops fuckin' with that brain surgeon or lawyer she fucking with. *Niiggaaa*\nhttps://tenor.com/view/franklin-lamar-lamar-roasts-franklin-gif-19948223",
    "You disingenuous dense motherfucker. Obviously you have to know something about something or you couldn't tie your shoes (◣_◢)."
];

    if (command === "copypasta") {
        if(!args[0])
        {
            message.channel.send("Please include a search query, like ?copypasta searchstring")
            return;
        }
        let searchstring = args.join(" ")
        let check = 0;
        for(i in copypasta)
        {
            if(copypasta[i].toLowerCase().includes(searchstring.toLowerCase()))
            {
                message.channel.send(copypasta[i]);
                check = 1;
                break;
            }
        }
        if(check == 0)
        {
            message.channel.send("Not found. Try reducing the search query to specific words in the copypasta, as this command is sensitive to punctuation inconsistencies")
        }
        return;
    }

    if (command === "coinflip") {
        let rng = Math.random();
        if(rng == 0.5)
        {
            message.channel.send("Yow you're not going to believe this but your coin somehow managed to land on its side")
            return;
        }
        let outcome = Math.round(rng);
        if (outcome)
            message.channel.send("Heads")
        else
            message.channel.send("Tails")
        return;
    }

    if (command === "roll") {
        if(args[0])
        {
            let sides = parseInt(args[0]);
            let outcome = Math.floor(Math.random() * sides)
            message.channel.send(`:game_die: Your ${sides} sided die rolled a ${outcome}`)
        }
        else
        {
            let outcome = Math.floor(Math.random() * 6) + 1;
            message.channel.send(`:game_die: You rolled a ${outcome}`);
        }
        return;
    }

let responses8ball = [
    'As I see it, yes.',
    'Ask again later.',
    'Better not tell you now.',
    'Cannot predict now.',
    'Concentrate and ask again.',
    'Don’t count on it.',
    'It is certain.',
    'It is decidedly so.',
    'Most likely.',
    'My reply is no.',
    'My sources say no.',
    'Outlook not so good.',
    'Outlook good.',
    'Reply hazy, try again.',
    'Signs point to yes.',
    'Very doubtful.',
    'Without a doubt.',
    'Yes.',
    'Yes – definitely.',
    'You may rely on it.'
]

let nullresponses8ball = [
    "Oi you gotta ask it something smh",
    "You disingenuous dense motherfucker, you gotta ask me something",
    "Please specify a question",
    "Why are you like this",
    "Ask me something, anything!",
    "Bruv, 8ball can't read your mind, ask me something"
]

    if(command === "8ball")
    {
        if(!args[0])
        {
            let nullresponse = Math.floor(Math.random() * nullresponses8ball.length)
            message.channel.send(nullresponses8ball[nullresponse]);
            return;
        }
        let answer = Math.floor(Math.random() * responses8ball.length)
        message.channel.send(responses8ball[answer]);
        return;
    }

    if(command === "test") 
    {
        let filter = m => m.author.id == message.author.id
        message.channel.send("helo").then(() => {
        message.channel.awaitMessages(filter, {
            max:1,
            time: 5000,
            errors: ['time']
        })
        .then(message => {
            message = message.first()
            if(message.content.toLowerCase() == "no")
            {
                message.channel.send("Yes");
            }
            else
            {
                message.channel.send("No");
            }
        })
        .catch(collected => {
            message.channel.send("You took too long to respond")
        });
    })
        return;
    }

    if(command === "hl")
    {
        let hint = Math.floor(Math.random() * 99) + 1;
        let hidden = Math.floor(Math.random() * 99) + 1;
        let victory = `Winner! The number was ${hidden}`
        let defeat = `The number was ${hidden}. Better luck next time`
        let specialdefeat = `Oof, unlucky. The hint and the hidden number were the same`
        message.channel.send(`A hidden number has been assigned to you. Guess if it is higher or lower than the hint (${hint})`).then(() => {
            let filter = m => m.author.id = message.author.id
            message.channel.awaitMessages(filter, {
                max:1,
                time:10000,
                errors:['time']
            })
            .then(message => {
                message=message.first()
                switch(message.content.toLowerCase()){
                    case "higher":
                        if(hidden > hint){
                            message.channel.send(victory)
                        }
                        else if(hidden < hint){
                            message.channel.send(defeat)
                        }
                        else if(hidden === hint){
                            message.channel.send(specialdefeat)
                        }
                        break;
                    case "lower":
                        if(hidden < hint){
                            message.channel.send(victory)
                        }
                        else if(hidden > hint){
                            message.channel.send(defeat)
                        }
                        else if(hidden === hint){
                            message.channel.send(specialdefeat)
                        }
                        break;
                    case "jackpot":
                        if(hidden != hint){
                            message.channel.send(`Nice try, but the odds were not in your favour this time. The number was ${hidden}`)
                        }
                        else if(hidden == hint){
                            message.channel.send("Holy shit you got it you absolute madlad")
                        }
                    default:
                        message.channel.send(`Invalid choice loser, game ending. Oh and btw, the number was ${hidden}`);
                }
            })
            .catch(collected => {
                message.channel.send("You took too long")
            })
        })
    }   

    if(command === "collect"){
        const filter = m => m.content.includes('discord') && m.author.id == message.author.id;
        const collector = message.channel.createMessageCollector(filter, { max:5, time: 15000 });

        collector.on('collect', m => {
            message.channel.send("discord")
            console.log(`Collected ${m.content}`);
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }


    if(command === "ng"){
        let hidden = Math.floor(Math.random() * 249) + 1;
        let filter = m => m.author.id == message.author.id
        let check = 1;
        const collector = message.channel.createMessageCollector(filter, {
            max:7,
            time:70000
        })
        message.channel.send("Number Guesser!\nGuess the hidden number between 1 and 250")
        let i = 1
        collector.on('collect', m => {
            let guess = parseInt(m.content)
            if(isNaN(guess)){
                message.channel.send("Do you not know what a number is?")
                check = 0
                collector.stop()
            }
            if(guess > hidden)
            {
                if(guess <= hidden + 1)
                {
                    message.channel.send("You have no idea how close you are to the number")
                }
                else if(guess <= hidden + 5)
                {
                    message.channel.send("Just a tiny bit lower")
                }
                else{
                    message.channel.send("Lower")
                }
                i = i+1;
            }
            else if(guess < hidden)
            {
                if(guess >= hidden - 1)
                {
                    message.channel.send("You have no idea how close you are to the number")
                }
                else if(guess >= hidden - 5)
                {
                    message.channel.send("Just a tiny bit higher")
                }
                else{
                    message.channel.send("Higher")
                }
                i = i+1;
            }
            else if(guess == hidden)
            {
                message.channel.send(`Spot on! You won in ${i} turns`)
                check = 0
                collector.stop()
            }
        }).then(() => {
            if(check == 1){
                message.channel.send(`The number was ${hidden}. Unlucky, better luck next time.`)
            }
        })

    }


    if (command === "random") {
        let number1 = parseInt(args[0]);
        let number2 = parseInt(args[1]);
        if (args[1]) {
            let outcome = Math.floor(Math.random() * (number2 - number1)) + number1;
            if (isNaN(outcome))
                message.channel.send("Upper/lower limits are not a number, please enter a valid integer")
            else
                message.channel.send(outcome);
        }
        else
            message.channel.send("The correct format is ?random <lower limit> <upper limit> (without the angular brackets)");
        return;
    }

    if(command === "joke") {
        https.get('https://www.reddit.com/r/jokes/hot/.json?limit=100', (result) => {
            var body = ''
            result.on('data', (chunk) => {
                body += chunk
            })

            result.on('end', () => {
                var response = JSON.parse(body)
                var index = response.data.children[Math.floor(Math.random() * 99) + 1].data
                var text = index.selftext;
                var title = index.title;
                var link = 'https://reddit.com' + index.permalink;
                var subRedditName = index.subreddit_name_prefixed;

                if (index.post_hint !== 'image') {
                    const textembed = new Discord.MessageEmbed()
                        .setColor(`RANDOM`)
                        .setDescription(`**${title}**\n\n||${text}||`)
                        .setTimestamp()
                        .setFooter(subRedditName)

                    message.channel.send(textembed);
                }
            }).on('error', function (e) {
                console.log('Got an error: ', e)
            })
        })
        return;
    }

    if(command === "pun") {
        https.get('https://www.reddit.com/r/puns/hot/.json?limit=100', (result) => {
            var body = ''
            result.on('data', (chunk) => {
                body += chunk
            })

            result.on('end', () => {
                var response = JSON.parse(body)
                var index = response.data.children[Math.floor(Math.random() * 99) + 1].data

                var text = index.selftext;
                var title = index.title;
                var link = 'https://reddit.com' + index.permalink;
                var subRedditName = index.subreddit_name_prefixed;
                var image = index.preview.images[0].source.url.replace('&amp;', '&');

                if (index.post_hint !== 'image') {
                    const textembed = new Discord.MessageEmbed()
                        .setTitle(title)
                        .setColor(`RANDOM`)
                        .setDescription(text)
                        .setURL(link)
                        .setTimestamp()
                        .setFooter(subRedditName)

                    message.channel.send(textembed);
                }
                else {
                const imageembed = new Discord.MessageEmbed()
                    .setTitle(`${title}`)
                    .setImage(image)
                    .setColor(`RANDOM`)
                    .setURL(link)
                    .setTimestamp()
                    .setFooter(subRedditName)
                    
                message.channel.send(imageembed);
                }
            }).on('error', function (e) {
                console.log('Got an error: ', e)
            })
        })
        return;
    } 

    if(command === "showerthought" || command === "st") {
        https.get('https://www.reddit.com/r/Showerthoughts/hot/.json?limit=100', (result) => {
            var body = ''
            result.on('data', (chunk) => {
                body += chunk
            })

            result.on('end', () => {
                var response = JSON.parse(body)
                var index = response.data.children[Math.floor(Math.random() * 99) + 1].data
                var text = index.selftext;
                var title = index.title;
                var link = 'https://reddit.com' + index.permalink;
                var subRedditName = index.subreddit_name_prefixed;

                if (index.post_hint !== 'image') {
                    const textembed = new Discord.MessageEmbed()
                        .setColor(`RANDOM`)
                        .setDescription(`**${title}**\n\n${text}`)
                        .setTimestamp()
                        .setFooter(subRedditName)

                    message.channel.send(textembed)
                }
            }).on('error', function (e) {
                console.log('Got an error: ', e)
            })
        })
        return;
    }


    
    if(command === "meme") {
        https.get('https://www.reddit.com/r/memes/hot/.json?limit=100', (result) => {
            var body = ''
            result.on('data', (chunk) => {
                body += chunk
            })

            result.on('end', () => {
                var response = JSON.parse(body)
                var index = response.data.children[Math.floor(Math.random() * 99) + 1].data

                var text = index.selftext;
                var image = index.preview.images[0].source.url.replace('&amp;', '&');
                var title = index.title;
                var link = 'https://reddit.com' + index.permalink;
                var subRedditName = index.subreddit_name_prefixed;

                if (index.post_hint !== 'image') {
                    const textembed = new Discord.MessageEmbed()
                        .setTitle(`**${title}**`)
                        .setColor(`RANDOM`)
                        .setDescription(`${text}`)
                        .setURL(link)
                        .setTimestamp()
                        .setFooter(subRedditName);

                    message.channel.send(textembed)
                }
                else {
                const imageembed = new Discord.MessageEmbed()
                    .setTitle(`**${title}**`)
                    .setImage(image)
                    .setColor(`RANDOM`)
                    .setURL(link)
                    .setTimestamp()
                    .setFooter(subRedditName)
                message.channel.send(imageembed);
                }
            }).on('error', function (e) {
                console.log('Got an error: ', e)
            })
        })
        return;
    } 
    

    //CALCULATOR COMMANDS
function factorial(n)
{
    n = parseInt(n);
    let answer = 1;
    if (n == 0 || n == 1){
      return answer;
    }
    else{
      for(var i = n; i >= 1; i--){
        answer = answer * i;
      }
      return answer;
    }  
}
    if (command === "calc")
    {
        let number1 = parseFloat(args[0])
        let sign = args[1]
        let number2 = parseFloat(args[2])
        switch(sign)
        {
            case "+":
                message.channel.send(number1 + number2)
                break;
            case "-":
                message.channel.send(number1 - number2)
                break;
            case "*":
                message.channel.send(number1 * number2)
                break;
            case "/":
                message.channel.send(number1 / number2);
                break;
            case "^":
                message.channel.send(number1 ** number2);   
                break;
            case "p":
                if(number2 > number1)
                {
                    message.channel.send("Incorrect format for permutations")
                    break;
                }
                message.channel.send(factorial(number1) / factorial(number1 - number2))
                break;
            case "c":
                if(number2>number1)
                {
                    message.channel.send("Incorrect format for combinations")
                    break;
                }
                message.channel.send(factorial(number1) / (factorial(number1 - number2) * factorial(number2)))
                break;
            case "!":
                message.channel.send(factorial(parseInt(number1)))
                break;
                
            default:
                const embed = new Discord.MessageEmbed()
                    .setTitle("Calc commands")
                    .setColor(`RANDOM`)
                    .addField("Addition", "?calc num1 + num2")
                    .addField("Subtraction", "?calc num1 - num2")
                    .addField("Multiplication", "?calc num1 * num2")
                    .addField("Division", "?calc num1 / num2")
                    .addField("Power", "?calc num1 ^ num2")
                    .addField("Permutation", "?calc num1 p num2")
                    .addField("Combination", "?calc num1 c num2")
                    .addField("Factorial", "?calc num1 !")
                    .setTimestamp()
                message.channel.send(embed);
        }
    }

    //BOT CONTROL

    if (command === "shutdown") {
        if (message.author.id != "176947217913872384") {
            message.channel.send("Permission denied")
            return;
        }
        await(message.channel.send("Goodbye cruel world"))
        process.exit();
    }

});


client.login(config.token);