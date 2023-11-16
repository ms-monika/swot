
import express from 'express';
import * as tls from 'tls'

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

export interface KafkaSslOption {
  rejectUnauthorized?: boolean;
  ca?: Buffer;
  key?: Buffer;
  cert?: Buffer;
}

export interface KafkaSaslOption {
  mechanism: boolean;
  username?: string;
  password?: string;
}

type SaslAuthenticationRequest = {
  encode: () => Buffer | Promise<Buffer>
}
type SaslAuthenticationResponse<ParseResult> = {
  decode: (rawResponse: Buffer) => Buffer | Promise<Buffer>
  parse: (data: Buffer) => ParseResult
}

export type Authenticator = {
  authenticate: () => Promise<void>
}

export type SaslAuthenticateArgs<ParseResult> = {
  request: SaslAuthenticationRequest
  response?: SaslAuthenticationResponse<ParseResult>
}
export enum logLevel {
  NOTHING = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 4,
  DEBUG = 5,
}
export type Logger = {
  info: (message: string, extra?: object) => void
  error: (message: string, extra?: object) => void
  warn: (message: string, extra?: object) => void
  debug: (message: string, extra?: object) => void

  namespace: (namespace: string, logLevel?: logLevel) => Logger
  setLogLevel: (logLevel: logLevel) => void
}
export type AuthenticationProviderArgs = {
  host: string
  port: number
  logger: Logger
  saslAuthenticate: <ParseResult>(
    args: SaslAuthenticateArgs<ParseResult>
  ) => Promise<ParseResult | void>
}

export interface OauthbearerProviderResponse {
  value: string
}
type SASLMechanismOptionsMap = {
  plain: { username: string; password: string }
  'scram-sha-256': { username: string; password: string }
  'scram-sha-512': { username: string; password: string }
  aws: {
    authorizationIdentity: string
    accessKeyId: string
    secretAccessKey: string
    sessionToken?: string
  }
  oauthbearer: { oauthBearerProvider: () => Promise<OauthbearerProviderResponse> }
}
export type Mechanism = {
  mechanism: string
  authenticationProvider: (args: AuthenticationProviderArgs) => Authenticator
}
export type SASLMechanism = keyof SASLMechanismOptionsMap
type SASLMechanismOptions<T> = T extends SASLMechanism
  ? { mechanism: T } & SASLMechanismOptionsMap[T]
  : never
export type SASLOptions = SASLMechanismOptions<SASLMechanism>


export interface KafkaBrokerServerConfig {
  brokers: string[];
  clientId: string;
  ssl?: boolean| tls.ConnectionOptions;
  sasl?: SASLOptions | Mechanism;
  docker?:  string;
}
