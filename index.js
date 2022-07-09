const commando = require('discord.js-commando');
const bot = new commando.Client();

const  prefix ="?";

bot.on('message', (message) => {
    if(message.content == '!ping'){
    message.channel.send('^-_-^');
    }
});

bot.on('message', (message) => {
    if(message.content == '/juicyrxn') {
    message.channel.send('Hi <@177010196000931840>!')
}});

bot.on('message', (message) => {
    if(message.content == '/Juicyrxn') {
    message.channel.send('Hi <@177010196000931840>!')
}});

bot.on('message', (message) => {
    if(message.content == '/witeeeee') {
    message.channel.send('Hi <@176947217913872384>!')
}});

bot.on('message', (message) => {
    if(message.content == '/Witeeeee') {
    message.channel.send('Hi <@176947217913872384>!')
}});

bot.on('message', (message) => {
    if(message.content == '/ryder') {
    message.channel.send('Hi <@265432441165053953>!')
}});

bot.on('message', (message) => {
    if(message.content == '/Ryder') {
    message.channel.send('Hi <@265432441165053953>!')
}});

bot.on('message', (message) => {
    if(message.content == '/shreyas') {
    message.channel.send('Hi <@426316533195735040>!')
}});

bot.on('message', (message) => {
    if(message.content == '/Shreyas') {
    message.channel.send('Hi <@426316533195735040>!')
}});

bot.on('message', (message) => {
    if(message.content == '/Suga') {
    message.channel.send('Hi <@268640817307058176>!')
}});

bot.on('message', (message) => {
    if(message.content == '/suga') {
    message.channel.send('Hi <@268640817307058176>!')
}}); 

bot.on('message', (message) => {
    if(message.content == 'urmomgay') {
    message.reply('no u')
}}); 

console.log('Bot launched');



bot.registry.registerGroup('random', 'Random');
bot.registry.registerDefaults();
bot.registry.registerCommandsIn(__dirname + "/commands");


bot.login('NDMzMjcxNDE5MzA0OTM1NDY2.Da-ihA.sjDVtXDbDNYe1qmLcBGVHjims0M')