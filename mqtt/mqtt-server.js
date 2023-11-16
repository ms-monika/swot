
const {
    WoTMqttServer,
    WebOfThing,
} = require('./dist/affordance');

const fs = require('fs');
actionFunc = require("./dist/actionHandler")
eventFunc = require("./dist/eventHandler")
ThingsConsume = require("./dist/thingsConsume")
// Fetching the things description json from a file
const tdJson= require('./td_mqtt.json'); 
// consuming the TD
let garden = new ThingsConsume(tdJson);
//console.log(garden)
garden.setWriteProperty('state','manualWatering')
let counter = 0
// action call function
actionFunc.invokeAction.on('resetCounter', (payload) => {
  console.log("reset counter " + payload)
  setInterval(() => {
    ++counter;
    if(counter > 6 ) {
        eventFunc.emitEvent.emit('counterEvent', counter.toString())
        console.info("New count ", counter);
    }
}, 1000);

})

/* process.on('SIGINT', () => {
    server
      .stop()
      .then(() => process.exit())
      .catch(() => process.exit());
  });

  server.start().catch(console.error);
  */

  const ciphers = 'TLS_CHACHA20_POLY1305_SHA256';
  const server = new WoTMqttServer(
    new WebOfThing(garden),
    { 
        uri: 'mqtt://localhost:1889', 
        selfHost: true,
       // protocol: 'mqtts',
        rejectUnauthorized: false,
        //key: fs.readFileSync('./client/client-private-key.pem'),
        //cert: fs.readFileSync('./client/client-certificate.pem'),
        ciphers: ciphers
    }
  )
  server.start().catch(console.error);