const mqtt = require('mqtt');

// create a new MQTT client instance
const client = mqtt.connect('mqtt://localhost:1889');

// when the client is connected
client.on('connect', () => {
  console.log('Client connected to MQTT broker');
  // subscribe to a topic
 client.subscribe('events/counterEvent');
});

// when the client receives a message
client.on('message', (topic, message, packet) => {
  console.log(`Received message on topic ${topic}: ${message.toString()}`);
  console.log(JSON.stringify(packet))
});

client.publish('actions/resetCounter', '1');
//client.publish('mqtt://test.mosquitto.org:1883/MQTT-Test/events/counterEvent', '4');

/*const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1889'); 
const topic = 'counterEvent';
const message = 'test message'; 

client.on('connect', () => {
    console.log(`Is client connected: ${client.connected}`);    
    if (client.connected === true) {
        console.log(`message: ${message}, topic: ${topic}`); 
        // publish message        
        client.publish(topic, message);
    }

    // subscribe to a topic
    client.subscribe(topic);
});

// receive a message from the subscribed topic
client.on('message',(topic, message) => {
    console.log(`messagesss: ${message}, topic: ${topic}`); 
});

// error handling
client.on('error',(error) => {
    console.error(error);
    process.exit(1);
});*/