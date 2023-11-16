/// <reference types="node" />
import express from 'express';
export declare type PrimitiveJsonType = 'null' | 'boolean' | 'object' | 'array' | 'number' | 'integer' | 'string';
export declare type AnyType = null | boolean | number | string | Record<string, unknown> | unknown[];
export interface Form {
    op?: string | string[];
    href: string;
    contentType?: string;
    subprotocol?: string;
}
export interface SecurityScheme {
    scheme: string;
    in: string;
    name: string;
    flow?: string;
    authorization?: string;
}
export interface responseArray {
    eventName: string;
    response: express.Response | {
        send: () => void;
    };
}
export interface MqttClientConfig {
    username?: string;
    password?: string;
    rejectUnauthorized?: boolean;
}
export interface MqttBrokerServerConfig {
    uri: string;
    user?: string;
    psw?: string;
    clientId?: string;
    protocolVersion?: 3 | 4 | 5;
    rejectUnauthorized?: boolean;
    selfHost?: boolean;
    key?: Buffer;
    cert?: Buffer | undefined;
    selfHostAuthentication?: MqttClientConfig[];
}
//# sourceMappingURL=types.d.ts.map