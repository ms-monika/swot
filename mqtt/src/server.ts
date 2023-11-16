/*TODO: 
* Credentials from other file
* Add comments
* http and https configurable 
* 
*/


import { debug, error, info, warn } from  'console';
import Thing from './things';
import { MqttBrokerServerConfig } from './types';
import * as mqtt from "mqtt";

import * as url from "url";
import { AuthenticateError, Client, Server, Aedes } from "aedes";
import * as net from "net";
import * as tls from "tls";
import { IPublishPacket } from "mqtt";
//var messageBus =require('./eventHandler')

var messageBus = require('./eventHandler')
const actionEmitter = require("./actionHandler")

export class WebOfThing {
    private thing: Thing;

    constructor(thing: Thing) {
        this.thing = thing;
    }

    /**
     * get the things description
     */
    getThing(): Thing {
        return this.thing;
    }

}

const fs = require('fs');
const ciphers = 'TLS_CHACHA20_POLY1305_SHA256';
/**
 * Server to represent a Web Thing over MQTT.
 */
export class WoTMqttServer {
    readonly scheme: string = "mqtt";
    things: WebOfThing;
    brokerURI!: string;
    private broker: mqtt.MqttClient | undefined;
    config: MqttBrokerServerConfig;
    private hostedServer: Aedes | undefined;
    hostedBroker: net.Server | undefined;
    port = -1;
    address: string | undefined;

    constructor(
        things: WebOfThing,
        config: MqttBrokerServerConfig
    ) {
        this.things = things;
        this.config = config ?? { uri: "mqtt://localhost:1883" };
        if (config.uri !== undefined) {
            // if there is a MQTT protocol indicator missing, add this
            if (config.uri.indexOf("://") === -1) {
                config.uri = this.scheme + "://" + config.uri;
            }
            this.brokerURI = config.uri;
        }
        if (config.selfHost) {
            this.hostedServer = Server({});
            let server;
            if (config.key) {
                let options = {
                    key: config.key, //fs.readFileSync('./server-private-key.pem'),
                    cert: config.cert,//fs.readFileSync('./server-certificate.pem'),
                    rejectUnauthorized: false,
                    // This is necessary only if using client certificate authentication.
                    requestCert: true,
                    ciphers: ciphers,
                    // This is necessary only if the client uses a self-signed certificate.
                    ca: [ fs.readFileSync('./client/client-certificate.pem')],
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
        }
    }

    private handleMessage(receivedTopic: string, rawPayload: Buffer | string, packet: IPublishPacket): void {
        // route request
        const segments = receivedTopic.split("/");
        console.log(packet)
        let payload = rawPayload
       if (typeof rawPayload === "string") {
            payload = Buffer.from(rawPayload);
            console.log('payload buffer')
            console.log(JSON.parse(payload.toString()))
        }
        if (segments.length === 2) {
            console.log('inside handle')
            if (segments[0] === "actions") {
                console.log('inside actions')
                actionEmitter.invokeAction.emit(segments[1], JSON.parse(payload.toString()))
            }
        }
        else {
            warn(`MqttBrokerServer at ${this.brokerURI} received message for invalid topic '${receivedTopic}'`);
        }
    }
    expose(): Promise<void> {
        return new Promise<void>((resolve) => {
            let actionList = this.things.getThing().getActionDescriptions()
            for (let action in actionList) {
                let topic = actionList[action].forms[0]['href']
                this.broker?.subscribe(topic)
            }
            let eventList = this.things.getThing().getEventDescriptions()
            for (let eventName in eventList) {
                console.log(eventName)
                var addMessageListener = () => {
                    console.log(eventList[eventName].forms[0]['href'])
                    messageBus.emitEvent.once(eventName, async (load:any) => {
                        console.log('help ' + load)
                        this.broker?.publish(eventList[eventName].forms[0]['href'],  load)
                        addMessageListener()
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
                warn(`No broker defined for MQTT server binding - skipping`);
                resolve();
            } else {
                // try to connect to the broker without or with credentials
                if (this.config.psw === undefined) {
                    debug(`MqttBrokerServer trying to connect to broker at ${this.brokerURI}`);
                } else if (this.config.clientId === undefined) {
                    debug(`MqttBrokerServer trying to connect to secured broker at ${this.brokerURI}`);
                } else if (this.config.protocolVersion === undefined) {
                    debug(
                        `MqttBrokerServer trying to connect to secured broker at ${this.brokerURI} with client ID ${this.config.clientId}`
                    );
                } else {
                    debug(
                        `MqttBrokerServer trying to connect to secured broker at ${this.brokerURI} with client ID ${this.config.clientId}`
                    );
                }

                this.broker = mqtt.connect(this.brokerURI, this.config);

                this.broker.on("connect", () => {
                    info(`MqttBrokerServer connected to broker at ${this.brokerURI}`);

                    const parsed = new url.URL(this.brokerURI);
                    this.address = parsed.hostname;
                    const port = parseInt(parsed.port);
                    this.port = port > 0 ? port : 1883;
                    // connect incoming messages to Thing

                });
                this.expose()
                this.broker.on("error", (err: Error) => {
                    error(`MqttBrokerServer could not connect to broker at ${this.brokerURI}`);
                    reject(err);
                });
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
    private selfHostAuthentication(
        _client: Client,
        username: Readonly<string>,
        password: Readonly<Buffer>,
        done: (error: AuthenticateError | null, success: boolean | null) => void
    ) {
        if (this.config.selfHostAuthentication && username !== undefined) {
            for (let i = 0; i < this.config.selfHostAuthentication.length; i++) {
                console.log(this.config.selfHostAuthentication[i].password)
                if (
                    username === this.config.selfHostAuthentication[i].username &&
                     password.equals(Buffer.from(this.config.selfHostAuthentication[i].password))
                ) {
                    done(null, true);
                    return;
                }
            }
            done(null, false);
            return;
        }
        done(null, true);
    }
}