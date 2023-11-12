/*TODO: 
* Credentials from other file
* Add comments
* http and https configurable 
* 
*/


import bodyParser from 'body-parser';
import express from 'express';
import * as http from 'http';
import * as https from 'https';
import Thing from './things';
import { responseArray } from './types';
import { cryptoUsingMD5, cryptoUsingSHA256, digestAuth, parseAuthenticationInfo } from './securityScheme/digest';
import { verifyTokenUSingOkta} from './securityScheme/clientCredential'
import { encrypt, decrypt } from './securityScheme/aes_encryption';
// MQTT
import { MqttBrokerServerConfig, ProtocolServer } from './types';
import * as mqtt from "mqtt";

import * as url from "url";
import { AuthenticateError, Client, Server, Aedes } from "aedes";
import * as net from "net";
import * as tls from "tls";
//import { IPublishPacket } from "mqtt";
//var messageBus =require('./eventHandler')

const fs = require('fs');
const ciphers = 'TLS_CHACHA20_POLY1305_SHA256';
var messageBus = require('./eventHandler')
const actionEmitter = require("./actionHandler")

/*var EventEmitter = require('events').EventEmitter
var messageBus = new EventEmitter()*/
//var responseArray: express.Response<any, Record<string, any>>[] | { send: () => void; }[] = []

var responseList: responseArray[]
responseList = []

const credential_digest = {
    userName: "iot",
    password: "gardenThings",
    realm: 'Digest Authentication'
};
const credentials = {
    userName: "iot",
    password: "gardenThings"
};
const apiCredential = {
    apikey: "gardenThings"
}
const bearerCredentials = {
    token: 'eyJraWQiOiJ1dURLVTMxZWRvTi0wd0xMUnl1TW1vbmtBdi1OaFEwejZhWmxjdTN5NU8wIiwiYWxnIjoiUlMyNTYifQ'
}

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


abstract class BaseHandler {
    protected things: WebOfThing;
    constructor(things: WebOfThing) {
        this.things = things;
    }
    getThing(): Thing | null {
        return this.things.getThing();
    }

    publish(event: string, data: any) {
        //messageBus.emit(event, data)
        messageBus.emitEvent.emit(event, data)
    }
}



/**
 * Handle a request to /.
 */
class WoTThingHandler extends BaseHandler {

    get(req: express.Request, res: express.Response): void {
        const thing = this.getThing();
        if (thing === null) {
            res.status(400).end();
            return;
        }
        //console.log(req.socket.remoteAddress)
        const description = thing.getTD();
        description.base = `${req.protocol}://${req.headers.host}${thing.getHref()}`;
        res.json(description);
    }
}

/**
 * Property Request handler
 */
class PropertyHandler extends BaseHandler {
    // Read property request
    get(req: express.Request, res: express.Response): void {
        const td = this.getThing();
        if (td === null) {
            res.status(400).end();
            return;
        }
        const propertyName = req.params.propertyName;
        if (td.hasProperty(propertyName)) {
            res.json(td.getProperty(propertyName));
        } else {
            res.status(400).end();
        }
    }

    // Write property request
    put(req: express.Request, res: express.Response): void {
        const thing = this.getThing();
        if (thing === null) {
            res.status(400).end();
            return;
        }
        const propertyName = req.params.propertyName;
        if (thing.hasProperty(propertyName)) {
            try {
                thing.setWriteProperty(propertyName, req.body);
            } catch (error) {
                // Security: error should not be returned
                if (error !== null && typeof error == 'string') {
                    res.json(error.toString());
                }
                res.status(400).end()
                return;
            }
            res.status(200).end();
            //res.json({ [propertyName]: thing.getProperty(propertyName) });
        } else {
            res.status(400).json("Invalid property name").end();
        }
    }


}

/**
 * Action Request handler
 */
class ActionHandler extends BaseHandler {

    post(req: express.Request, res: express.Response): void {
        const thing = this.getThing();
        if (thing === null) {
            res.status(400).end();
            return;
        }
        const actionName = req.params.actionName;
        actionEmitter.invokeAction.emit(actionName, req.body )//thing)
        res.status(200).end();
    }

}
let count= 1
/**
 * Event request handler. TODO: Not done yet
 */
class EventHandler extends BaseHandler  {

