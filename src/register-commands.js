const config = require("./config.json");
const {REST, Routes, ApplicationCommandOptionType} = require("discord.js")

const commands = [
    {
        name: 'ping',
        description: 'Round trip response time of the bot',
    },
    {
        name: 'spotify',
        description: 'Search for any song on Spotify',
        options: [
            {
                name: 'search-string',
                description: 'Song to be searched on Spotify',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name: 'urban',
        description: 'Look anything up on Urban Dictionary',
        options: [
            {
                name: 'search-string', 
                description: 'Word/Phrase to be searched on Urban Dictionary',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name: 'weather',
        description: 'Get weather information for any city',
        options: [
            {
                name: 'city', 
                description: 'City to get weather information', 
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name: 'purge', 
        description: 'Deletes a specified number of the most recent messages in a channel',
        options: [
            {
                name: 'count',
                description: 'Number of messages to delete',
                type: ApplicationCommandOptionType.Integer,
                required: true
            }
        ]
    },
    {
        name: 'serverinfo',
        description: 'Displays information about the server'
    },
    {
        name: 'echo', 
        description: 'Repeats what you want it to say, truly an echochamber',
        options: [
            {
                name: 'string', 
                description: 'The text you want to be repeated', 
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
    {
        name: 'listemoji', 
        description: 'Sends all emoji available in a server'
    },
    {
        name: 'coinflip',
        description: 'Flips a coin'
    },
    {
        name: 'roll', 
        description: 'Rolls a die',
        options: [
            {
                name: 'sides', 
                description: 'Number of sides of the die to be rolled, default 6',
                type: ApplicationCommandOptionType.Integer
            }
        ]
    },
    {
        name: 'random', 
        description: 'Generates a random number between two specified intervals',
        options: [
            {
                name: 'start', 
                description: 'Lower limit',
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
            {
                name: 'end', 
                description: 'Upper limit', 
                type: ApplicationCommandOptionType.Integer,
                required: true
            }
        ]
    }
]

const rest = new REST({version: '10'}).setToken(config.token);

(async () => {
    try {
        console.log("Registering")

        await rest.put(
            Routes.applicationCommands(config.clientID),
            {body: commands}
        )

        console.log("Registered")
    }
    catch (error) {
        console.log(error);
    }
})();