
const {
    WoTKafkaServer,
    WebOfThing,
} = require('../dist/affordance');
actionFunc = require("../dist/actionHandler")
eventFunc = require("../dist/eventHandler")
ThingsConsume = require("../dist/thingsConsume")

// Fetching the things description json from a file
const tdJson = require('../td.json');
// consuming the TD
let garden = new ThingsConsume(tdJson);
logLevel = require("../dist/types")
const path = require('path');
const filePath = 'docker-compose.yml';
require('dotenv').config();

const { KAFKA_USERNAME: username, KAFKA_PASSWORD: password } = process.env
const sasl_plain = username && password ? { username, password, mechanism: 'plain' } : null
const server = new WoTKafkaServer(
    new WebOfThing(garden),
    {
        clientId: "npm-slack-notifier",
        brokers: ["localhost:9092"],
        ssl: false,
        sasl:sasl_plain,
        logLevel: logLevel.NOTHING
    }
)
//server.start().catch(console.error);
server.start().then(() => {
    server.expose().then(() => {
        actionFunc.invokeAction.on('startSprinkler', (payload) => {
            console.log("start the Sprinkler ")
            console.log("tooWet ")
            //server.handleEvent("tooWet","")
            eventFunc.emitEvent.emit('tooWet', "stop it")
        })

        actionFunc.invokeAction.on('stopSprinkler', () => {
            console.log("stop the Sprinkler ")
            console.log("tooDry ")

            //server.handleEvent("tooWet","")
            eventFunc.emitEvent.emit('tooDry', "start it")
        })
    }).catch(console.error);
}).catch(console.error);