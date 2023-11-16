/// <reference types="node" />
import Thing from './things';
import { MqttBrokerServerConfig } from './types';
import * as net from "net";
export declare class WebOfThing {
    private thing;
    constructor(thing: Thing);
    /**
     * get the things description
     */
    getThing(): Thing;
}
/**
 * Server to represent a Web Thing over MQTT.
 */
export declare class WoTMqttServer {
    readonly scheme: string;
    things: WebOfThing;
    brokerURI: string;
    private broker;
    config: MqttBrokerServerConfig;
    private hostedServer;
    hostedBroker: net.Server | undefined;
    port: number;
    address: string | undefined;
    constructor(things: WebOfThing, config: MqttBrokerServerConfig);
    private handleMessage;
    expose(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    private selfHostAuthentication;
}
//# sourceMappingURL=server.d.ts.map