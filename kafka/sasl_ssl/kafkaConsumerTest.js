const {
  WebOfThing,
} = require('../dist/affordance');
const { WoTKafkaClientServer } = require("../dist/kafkaClient")
actionFunc = require("../dist/actionHandler")
eventFunc = require("../dist/eventHandler")
ThingsConsume = require("../dist/thingsConsume")
require('dotenv').config();

const { KAFKA_USERNAME: username, KAFKA_PASSWORD: password } = process.env
const sasl_plain = username && password ? { username, password, mechanism: 'plain' } : null
// Fetching the things description json from a file
const tdJson = require('../td.json');
// consuming the TD
let garden = new ThingsConsume(tdJson);
const path = require('path');
const filePath = 'docker-compose.yml';

const fs = require('fs')
logLevel = require('../dist/types')

const wotClient = new WoTKafkaClientServer(
  new WebOfThing(garden),
  {
    clientId: "npm-slack-notifier",
    brokers: ["localhost:9093"],
    ssl: {
      rejectUnauthorized: false,
      ca: [fs.readFileSync('./secrets/ca-cert')],
      key: fs.readFileSync('./secrets/kafka-client-keystore.pem'),
      cert: fs.readFileSync('./secrets/kafka-client-cert.pem')
    },
      logLevel: logLevel.NOTHING
  }
)

wotClient.start().then(() => {
  wotClient.expose().then(() => {
    console.log("Trigger startSprinkler")
    console.log("--------------------")
    actionFunc.invokeAction.emit('startSprinkler', {})
    // action call function
    eventFunc.emitEvent.on('tooDry', (thing) => {
      console.log("--------------------")
      console.log("Event tooDry triggered ")
      //console.log("Trigger startSprinkler")
      console.log("--------------------")
      //actionFunc.invokeAction.emit('startSprinkler', {})
    })

    eventFunc.emitEvent.on('tooWet', (thing) => {
      console.log("--------------------")
      console.log("Event tooWet triggered ")
      console.log("Trigger startSprinkler")
      console.log("--------------------")
      actionFunc.invokeAction.emit('stopSprinkler', {})
    })
  }).catch(console.error);

}).catch(console.error);

/*
wotClient.start().then(() => {
  wotClient.expose().then(() => {
    console.log("Trigger startSprinkler")
    console.log("--------------------")
    actionFunc.emitEvent.emit('startSprinkler', {})
    // action call function
    eventFunc.invokeAction.on('tooDry', (thing) => {
      console.log("--------------------")
      console.log("Event tooDry triggered ")
      console.log("Trigger startSprinkler")
      console.log("--------------------")
      console.log("Consumer")
      actionFunc.emitEvent.emit('startSprinkler', {})
    })

    eventFunc.invokeAction.on('tooWet', (thing) => {
      console.log("--------------------")
      console.log("Event tooDry triggered ")
      console.log("Trigger startSprinkler")
      console.log("--------------------")
      console.log("Consumer")
      actionFunc.emitEvent.emit('stopSprinkler', {})
    })
  }).catch(console.error);

}).catch(console.error);*/