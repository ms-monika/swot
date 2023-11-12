
import { AnyType, Form } from './types';

//const EventEmitter = require('events')

class Event<Data = AnyType> /*extends EventEmitter*/ {
  private name: string;
  private metadata: Event.EventMetadata;
  private href: string;

  constructor( name: string, metadata: Event.EventMetadata) {
    //super()
    this.name = name;
    this.metadata = JSON.parse(JSON.stringify(metadata || {}));
    this.href = `events/${this.name}`;
  }

  getEventDescription(): Event.EventDescription {
    const description = JSON.parse(JSON.stringify(this.metadata));      
      description.forms = [{
        op: [
          "subscribeevent",
          "unsubscribeevent"
        ],
        href: this.href,
        contentType: "application/json",        
        subprotocol: "longpoll"
      }];

    return description;
  }

  getName(): string {
    return this.name;
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Event {
  interface EventMetadata {
    title?: string;
    description?: string;
    forms?: Form[];
    minimum?: number;
    maximum?: number;
    multipleOf?: number;
    enum?: readonly string[] | readonly number[];
  }
  interface EventDescription extends EventMetadata{
    forms: Form[];
  }
}

export = Event;
