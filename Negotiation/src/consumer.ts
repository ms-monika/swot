/*TODO: 
* Credentials from other file
* Add comments
* http and https configurable 
* 
*/



import { encrypt, decrypt } from './securityScheme/aes_encryption';
// MQTT
import { MqttBrokerServerConfig } from './types';
import * as mqtt from "mqtt";

import { AuthenticateError, Client,  Aedes } from "aedes";
import * as net from "net";
import * as tls from "tls";
import { WebOfThing } from "./server"


var messageBus = require('./eventHandler')
const actionEmitter = require("./actionHandler")


/**
 * Server to represent a Web Thing over MQTT.
 */
export class WoTMqttConsumer {
    readonly scheme: string = "mqtt";
    things: WebOfThing;
    brokerURI!: string;
    private broker!: mqtt.MqttClient;
    config: MqttBrokerServerConfig;
    private hostedServer: Aedes | undefined;
    hostedBroker: net.Server | undefined;
    port = -1;
    address: string | undefined;
    schema: string | undefined;
    constructor(
        things: WebOfThing,
        config: MqttBrokerServerConfig
    ) {
        this.things = things;
        this.config = config ?? { uri: "mqtt://localhost:1883" };
        this.schema = things.getThing().getSecurityScheme();
        if (config.uri !== undefined) {
            // if there is a MQTT protocol indicator missing, add this
            if (config.uri.indexOf("://") === -1) {
                config.uri = this.scheme + "://" + config.uri;
            }
            this.brokerURI = config.uri;
        }
       /* if (config.selfHost) {
            this.hostedServer = Server({});
            let server;
            if (this.schema === "tls") { //if (config.key) {
                let options = {
                    key: config.key, //fs.readFileSync('./server-private-key.pem'),
                    cert: config.cert,//fs.readFileSync('./server-certificate.pem'),
                    rejectUnauthorized: false,
                    // This is necessary only if using client certificate authentication.
                    requestCert: true,
                    ciphers: ciphers,
                    // This is necessary only if the client uses a self-signed certificate.
                    ca: [fs.readFileSync('./client/client-certificate.pem')],
                }
                server = tls.createServer(options, this.hostedServer.handle);
            } else {
                server = net.createServer(this.hostedServer.handle);
            }
            const parsed = new url.URL(this.brokerURI);
            const port = parseInt(parsed.port);
            this.port = port > 0 ? port : 1883;
            this.hostedBroker = server.listen(port);
            this.hostedServer.authenticate = this.selfHostAuthentication.bind(this);
        }*/

    }

    /*handleEvent(eventName: string, load:any): void {
        let eventList = this.things.getThing().getEventDescriptions()
        console.log('here i am ' + eventName)
        this.broker.publish(eventList[eventName].forms[0]['href'],Object.keys(load).length > 0 ? load : '')
    }*/

    private handleMessage(receivedTopic: string, rawPayload: Buffer | string): void {
        // route request
        const segments = receivedTopic.split("/");
        let payload = rawPayload
        if (typeof rawPayload === "string") {
            payload = Buffer.from(rawPayload);
        }
        if (segments.length === 2) {
            if (segments[0] === "events") {
                if(this.schema === "symmetricEncryption" && Object.keys(payload).length > 0) {    
                    let jsondata = JSON.stringify(payload);                    
                    payload = Buffer.from(JSON.parse(jsondata).data).toString('utf8');                
                    payload = decrypt(JSON.parse(payload), "aes-256-cbc")
                }
                messageBus.emitEvent.emit(segments[1], payload.toString() != '' ? (payload.toString()) : '')
            }
        }
        else {
            console.warn(`MqttBrokerServer at ${this.brokerURI} received message for invalid topic '${receivedTopic}'`);
        }
    }

    expose(): Promise<void> {
        return new Promise<void>((resolve) => {
            
            let eventList = this.things.getThing().getEventDescriptions()
            for (let eventName in eventList) {
                let topic = eventList[eventName].forms[0]['href']
                this.broker.subscribe(topic)

            }
            let actionList = this.things.getThing().getActionDescriptions()
            for (let action in actionList) {
                var addMessageListener = () => {
                    actionEmitter.invokeAction.on(action, async (load: any) => {
                        if (this.schema === "symmetricEncryption" && Object.keys(load).length > 0) {
                            load = (JSON.stringify(encrypt(load, "aes-256-cbc")))
                        }
                        this.broker.publish(actionList[action].forms[0]['href'], Object.keys(load).length > 0 ? load : '')
                        //addMessageListener()
                    })
                }
                addMessageListener()
            }
            if (this.broker !== undefined) {
                this.broker.on("message", this.handleMessage.bind(this));
            }
            resolve();
        })
    }

    start(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.brokerURI === undefined) {
                console.warn(`No broker defined for MQTT server binding - skipping`);
                resolve();
            } else {
                // try to connect to the broker without or with credentials
                if (this.config.psw === undefined) {
                    console.debug(`MqttBrokerServer trying to connect to broker at ${this.brokerURI}`);
                } else if (this.config.clientId === undefined) {
                    console.debug(`MqttBrokerServer trying to connect to secured broker at ${this.brokerURI}`);
                } else if (this.config.protocolVersion === undefined) {
                    console.debug(
                        `MqttBrokerServer trying to connect to secured broker at ${this.brokerURI} with client ID ${this.config.clientId}`
                    );
                } else {
                    console.debug(
                        `MqttBrokerServer trying to connect to secured broker at ${this.brokerURI} with client ID ${this.config.clientId}`
                    );
                }

                this.broker = mqtt.connect(this.brokerURI, this.config);

                this.broker.on("connect", () => {
                    console.info(`MqttBrokerConsumer connected to broker at ${this.brokerURI}`);

                    resolve()
                    //this.expose()

                });
                this.broker.on("error", (err: Error) => {
                    console.error(`MqttConsumer could not connect to broker at ${this.brokerURI}`);
                    reject(err);
                });
                //resolve()
            }
        });
    }

    async stop(): Promise<void> {
        if (this.broker !== undefined) {
            this.broker.unsubscribe("*");
            this.broker.end(true);
        }

        /*if (this.hostedBroker !== undefined) {
            await new Promise<void>((resolve) => this.hostedServer.close(() => resolve()));
            await new Promise<void>((resolve) => this.hostedBroker.close(() => resolve()));
        }*/
    }
   
}
