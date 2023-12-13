const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');
const fs = require('fs');
const { DateTime } = require('luxon');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.User] // This is required for handling DMs and mentions
});

const DEVELOPER_ID = '872518366349393940';

let services = {};
let subscriptions = {};

function loadServices() {
    try {
        services = JSON.parse(fs.readFileSync('services.json', 'utf8'));
    } catch (error) {
        console.error("Error loading services:", error);
        services = {};
    }
}

function loadSubscriptions() {
    try {
        subscriptions = JSON.parse(fs.readFileSync('subscriptions.json', 'utf8'));
    } catch (error) {
        console.error("Error loading subscriptions:", error);
        subscriptions = {};
    }
}

client.once('ready', () => {
    loadServices();
    loadSubscriptions();
    console.log(`Logged in as ${client.user.tag}!`);
    checkSubscriptions();
    setInterval(checkSubscriptions, 60000); // Check every 60 seconds
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (message.author.id === DEVELOPER_ID) {
        if (command === 'add_service') {
            addService(message, args[0], parseFloat(args[1]));
        } else if (command === 'addsub') {
            const userMention = args.shift();
            const service = args[0];
            const duration = parseInt(args[1]);
            await addSubscription(message, userMention, service, duration);
        }
    }
});

function addService(message, name, price) {
    if (!name || isNaN(price)) {
        sendEmbedReply(message, "Error", "Invalid service name or price.", 0xFF0000);
        return;
    }
    services[name] = price;
    fs.writeFileSync('services.json', JSON.stringify(services, null, 4));
    sendEmbedReply(message, "Service Added", `Service \`${name}\` added with price $${price}`, 0x00FF00);
}

async function addSubscription(message, userMention, service, duration) {
    const user = getUserFromMention(userMention);
    if (!user || !services[service] || duration <= 0) {
        sendEmbedReply(message, "Error", "Invalid command usage. Ensure the user, service, and duration are correct.", 0xFF0000);
        return;
    }
    const expiry = DateTime.now().plus({ days: duration }).toISO();
    subscriptions[user.id] = { service, expiry };
    fs.writeFileSync('subscriptions.json', JSON.stringify(subscriptions, null, 4));
    
    try {
        await user.send({ 
            embeds: [new EmbedBuilder()
                .setTitle("Subscription Added")
                .setDescription(`You have been subscribed to service ${service} for ${duration} days. It will expire on ${expiry}.`)
                .setColor(0x00FF00)] 
        });
        sendEmbedReply(message, "Subscription Added", `User ${user.tag} has been subscribed to service ${service} for ${duration} days.`, 0x00FF00);
    } catch (error) {
        console.error("Failed to send DM: ", error);
        sendEmbedReply(message, "Error", "Failed to send DM to the user. They might have DMs disabled or have not shared a server with the bot.", 0xFF0000);
    }
}


function getUserFromMention(mention) {
    if (!mention) return;
    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);
        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }
        return client.users.cache.get(mention);
    }
}

async function showServices(message) {
    const embed = new EmbedBuilder()
        .setTitle("Available Services")
        .setDescription("Here are the available services and their prices:")
        .setColor(0x3498db);

    for (const [service, price] of Object.entries(services)) {
        embed.addFields({ name: service, value: `$${price}`, inline: true });
    }

    await message.reply({ embeds: [embed] });
}

function checkSubscriptions() {
    const current_time = DateTime.now();
    console.log("Checking subscriptions...");

    for (const [userId, { service, expiry }] of Object.entries(subscriptions)) {
        const expiryTime = DateTime.fromISO(expiry);
        if (current_time >= expiryTime) {
            delete subscriptions[userId];
            client.users.fetch(userId).then(user => {
                sendEmbedNotification(user, "Subscription Expired", `Your subscription to service ${service} has expired.`, 0xFF0000);
            }).catch(console.error);
        }
    }
    fs.writeFileSync('subscriptions.json', JSON.stringify(subscriptions, null, 4));
}

function sendEmbedReply(message, title, description, color) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);
    message.reply({ embeds: [embed] });
}

function sendEmbedNotification(user, title, description, color) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);
    user.send({ embeds: [embed] });
}

client.login('ODcyNTc2OTc5ODgxMzI0NjQ1.Ggm5Eu.jQxiHNBot3gPTpzuGKiO3x-hnNICnwpr_pkj9Q');