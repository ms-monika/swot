import { AnyType, Form, PrimitiveJsonType } from './types';

/**
 *  Action Affordance.
 */
class Action<InputType = AnyType> {

  private name: string;
  private href: string; 
  private metadata: Action.ActionMetadata;

  constructor(name: string,  metadata: Action.ActionMetadata) {
    this.name = name;
    this.href = `actions/${this.name}`;
    this.metadata= JSON.parse(JSON.stringify(metadata || {}));
  }

  /**
   * Get the action description.
   */
  getActionDescription(): Action.ActionDescription {
    const description = JSON.parse(JSON.stringify(this.metadata));      
    if (!description.hasOwnProperty('safe')) {
      description.safe = false;
    }
    if (!description.hasOwnProperty('idempotent')) {
      description.idempotent = false;
    }
      description.forms = [{
        op: ['invokeaction'],
        href: this.href,
        contentType: "application/json"
      }];

    return description;
  }  
  getName(): string {
    return this.name;
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Action {
  interface ActionMetadata {
    title?: string;
    description?: string;
    forms?: Form[];
    safe?: boolean;
    idempotent?: boolean;
    input?: {
      type?: PrimitiveJsonType;
      minimum?: number;
      maximum?: number;
      multipleOf?: number;
      enum?: readonly string[] | readonly number[];
    };
  }

  interface ActionDescription extends ActionMetadata{
    forms: Form[];
  }
}

export = Action;
