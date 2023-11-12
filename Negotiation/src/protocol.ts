import { AnyType, Form, SecurityAbstract } from './types';

/**
 * Protocol Affordance.
 */
class Protocol<InputType = AnyType> {

  private name: string;
  //private href: string; 
  metadata:Protocol.ProtocolMetadata;

  constructor(name: string,  metadata:Protocol.ProtocolMetadata) {
    this.name = name;
    //this.href = `actions/${this.name}`;
    this.metadata= JSON.parse(JSON.stringify(metadata || {}));
  }

  /**
   * Get the Protocol description.
   */
  getProtocolDescription():Protocol.ProtocolDescription {
    const description = JSON.parse(JSON.stringify(this.metadata));      
    return description;
  }  
  getName(): string {
    return this.name;
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Protocol {
  interface ProtocolMetadata {
    title?: string;
    description?: string;
    forms?: Form[];
    protocol?: string;
    baseKeyword?: string;
    securityAbstract: {[name: string]: SecurityAbstract};
  }

  interface ProtocolDescription extends ProtocolMetadata{
    forms: Form[];
  }
}

export = Protocol;
