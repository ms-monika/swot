const axios = require('axios')
const DATA = {
  username: "iot", // sone application it can be userName
  password: "gardenThings"
}

let https = require('https')
const agent = new https.Agent({
  rejectUnauthorized: false
});
addPayload = {
  "thingsID": "urn:dev:wot:org:eclipse:thingweb:mygardenThings",
  "securityDefinition": {
    "userpasskeyword_sc": {
      "scheme": "userpasskeyword"        
    }
  },
  "protocolList": {
    "http": {
      "userpasskeyword_sc": {
        "in": "header"
      }
    }
  }
}
addApiPayload = {
  "thingsID": "urn:dev:wot:org:eclipse:thingweb:mygardenThings",
  "securityDefinition": {
    "apikey_sc": {
      "scheme": "apikey"        
    }
  },
  "protocolList": {
    "http": {
      "apikey_sc": {
        "in": "header"
      }
    }
  }
}
removePayload = {
  "thingsID": "urn:dev:wot:org:eclipse:thingweb:mygardenThings",
  "securityPayload": {
    "securityDefinition": ["apikey_sc"] ,
    "protocol": ["http"]
  }
}
axios.get('https://localhost:8080/servient', { httpsAgent: agent }).then((response) => {
  if (response.status === 200) {
    let td = response.data
    let payload = { "threshold": 89 }
    //writePropertyCall(td, 'humidityThreshold', payload)
    //readPropertyCall(td, 'humidityThreshold')
    invokeActionCall(td, 'addSecurity', addPayload)
    invokeActionCall(td, 'addSecurity', addApiPayload)
    //invokeActionCall(td, 'removeSecurity', removePayload)
    //readPropertyCall(td, 'state')
  }
}).catch((e) => {
  console.error(e)
});

// function to remove
function triggerRemove() {
  axios.get('https://localhost:8080/servient', { httpsAgent: agent }).then((response) => {
  if (response.status === 200) {
    let td = response.data
    let payload = { "threshold": 89 }
    invokeActionCall(td, 'removeSecurity', removePayload)
  }
}).catch((e) => {
  console.error(e)
});
}


// function to remove
function triggerUpdate() {
  axios.get('https://localhost:8080/servient', { httpsAgent: agent }).then((response) => {
  if (response.status === 200) {
    let td = response.data
    let payload = { "threshold": 89 }
    invokeActionCall(td, 'removeSecurity', removePayload)
  }
}).catch((e) => {
  console.error(e)
});
}

function writePropertyCall(td, property, payload) {
  let url = td.base + td.properties[property].forms[0].href
  // write to a property
  axios.put(url, payload, { httpsAgent: agent, auth: DATA }).then((response) => {
    if (response.status === 200) {
      console.log('Write Property success')
    }
  }).catch((e) => {
    console.error(e)
  })
}

function readPropertyCall(td, property) {
  let url = td.base + td.properties[property].forms[0].href
  console.log(url)
  // write to a property
  axios.get(url, { httpsAgent: agent, auth: DATA }).then((response) => {
    if (response.status === 200) {
      console.log(property + ' Value:', response.data)
    }
  }).catch((e) => {
    //console.error(e)
  })
}

function invokeActionCall(td, action, payload) {
  let url = td.base + td.actions[action].forms[0].href
 
  // write to a property
  axios.post(url, payload, { httpsAgent: agent, auth: DATA }).then((response) => {
    if (response.status === 200) {
      console.log('Action is invoked')
    }
  }).catch((e) => {
    console.error(e)
  })
}