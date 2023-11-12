

const {
  WoTHttpServer,
  WebOfThing,
  Thing
} = require('./dist/affordance');

//verificationStep = require('./verification')
actionFunc = require("./dist/actionHandler")
eventFunc = require("./dist/eventHandler")
ThingsConsume = require("./dist/thingsConsume")
let verify = require("./dist/verification")
// Fetching the things description json from a file
const tdJson = require('./td.json');
// consuming the TD
let servient = new ThingsConsume(tdJson);

console.log(servient.getProperty('securitySchemeSupported'))

var runningServers = [];
// action call function

/*
actionFunc.invokeAction.on('stopSprinkler', () => {
  console.log("stop the Sprinkler ")
})*/

const thing = require('./td_thing.json');
let thingJson = new ThingsConsume(thing);

// Create an Things Instance
function addThingsInstance() {
  // Fetch the TD for the things
  const thingServer = new WoTHttpServer(
    new WebOfThing(thingJson),
    8082
  );
  return thingServer
}



const server = new WoTHttpServer(
  new WebOfThing(servient),
  8080
);

process.on('SIGINT', () => {
  server
    .stop()
    .then(() => process.exit())
    .catch(() => process.exit());
  thingServer
    .stop()
    .then(() => process.exit())
    .catch(() => process.exit());
});

server.start().then(() => {
  actionFunc.invokeAction.on('addSecurity', (payload) => {
    console.log("Add process is triggered")
    if (verify.verifyThingId(server.getThingsID(), payload.thingsID)) {  // Thing ID verification
      supportedScheme = servient.getProperty('securitySchemeSupported')
      for (var key in payload.securityDefinition) {
        if (payload.securityDefinition.hasOwnProperty(key)) {
          var schemeValue = payload.securityDefinition[key].scheme;
        }
        if (supportedScheme.includes(schemeValue)) { // Security Scheme Supported verification
          if (payload.protocolList) {
            let defaultList = servient.findProperty("protocolSecurityConfigurations").metadata
            if (verify.verifyProtocolSecurity(payload.protocolList, defaultList)) { // Protocol Security Mapping verification
              console.log("verification Successful")
              // Update the TD
              thingJson.addsecurity(payload.securityDefinition, key)   
              thingJson.addProtocolSecMapping('httpServer',payload.protocolList['http'])
            }
          }
        }
      }
    }
  })
  // Remove function
  actionFunc.invokeAction.on('removeSecurity', (payload) => {
    console.log("Remove process is triggered")
    if (verify.verifyThingId(server.getThingsID(), payload.thingsID)) {  // Thing ID verification
      //supportedScheme = servient.getProperty('securitySchemeSupported')
      if (thingJson.getSecurityKeyword() != payload.securityPayload.securityDefinition ) {
        thingJson.removeSecurity(payload.securityPayload.securityDefinition)      
        thingJson.removeProtocolSecMapping('httpServer',payload.securityPayload.securityDefinition)
      }
    }
  })
  // Update function
  actionFunc.invokeAction.on('updateSecurity', (payload) => {
    console.log("Update process is triggered")
    if (verify.verifyThingId(server.getThingsID(), payload.thingsID)) {  // Thing ID verification
      for (var key in payload.securityDefinition) {
        if (payload.securityDefinition.hasOwnProperty(key)) {
          var schemeValue = payload.securityDefinition[key].scheme;
        }
        if (supportedScheme.includes(schemeValue)) { // Security Scheme Supported verification
          if (payload.protocolList) {
            let defaultList = servient.findProperty("protocolSecurityConfigurations").metadata
            if (verify.verifyProtocolSecurity(payload.protocolList, defaultList)) { // Protocol Security Mapping verification
              console.log("verification Successful")
              // Update the TD
              thingJson.addsecurity(payload.securityDefinition, key)   
              thingJson.addProtocolSecMapping('httpServer',payload.protocolList['http'])
            }
          }
        }
      }
    }
  })
  thingServer = addThingsInstance();
  thingServer.start().catch(console.error);
  // Adding the Things to the list
  server.addThings(thingJson.getTD())
}).catch(console.error);