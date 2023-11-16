
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
  // username & password are redundated here (also find them in MqttClientSecurityParameters)
  // because MqttClient.setSecurity() method can inject authentication credentials into this interface
  // which will be then passed to mqtt.connect() once for all
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