    get(req: express.Request, res: express.Response): void {
        const thing = this.getThing();
        if (thing === null) {
            res.status(400).end();
            return;
        }
        const eventName = req.params.eventName;
        
        responseList.push({
            'eventName': eventName,
            'response': res
         })
        var addMessageListener = function () {
            //console.log('function call')
            messageBus.emitEvent.once(eventName, function () {
                //console.log('sending data')
                var filteredArray = responseList.filter(responseList => responseList.eventName === eventName);
                  filteredArray.forEach(val=> val.response.send())
            })
        }
        addMessageListener()
        // send the 1st response to establish the connection
        if(count == 1) {
            count = count+1
            res.send()
        }
        //console.log('sequence 1')
    }
}


/**
 * Server to represent a Web Thing over HTTP.
 */
export class WoTHttpServer {
    things: WebOfThing;
    port: number;
    basePath: string;
    app: express.Express;
    server: http.Server | https.Server;
    router: express.Router;
    servers: Array<ProtocolServer> = [];
    storeThingsId: Array<Thing> = [];
    constructor(
        things: WebOfThing,
        port: number | null = null,
        basePath: string = '/',
    ) {
        this.things = things;
        this.port = Number(port);
        this.basePath = basePath.replace(/\/$/, '') + '/' + this.things.getThing().getTitle() + '/';
        things.getThing().setHrefPrefix(this.basePath);

        this.app = express();
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.raw());
        this.app.use(bodyParser.text());

        // Setting CORS headers
        this.app.use((request, response, next) => {
            response.setHeader('Access-Control-Allow-Origin', '*');
            response.setHeader(
                'Access-Control-Allow-Headers',
                'Origin, X-Requested-With, Content-Type, Accept'
            );
            // response.setHeader("Content-Type", "application/td+json");
            response.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, POST, DELETE');
            if (request.path.split('/').length > 2) {
                let schema = things.getThing().getSecurityScheme();
                const inValue = things.getThing().getSecurityIn() 
                let authValue
                switch (inValue) {
                    case 'query': {
                        authValue = request.query
                        break
                    }
                    case 'body': {
                        authValue = request.body
                        break;
                    }
                    case 'cookie': {
                        authValue = request.headers.cookie
                        let v = authValue?.split(':')
                        if (v) {
                            let v1 = '{"' + v[0] + '":"' + v[1] + '"}'
                            authValue = JSON.parse(v1)
                        }
                        break;
                    }
                    case 'header': {
                        authValue = request.headers
                        break
                    }
                }
                switch (schema) {
                    case 'basic': {
                        if (!this.basicAuthentication(response, authValue[things.getThing().getSecurityName()])) {
                            return
                        }
                        break
                    }
                    case 'digest': {
                        let algorithm = 'MD5'
                        let authInfo: any, hash;
                        if (algorithm == "MD5") {
                            hash = cryptoUsingMD5(credential_digest.realm);
                        } else {
                            hash = cryptoUsingSHA256(credential_digest.realm);
                        }
                        if (!authValue.authorization) {
                            this.authenticateUser(response, hash);
                            return;
                        }
                        authInfo = authValue.authorization.replace(/^Digest /, '');
                        authInfo = parseAuthenticationInfo(authInfo);
                        if (authInfo.username !== credential_digest.userName) {
                            this.authenticateUser(response, hash);
                            return;
                        }
                        let digestResp = digestAuth(credential_digest, request.method, algorithm, authInfo)
                        if (authInfo.response !== digestResp) {
                            this.authenticateUser(response, hash);
                            return;
                        }
                        /*let authInfo: any, hash;
                        let digestAuthObject: any = {};
                        hash = this.cryptoUsingMD5(credential_digest.realm);
                        if (!request.headers.authorization) {
                            this.authenticateUser(response, hash);
                            return;
                        }
                        authInfo = request.headers.authorization.replace(/^Digest /, '');
                        authInfo = this.parseAuthenticationInfo(authInfo);
                        if (authInfo.username !== credential_digest.userName) {
                            this.authenticateUser(response, hash);
                            return;
                        }
                        digestAuthObject.ha1 = this.cryptoUsingMD5(authInfo.username + ':' + credential_digest.realm + ':' + credential_digest.password);
                        digestAuthObject.ha2 = this.cryptoUsingMD5(request.method + ':' + authInfo.uri);
                        var resp = this.cryptoUsingMD5([digestAuthObject.ha1, authInfo.nonce, authInfo.nc, authInfo.cnonce, authInfo.qop, digestAuthObject.ha2].join(':'));

                        digestAuthObject.response = resp;
                        if (authInfo.response !== digestAuthObject.response) {
                            this.authenticateUser(response, hash);
                            return;
                        }*/
                        break;
                    }
                    case 'apikey': {
                        if (!authValue[things.getThing().getSecurityName()]) {
                            this.authenticationStatus(response, "ApiKey Authentication")
                            return;
                        } else {
                            let authKey = authValue[things.getThing().getSecurityName()];
                            if (apiCredential.apikey !== authKey) {
                                this.authenticationStatus(response, "ApiKey Authentication")
                                return
                            }
                        }
                        break;
                    }
                    case 'bearer': {
                        if (authValue[things.getThing().getSecurityName()] === undefined) {
                            response.sendStatus(407)
                            response.json({ 'message': "Authorization is needed" })
                            response.end('');
                            return
                        }
                        const auth = authValue[things.getThing().getSecurityName()].split(" ");
                        if (auth[0] !== "Bearer" || auth[1] !== bearerCredentials.token) {
                            response.end('Authorization is needed');
                            return
                        }

                        break;
                    }
                    case 'oauth2': {
                        if (authValue[things.getThing().getSecurityName()] === undefined) {
                            response.sendStatus(407)
                            response.json({ 'message': "Authorization is needed" })
                            response.end('');
                            return
                        }
                        let sec_para = things.getThing().getSecurityParameter()
                        if (sec_para.authorization!==undefined && sec_para.authorization.length != 0) {
                            console.log('Oauth2 parameter is not defined')                           
                        }
                        const auth = authValue[things.getThing().getSecurityName()].split(" ");
                        if (sec_para.authorization!==undefined && sec_para.flow == 'client') {
                            verifyTokenUSingOkta(auth[1], sec_para.authorization ).then(response => console.log(response))
                        }
                        break;
                    }
                    case 'openid':{
                        if (authValue[things.getThing().getSecurityName()] === undefined) {
                            response.sendStatus(407)
                            response.json({ 'message': "Authorization is needed" })
                            response.end('');
                            return
                        }
                        let sec_para = things.getThing().getSecurityParameter()
                        if (sec_para.authorization!==undefined && sec_para.authorization.length != 0) {
                            console.log('Oauth2 parameter is not defined')                             
                        }
                        const auth = authValue[things.getThing().getSecurityName()].split(" ");
                        if (sec_para.authorization!==undefined && sec_para.flow == 'client') {
                            verifyTokenUSingOkta(auth[1], sec_para.authorization ).then(response => console.log(response))
                        }
                        break;
                    }
                }
            }
            next()
        });

