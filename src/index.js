const {Client, IntentsBitField, EmbedBuilder, ChannelType, ActivityType} = require('discord.js');
const config = require("./config.json");
const weather = require("weather-js");
const moment = require("moment");
const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');

const spotifyApi = new SpotifyWebApi();

spotifyApi.setCredentials({
    clientId: config.spotifyClientID,
    clientSecret: config.spotifySecret
});


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildIntegrations
    ]
});

client.on('ready', (c) => {
    console.log('Bot Ready');

    client.user.setActivity({
        name: "the cries of the O'Driscolls",
        type: ActivityType.Listening
    })

    client.user.setPresence({
        status: 'dnd'
    })
})

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() == 'f')
    {
        message.react("🇫")
    }

    if (message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

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

    if(command === "weather")
    {
        weather.find({search: args.join(" "), degreeType: 'C'}, function(error, result){
            if(error)
                return message.channel.send(error);
            if(!args[0])
                return message.channel.send("Specify a location");
            if(result === undefined || result.length === 0)
                return message.channel.send("Not a valid place");

            var current = result[0].current;
            var location = result[0].location;

            const embed = new EmbedBuilder()
                .setDescription(`**${current.skytext}**`)
                .setTitle(`Weather forecast for ${current.observationpoint}`)
                .setThumbnail(current.imageUrl)
                .setColor(`Random`)
                .setFooter({text: `UTC${location.timezone}`})
                .addFields(
                    {name: 'Temperature', value: `${current.temperature}C`, inline: true},
                    {name: 'Feels Like', value: `${current.feelslike}C`, inline: true},
                    {name: 'Wind', value: `${current.winddisplay}`},
                    {name: 'Humidity', value: `${current.humidity}%`, inline: true},
                )
            message.channel.send({embeds: [embed]});
        })
    }

    if(command === 'botinvite') {
        const embed = new EmbedBuilder()
            .setColor(`Random`)
            .setTitle("Invite link for Witeeeee's Bot")
            .setDescription("Click [here](https://discord.com/api/oauth2/authorize?client_id=433271419304935466&permissions=1543892087&scope=bot) to invite me to your server")
            .setTimestamp();
        message.channel.send({embeds: [embed]})
    }

    if (command === "info") {
        let mentioned = message.mentions.members.first() || message.member
        const embed = new EmbedBuilder()
            .setAuthor({name: mentioned.user.username + '#' + mentioned.user.discriminator, iconURL: mentioned.user.displayAvatarURL()})
            .setDescription(`${mentioned}`)
            .setColor(`Random`)
            .setThumbnail(`${mentioned.user.displayAvatarURL({ dynamic: true, format: 'png', size: 1024 })}`)
            .addFields(
                {name: "Created at:", value:  `${moment.utc(mentioned.user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`},
                {name: "Joined at:", value: `${moment.utc(mentioned.joinedAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`, inline: true},
                {name: "Status:", value: `${mentioned.presence?.status}`},
                {name: "Roles:", value: mentioned.roles.cache.map(r => `${r}`).slice(0,-1).join(' | '), inline: true},
            )
            .setFooter({text: `ID: ${mentioned.id}`})
            .setTimestamp();
        message.channel.send({embeds: [embed]});
        return;
    }

    if (command === "serverinfo" || command === "si") {
        const embed = new EmbedBuilder()
            .setAuthor({name: message.guild.name})
            .setColor("Random")
            .setThumbnail(message.guild.iconURL({ dynamic: true, format: 'png', size: 1024 }))            
            .addFields(
                {name: "Owner", value: `${(await message.guild.fetchOwner()).user.tag}`, inline: true},
                {name: "Member count", value: `${message.guild.members.cache.filter(m => m.user.bot == false).size}`, inline: true},
                {name: "Bot count", value: `${message.guild.members.cache.filter(m => m.user.bot == true).size}`, inline: true},
                {name: "Created at", value: `${moment.utc(message.guild.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`},
                {name: "Text channels", value: `${message.guild.channels.cache.filter(c => c.type == ChannelType.GuildText).size}`, inline: true},
                {name: "Voice channels", value: `${message.guild.channels.cache.filter(c => c.type == ChannelType.GuildVoice).size}`, inline: true},
                {name: "Categories", value: `${message.guild.channels.cache.filter(c=> c.type == ChannelType.GuildCategory).size}`, inline: true},
                {name: "Verification level", value: `${message.guild.verificationLevel}`},
                {name: `Roles [${message.guild.roles.cache.size}]`, value: `${message.guild.roles.cache.map(r => `${r}`).slice(1,25).join(' | ')}`},
            )
            .setFooter({text: `ID: ${message.guild.id}`})
            .setTimestamp();
        message.channel.send({embeds: [embed]});
        return;
    }

    if (command === "roles") {
        let a = message.guild.roles.cache.map(r => `${r}`).slice(1).join("\n")
        const embed = new EmbedBuilder()
            .setTitle("Roles")
            .setThumbnail(message.guild.iconURL())
            .setColor(`Random`)
            .setDescription(a)
            .setTimestamp()
        message.channel.send({embeds: [embed]})
        return;
    }

    if (command === "echo") {
        let msg = args.join(" ");
        message.channel.send(msg);
        return;
    }

    if (command === "pick") {
        let choice = Math.floor(Math.random() * args.length);
        message.channel.send(`${args[choice]}`);
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

    if(command === "vibecheck") {
        let mentioned = message.mentions.members.first() || message.member
        let activities = mentioned.presence?.activities;

        let spotifyActivity = activities.find(activity => activity.name === 'Spotify');

        if(!spotifyActivity) {
            message.channel.send(`**${mentioned.user.username}#${mentioned.user.discriminator} (${mentioned.nickname || mentioned.user.username})** is not listening to Spotify`)
            return;
        }

        let trackName = spotifyActivity.details;
        let artistName = spotifyActivity.state;
        let albumName = spotifyActivity.assets.largeText;
        let trackIMG = `https://i.scdn.co/image/${spotifyActivity.assets.largeImage.slice(8)}`;

        let searchQuery = `${trackName} ${artistName}`;

        const data = await spotifyApi.clientCredentialsGrant();
        const accessToken = data.body.access_token;

        spotifyApi.setAccessToken(accessToken);

        const searchResults = await spotifyApi.searchTracks(searchQuery, { limit: 1 });
        const track = searchResults.body.tracks.items[0];
        const trackURL = track.external_urls.spotify;


        const embed = new EmbedBuilder()
            .setAuthor({name: 'Spotify Track Info', iconURL: mentioned.user.avatarURL()})
            .setColor(`Random`)
            .addFields(
                {name: "Song Name", value: trackName, inline: true},
                {name: "Album", value: albumName, inline: true},
                {name: "Artist", value: artistName, inline: true},
                {name: "Listen to Track", value: `${trackURL}`},
            )
            .setImage(trackIMG)
            .setFooter({text: mentioned.user.username, iconURL: mentioned.user.displayAvatarURL()})
            .setTimestamp()

        message.channel.send({embeds: [embed]});
    }

    if(command === "spotify") {
        if(!args[0]) {
            message.channel.send("Please enter a song to search");
            return;
        }
        let searchQuery = args.join(" ");
        const data = await spotifyApi.clientCredentialsGrant();
        const accessToken = data.body.access_token;

        spotifyApi.setAccessToken(accessToken);

        const searchResults = await spotifyApi.searchTracks(searchQuery, { limit: 1 });
        let track = searchResults.body.tracks.items[0];
        let trackURL = track.external_urls.spotify;
        let trackName = track.name;
        let artists = track.artists;
        let albumName = track.album.name;
        let releaseDate = track.album.release_date;
        let albumArt = track.album.images[0].url;
        let artistNames = []
        for (let i in artists) {
            artistNames.push(artists[i].name)
        }
        artists = artistNames.join(", ")
        let duration = Math.round(track.duration_ms / 1000);

        let minutes = Math.floor(duration/60);
        let seconds = Math.floor(duration%60);

        duration = minutes + ":" + seconds;
        
        const embed = new EmbedBuilder()
            .setTitle("Top Search Result:")
            .setColor('Random')
            .addFields(
                {name: "Track Name", value: trackName},
                {name: "Artists", value: artists},
                {name: "Duration", value: `${duration}`},
                {name: "Album", value: albumName, inline: true},
                {name: "Release Date", value: releaseDate, inline: true},
                {name: "Listen to Track", value: trackURL}
            )
            .setThumbnail(albumArt)
            .setTimestamp()
        
        message.channel.send({embeds: [embed]})
    }

    if(command === "urban" || command === "ud") {
        if(!args[0]) {
            message.channel.send("Please enter a word to search");
            return;
        }
        let searchQuery = args.join(" ");
        axios.get(`http://api.urbandictionary.com/v0/define?term=${searchQuery}`)
        .then(response => {
            const data = response.data;

            if (data.list.length > 0) {
                let result = data.list[0]
                let definition = result.definition;
                let author = result.author;
                let word = result.word;
                let link = result.permalink;
                let example = result.example;
                let date = result.written_on;
                let thumbsup = result.thumbs_up;
                let thumbsdown = result.thumbs_down;

                const embed = new EmbedBuilder() 
                    .setTitle(word)
                    .addFields(
                        {name: "Definition", value: definition},
                        {name: "Author", value: author, inline: true},
                        {name: "Posted On", value: date, inline: true},
                        {name: "Example", value: example},
                        {name: "Link", value: link}
                    )
                    .setFooter({text: `Upvotes ${thumbsup} : ${thumbsdown} Downvotes`})
                
                    message.channel.send({embeds: [embed]})
            } else {
                message.channel.send(`No definition found for "${searchQuery}".`);
            }
        })
        .catch(error => {
            console.error('Error occurred while fetching definition:', error);
        });

    }

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

/*
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
*/

    if (command === "random") {
        let number1 = parseInt(args[0]);
        let number2 = parseInt(args[1]);
        if (args[1]) {
            let outcome = Math.floor(Math.random() * (number2 - number1)) + number1;
            if (isNaN(outcome))
                message.channel.send("Upper/lower limits are not a number, please enter a valid integer")
            else
                message.channel.send(`${outcome}`);
        }
        else
            message.channel.send("The correct format is ?random <lower limit> <upper limit> (without the angular brackets)");
        return;
    }

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
                message.channel.send(`${number1 + number2}`)
                break;
            case "-":
                message.channel.send(`${number1 - number2}`)
                break;
            case "*":
                message.channel.send(`${number1 * number2}`)
                break;
            case "/":
                message.channel.send(`${number1 / number2}`);
                break;
            case "^":
                message.channel.send(`${number1 ** number2}`);   
                break;
            case "p":
                if(number2 > number1)
                {
                    message.channel.send("Incorrect format for permutations")
                    break;
                }
                message.channel.send(`${factorial(number1) / factorial(number1 - number2)}`)
                break;
            case "c":
                if(number2>number1)
                {
                    message.channel.send("Incorrect format for combinations")
                    break;
                }
                message.channel.send(`${factorial(number1) / (factorial(number1 - number2) * factorial(number2))}`)
                break;
            case "!":
                message.channel.send(`${factorial(parseInt(number1))}`)
                break;
                
            default:
                const embed = new EmbedBuilder()
                    .setTitle("Calc commands")
                    .setColor(`Random`)
                    .addFields(
                        {name: "Addition", value: "?calc num1 + num2"},
                        {name: "Subtraction", value: "?calc num1 - num2"},
                        {name: "Multiplicationo", value: "?calc num1 * num2"},
                        {name: "Division", value: "?calc num1 / num2"},
                        {name: "Power", value: "?calc num1 ^ num2"},
                        {name: "Permutation", value: "?calc num1 p num2"},
                        {name: "Combination", value: "?calc num1 c num2"},
                        {name: "Factorial", value: "?calc num1 !"},
                    )
                    .setTimestamp()
                message.channel.send({embeds: [embed]});
        }
    }
})

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if(interaction.commandName == 'ping') {
        (await interaction.reply("Ping!")).edit(`Pong!\`\`${Math.round(client.ws.ping)}ms\`\``)
    }

    if(interaction.commandName == 'spotify') {
        let searchQuery = interaction.options.get("search-string").value;
        const data = await spotifyApi.clientCredentialsGrant();
        const accessToken = data.body.access_token;

        spotifyApi.setAccessToken(accessToken);

        const searchResults = await spotifyApi.searchTracks(searchQuery, { limit: 1 });
        let track = searchResults.body.tracks.items[0];
        let trackURL = track.external_urls.spotify;
        let trackName = track.name;
        let artists = track.artists;
        let albumName = track.album.name;
        let releaseDate = track.album.release_date;
        let albumArt = track.album.images[0].url;
        let artistNames = []
        for (let i in artists) {
            artistNames.push(artists[i].name)
        }
        artists = artistNames.join(", ")
        let duration = Math.round(track.duration_ms / 1000);

        let minutes = Math.floor(duration/60);
        let seconds = Math.floor(duration%60);

        duration = minutes + ":" + seconds;
        
        const embed = new EmbedBuilder()
            .setTitle("Top Search Result:")
            .setColor('Random')
            .addFields(
                {name: "Track Name", value: trackName},
                {name: "Artists", value: artists},
                {name: "Duration", value: `${duration}`},
                {name: "Album", value: albumName, inline: true},
                {name: "Release Date", value: releaseDate, inline: true},
                {name: "Listen to Track", value: trackURL}
            )
            .setThumbnail(albumArt)
            .setTimestamp()
        
        interaction.reply({embeds: [embed]})
    }

    if(interaction.commandName == "urban") {
        let searchQuery = interaction.options.get("search-string").value;
        axios.get(`http://api.urbandictionary.com/v0/define?term=${searchQuery}`)
        .then(response => {
            const data = response.data;

            if (data.list.length > 0) {
                let result = data.list[0]
                let definition = result.definition;
                let author = result.author;
                let word = result.word;
                let link = result.permalink;
                let example = result.example;
                let date = result.written_on;
                let thumbsup = result.thumbs_up;
                let thumbsdown = result.thumbs_down;

                const embed = new EmbedBuilder() 
                    .setTitle(word)
                    .addFields(
                        {name: "Definition", value: definition},
                        {name: "Author", value: author, inline: true},
                        {name: "Posted On", value: date, inline: true},
                        {name: "Example", value: example},
                        {name: "Link", value: link}
                    )
                    .setFooter({text: `Upvotes ${thumbsup} : ${thumbsdown} Downvotes`})
                
                    interaction.reply({embeds: [embed]})
            } else {
                interaction.reply(`No definition found for "${searchQuery}".`);
            }
        })
        .catch(error => {
            console.error('Error occurred while fetching definition:', error);
        });
    }

    if(interaction.commandName == "weather") {
        let searchTerm = interaction.options.get("city").value;
        weather.find({search: searchTerm, degreeType: 'C'}, function(error, result){
            if(error)
                return interaction.reply(error);

            if(result === undefined || result.length === 0)
                return interaction.reply("Not a valid place");

            var current = result[0].current;
            var location = result[0].location;

            const embed = new EmbedBuilder()
                .setDescription(`**${current.skytext}**`)
                .setTitle(`Weather forecast for ${current.observationpoint}`)
                .setThumbnail(current.imageUrl)
                .setColor(`Random`)
                .setFooter({text: `UTC${location.timezone}`})
                .addFields(
                    {name: 'Temperature', value: `${current.temperature}C`, inline: true},
                    {name: 'Feels Like', value: `${current.feelslike}C`, inline: true},
                    {name: 'Wind', value: `${current.winddisplay}`},
                    {name: 'Humidity', value: `${current.humidity}%`, inline: true},
                )
            interaction.reply({embeds: [embed]});
        })
    }

    if(interaction.commandName == "purge") {
        let deleteCount = interaction.options.get("count").value;
        if (!deleteCount || deleteCount < 2 || deleteCount > 100)
        return interaction.reply("Please provide a number between 2 and 100 for the number of messages to delete");

        const fetched = await interaction.channel.messages.fetch({ limit: deleteCount });
        interaction.channel.bulkDelete(fetched)
            .catch(error => interaction.reply(`Couldn't delete messages because of: ${error}`));
        interaction.reply(`Deleted ${deleteCount} messages`);
    }

    if(interaction.commandName == "serverinfo") {
        const embed = new EmbedBuilder()
            .setAuthor({name: interaction.guild.name})
            .setColor("Random")
            .setThumbnail(interaction.guild.iconURL({ dynamic: true, format: 'png', size: 1024 }))            
            .addFields(
                {name: "Owner", value: `${(await interaction.guild.fetchOwner()).user.tag}`, inline: true},
                {name: "Member count", value: `${interaction.guild.members.cache.filter(m => m.user.bot == false).size}`, inline: true},
                {name: "Bot count", value: `${interaction.guild.members.cache.filter(m => m.user.bot == true).size}`, inline: true},
                {name: "Created at", value: `${moment.utc(interaction.guild.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss')}`},
                {name: "Text channels", value: `${interaction.guild.channels.cache.filter(c => c.type == ChannelType.GuildText).size}`, inline: true},
                {name: "Voice channels", value: `${interaction.guild.channels.cache.filter(c => c.type == ChannelType.GuildVoice).size}`, inline: true},
                {name: "Categories", value: `${interaction.guild.channels.cache.filter(c=> c.type == ChannelType.GuildCategory).size}`, inline: true},
                {name: "Verification level", value: `${interaction.guild.verificationLevel}`},
                {name: `Roles [${interaction.guild.roles.cache.size}]`, value: `${interaction.guild.roles.cache.map(r => `${r}`).slice(1,25).join(' | ')}`},
            )
            .setFooter({text: `ID: ${interaction.guild.id}`})
            .setTimestamp();
        interaction.reply({embeds: [embed]});
    }

    if(interaction.commandName == "echo") {
        let msg = interaction.options.get("string").value;
        interaction.reply(msg);
    }

    if(interaction.commandName == "listemoji") {
        interaction.reply(interaction.guild.emojis.cache.map(r => `${r}`).join(" "))
    }

    if(interaction.commandName == "coinflip") {
        let rng = Math.random();
        if(rng == 0.5)
        {
            interaction.reply("Yow you're not going to believe this but your coin somehow managed to land on its side")
            return;
        }
        let outcome = Math.round(rng);
        if (outcome)
            interaction.reply("Heads")
        else
            interaction.reply("Tails")
    }

    if(interaction.commandName == "roll") {
        let sides = interaction.options.get("sides")?.value || 6;
        let outcome = Math.floor(Math.random() * sides) + 1;
        interaction.reply(`:game_die: Your ${sides} sided die rolled a ${outcome}`)
    }

    if(interaction.commandName == "random") {
        let number1 = interaction.options.get("start").value;
        let number2 = interaction.options.get("end").value;
        if(number1 >= number2) 
            interaction.reply("The upper limit has to be greater than the lower limit")
        else {
            let outcome = Math.floor(Math.random() * (number2 - number1)) + number1;
            interaction.reply(`${outcome}`)
        }
    }
})

client.login(config.token);
