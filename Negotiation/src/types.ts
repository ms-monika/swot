
import express from 'express';
export type PrimitiveJsonType =
  | 'null'
  | 'boolean'
  | 'object'
  | 'array'
  | 'number'
  | 'integer'
  | 'string';

export type AnyType = null | boolean | number | string | Record<string, unknown> | unknown[];


export interface Form {
  op?: string | string[];
  href: string;
  contentType?: string;
  subprotocol?:string;
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
   send: () => void
  }
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

export interface SecurityAbstract {
  in?: string;
  name?: string;
  flow?: string;
  authorization?: string;
}

export interface ProtocolServer {
  readonly scheme: string;
  //expose(thing: ExposedThing, tdTemplate?: WoT.ThingDescription): Promise<void>;
  /**
   * @param thingId: id of the thing to destroy
   * @returns true if the thing was found and destroyed; false if the thing was not found
   * @throws if the binding couldn't destroy the thing
   **/
  destroy(thingId: string): Promise<boolean>;
  start(): Promise<void>;
  stop(): Promise<void>;
  getPort(): number;
}