        this.server = https.createServer({
            key: fs.readFileSync("key.pem"),
            cert: fs.readFileSync("cert.pem")
        });
        //this.server = http.createServer();
        const wotHandler = new WoTThingHandler(this.things);
        const propertyHandler = new PropertyHandler(this.things);
        const actionHandler = new ActionHandler(this.things);
        const eventHandler = new EventHandler(this.things);

        this.router = express.Router();
        this.router.get('/', (req, res) => wotHandler.get(req, res));
        this.router.get('/properties/:propertyName', (req, res) => propertyHandler.get(req, res));
        this.router.put('/properties/:propertyName', (req, res) => propertyHandler.put(req, res));
        this.router.post('/actions/:actionName', (req, res) => actionHandler.post(req, res));
        this.router.get('/events/:eventName', (req, res) => eventHandler.get(req, res));
        this.app.use(this.basePath || '/', this.router);
        this.server.on('request', this.app);
    }

    //Basic Authentication
    basicAuthentication(response: express.Response, authValue: any) {
        if (!authValue) {
            this.authenticationStatus(response, "Basic Authentication")
            return false;
        } else {
            let authentication, loginInfo;
            authentication = authValue.replace(/^Basic/, '');
            authentication = Buffer.from(authentication, 'base64').toString('utf-8');
            loginInfo = authentication.split(':');
            if (loginInfo[0] !== credentials.userName || loginInfo[1] !== credentials.password) {
                this.authenticationStatus(response, "Basic Authentication")
                return false
            }
            return true
        }
    }

    authenticationStatus(resp: express.Response, realm: string) {
        resp.writeHead(200, { 'WWW-Authenticate': 'Basic realm="'+ realm +'"' });
        resp.json('{Error:Authorization is needed}');
        //resp.end();

    };

    authenticateUser(res: express.Response, hash: string) {
        res.writeHead(401, {
            'WWW-Authenticate': 'Digest realm="' + credential_digest.realm + '",qop="auth",nonce="' +
                Math.random() + '",opaque="' + hash + '"'
        });
        res.end('Authorization is needed.');
    }

    start(): Promise<void> {
        return new Promise((resolve) => {
            this.server.listen({ port: this.port }, resolve);
        });
    }
   
