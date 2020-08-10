const Discord = require("discord.js");
const client = new Discord.Client();

var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "toor",
    database: "TAT"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected successfully");
});

var prefix = "!";

const fs = require("fs");
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once("ready", () => {console.log("Bot is online")});

client.on("message", message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "ping") {
        message.channel.send("Pong!");
    } else if (command === "prefix") {
        prefix = args[0];
        message.channel.send(`Prefix changed to "${args[0]}"`);
    } else if (command === "attribute") {
        if (args[0] === "create") {
            message.channel.send("What should the name be?");
            const filter = m => m.author.id === message.author.id;
            message.channel.awaitMessages(filter, {max: 1, time: 60000, errors: ["time"] })
                .then(collected => {
                    let arg = collected.first().content;
                    connection.query(`SELECT * FROM Attributes WHERE AttributeID="${arg}"`, (err, results) => {
                        if (err) throw err;
                        if (results.length === 0) {
                            console.log("Empty");
                            connection.query(`INSERT INTO Attributes (userID, AttributeID, AttributeStrength, isOwner) VALUES ('${message.author.id}', "${arg}", 0, 1)`, err => {
                                if (err) throw err;
                                console.log("Successfully created attribute");
                            });
                            message.channel.send("Successfully created attribute");
                        } else {
                            message.channel.send("That attribute already exists");
                        }
                    });
                });
        } else if (args[0] === "join") {
            message.channel.send("What attribute do you want to join?");
            const filter = m => m.author.id === message.author.id;
            message.channel.awaitMessages(filter, {max: 1, time: 60000, errors: ["time"] })
                .then(collected => {
                    let arg = collected.first().content;
                    connection.query(`SELECT * FROM Attributes WHERE AttributeID="${arg}"`, (err, results) => {
                        if (err) throw err;
                        connection.query(`SELECT EXISTS(SELECT * FROM Attributes WHERE userID="${message.author.id}" AND isOwner=1 AND AttributeID="${arg}")`, (err, results) => {
                            if (err) throw err;
                            if (results.length !== 0) {
                                message.channel.send("You can't join your own attribute");
                            }
                        });
                        if (results.length === 0) {
                            message.channel.send("No such attribute exists");
                        } else {
                            connection.query(`INSERT INTO Attributes (userID, AttributeID, AttributeStrength, isOwner) VALUES ('${message.author.id}', "${arg}", ${results[0].AttributeStrength + 1000}, 0)`)
                        }
                    });
                });
        }
    }
})

client.login('NzQxODU2OTM2MjU3MTI2NDYz.Xy9qHA.M83s0oNUX19NiVhDFDviCwL3q0U');