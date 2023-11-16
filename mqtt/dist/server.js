"use strict";
/*TODO:
* Credentials from other file
* Add comments
* http and https configurable
*
*/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WoTMqttServer = exports.WebOfThing = void 0;
const console_1 = require("console");
const mqtt = __importStar(require("mqtt"));
const url = __importStar(require("url"));
const aedes_1 = require("aedes");
const net = __importStar(require("net"));
const tls = __importStar(require("tls"));
//var messageBus =require('./eventHandler')
var messageBus = require('./eventHandler');
const actionEmitter = require("./actionHandler");
class WebOfThing {
    constructor(thing) {
        this.thing = thing;
    }
    /**
     * get the things description
     */
    getThing() {
        return this.thing;
    }
}
exports.WebOfThing = WebOfThing;
const fs = require('fs');
const ciphers = 'TLS_CHACHA20_POLY1305_SHA256';
/**
 * Server to represent a Web Thing over MQTT.
 */
class WoTMqttServer {
    constructor(things, config) {
        this.scheme = "mqtt";
        this.port = -1;
        this.things = things;
        this.config = config !== null && config !== void 0 ? config : { uri: "mqtt://localhost:1883" };
        if (config.uri !== undefined) {
            // if there is a MQTT protocol indicator missing, add this
            if (config.uri.indexOf("://") === -1) {
                config.uri = this.scheme + "://" + config.uri;
            }
            this.brokerURI = config.uri;
        }
        if (config.selfHost) {
            this.hostedServer = (0, aedes_1.Server)({});
            let server;
            if (config.key) {
                let options = {
                    key: config.key,
                    cert: config.cert,
                    //rejectUnauthorized: false,
                    // This is necessary only if using client certificate authentication.
                    requestCert: true,
                    ciphers: ciphers,
                    // This is necessary only if the client uses a self-signed certificate.
                    ca: [fs.readFileSync('./client/client-certificate.pem')],
                };
                server = tls.createServer(options, this.hostedServer.handle);
            }
            else {
                server = net.createServer(this.hostedServer.handle);
            }
            const parsed = new url.URL(this.brokerURI);
            const port = parseInt(parsed.port);
            this.port = port > 0 ? port : 1883;
            this.hostedBroker = server.listen(port);
            this.hostedServer.authenticate = this.selfHostAuthentication.bind(this);
        }
    }
    handleMessage(receivedTopic, rawPayload, packet) {
        // route request
        const segments = receivedTopic.split("/");
        console.log(packet);
        let payload = rawPayload;
        if (typeof rawPayload === "string") {
            payload = Buffer.from(rawPayload);
            console.log('payload buffer');
            console.log(JSON.parse(payload.toString()));
        }
        if (segments.length === 2) {
            console.log('inside handle');
            if (segments[0] === "actions") {
                console.log('inside actions');
                actionEmitter.invokeAction.emit(segments[1], JSON.parse(payload.toString()));
            }
        }
        else {
            (0, console_1.warn)(`MqttBrokerServer at ${this.brokerURI} received message for invalid topic '${receivedTopic}'`);
        }
    }
    expose() {
        return new Promise((resolve) => {
            var _a;
            let actionList = this.things.getThing().getActionDescriptions();
            for (let action in actionList) {
                let topic = actionList[action].forms[0]['href'];
                (_a = this.broker) === null || _a === void 0 ? void 0 : _a.subscribe(topic);
            }
            let eventList = this.things.getThing().getEventDescriptions();
            for (let eventName in eventList) {
                console.log(eventName);
                var addMessageListener = () => {
                    console.log(eventList[eventName].forms[0]['href']);
                    messageBus.emitEvent.once(eventName, async (load) => {
                        var _a;
                        console.log('help ' + load);
                        (_a = this.broker) === null || _a === void 0 ? void 0 : _a.publish(eventList[eventName].forms[0]['href'], load);
                        addMessageListener();
                    });
                };
                addMessageListener();
            }
            if (this.broker !== undefined) {
                this.broker.on("message", this.handleMessage.bind(this));
            }
            resolve();
        });
    }
    start() {
        return new Promise((resolve, reject) => {
            if (this.brokerURI === undefined) {
                (0, console_1.warn)(`No broker defined for MQTT server binding - skipping`);
                resolve();
            }
            else {
                // try to connect to the broker without or with credentials
                if (this.config.psw === undefined) {
                    (0, console_1.debug)(`MqttBrokerServer trying to connect to broker at ${this.brokerURI}`);
                }
                else if (this.config.clientId === undefined) {
                    (0, console_1.debug)(`MqttBrokerServer trying to connect to secured broker at ${this.brokerURI}`);
                }
                else if (this.config.protocolVersion === undefined) {
                    (0, console_1.debug)(`MqttBrokerServer trying to connect to secured broker at ${this.brokerURI} with client ID ${this.config.clientId}`);
                }
                else {
                    (0, console_1.debug)(`MqttBrokerServer trying to connect to secured broker at ${this.brokerURI} with client ID ${this.config.clientId}`);
                }
                this.broker = mqtt.connect(this.brokerURI, this.config);
                this.broker.on("connect", () => {
                    (0, console_1.info)(`MqttBrokerServer connected to broker at ${this.brokerURI}`);
                    const parsed = new url.URL(this.brokerURI);
                    this.address = parsed.hostname;
                    const port = parseInt(parsed.port);
                    this.port = port > 0 ? port : 1883;
                    // connect incoming messages to Thing
                });
                this.expose();
                this.broker.on("error", (err) => {
                    (0, console_1.error)(`MqttBrokerServer could not connect to broker at ${this.brokerURI}`);
                    reject(err);
                });
            }
        });
    }
    async stop() {
        if (this.broker !== undefined) {
            this.broker.unsubscribe("*");
            this.broker.end(true);
        }
        /*if (this.hostedBroker !== undefined) {
            await new Promise<void>((resolve) => this.hostedServer.close(() => resolve()));
            await new Promise<void>((resolve) => this.hostedBroker.close(() => resolve()));
        }*/
    }
    selfHostAuthentication(_client, username, password, done) {
        if (this.config.selfHostAuthentication && username !== undefined) {
            for (let i = 0; i < this.config.selfHostAuthentication.length; i++) {
                console.log(this.config.selfHostAuthentication[i].password);
                if (username === this.config.selfHostAuthentication[i].username //&&
                // password.equals(Buffer.from(this.config.selfHostAuthentication[i].password)
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
exports.WoTMqttServer = WoTMqttServer;
//# sourceMappingURL=server.js.map