// TODO : how to stop for long poll
    stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.server.close((error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        })
    }
    addThings(//server: ProtocolServer,
        things: Thing): boolean {
        // add all exposed Things to new server
        //this.things.forEach((thing, id) => server.expose(thing));
        this.storeThingsId.push(things)
        //console.log(this.storeThingsId)
        //servers.push(server);
        return true;
    }
    
    getThingsID(): Array<Thing> {
        return this.storeThingsId;
    }
    //getServers(): Array<ProtocolServer> {
        // return a copy -- FIXME: not a deep copy
        //return this.servers.slice(0);
    //}
}

/**
 * Server to represent a Web Thing over MQTT.
 */
export class WoTMqttServer {
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
        if (config.selfHost) {
            this.hostedServer = Server({});
            let server;
            if(this.schema === "tls") { //if (config.key) {
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

    private handleMessage(receivedTopic: string, rawPayload: Buffer | string): void {
        // route request
        const segments = receivedTopic.split("/");
        let payload = rawPayload
       if (typeof rawPayload === "string") {
            payload = Buffer.from(rawPayload);
        }
        if (segments.length === 2) {
            if (segments[0] === "actions") {
                if(this.schema === "symmetricEncryption" && Object.keys(payload).length > 0) {    
                    let jsondata = JSON.stringify(payload);                    
                    payload = Buffer.from(JSON.parse(jsondata).data).toString('utf8');                
                    payload = decrypt(JSON.parse(payload), "aes-256-cbc")
                }
                actionEmitter.invokeAction.emit(segments[1], payload.toString() != ''  ? (payload.toString()): '')
            }
        }
        else {
            console.warn(`MqttBrokerServer at ${this.brokerURI} received message for invalid topic '${receivedTopic}'`);
        }
    }

    expose(): Promise<void> {
        return new Promise<void>((resolve) => {
            let actionList = this.things.getThing().getActionDescriptions()
            for (let action in actionList) {
                let topic = actionList[action].forms[0]['href']
                this.broker.subscribe(topic)
            }
            let eventList = this.things.getThing().getEventDescriptions()
            for (let eventName in eventList) {
                var addMessageListener = () => {
                    messageBus.emitEvent.on(eventName, async (load:any) => {
                        if(this.schema === "symmetricEncryption" && Object.keys(load).length > 0 ) {
                            load = Buffer.from(JSON.stringify(encrypt(load, "aes-256-cbc")))
                        }
                        this.broker.publish(eventList[eventName].forms[0]['href'],Object.keys(load).length > 0 ? load : '')
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
                    console.info(`MqttBrokerServer connected to broker at ${this.brokerURI}`);

                    const parsed = new url.URL(this.brokerURI);
                    this.address = parsed.hostname;
                    const port = parseInt(parsed.port);
                    this.port = port > 0 ? port : 1883;
                    // connect incoming messages to Thing
                    
                    resolve()
                //this.expose()

                });
                this.broker.on("error", (err: Error) => {
                    console.error(`MqttBrokerServer could not connect to broker at ${this.brokerURI}`);
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
        switch (this.schema) {
            case 'userPassword': {                
                if (this.config.selfHostAuthentication && username !== undefined) {
                    for (let i = 0; i < this.config.selfHostAuthentication.length; i++) {
                    if (
                                username === this.config.selfHostAuthentication[i].username &&
                                password.equals(Buffer.from(
                                    this.config.selfHostAuthentication[i].password || ''))
                            ) {
                                done(null, true);
                                return;
                            }
                    }
                    done(null, false);
                    return;
                }
                done(null, true);
                break
            }
            case 'bearer': {                
                if (this.config.selfHostAuthentication && username !== undefined) {
                    for (let i = 0; i < this.config.selfHostAuthentication.length; i++) {
                        if (password.equals(Buffer.from(this.config.selfHostAuthentication[i].password || ''))) {
                            done(null, true);
                            return;
                        }
                    }
                    done(null, false);
                    return;
                }
                done(null, true);
                
                break;
            }
            case 'nosec': {
                done(null, true);
                break;
            }
            case "symmetricEncryption": {
                done(null, true);
                break;
            }
        }
    }
}


