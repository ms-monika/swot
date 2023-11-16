import { AnyType, Form } from './types';
declare class Event<Data = AnyType> {
    private name;
    private metadata;
    private href;
    constructor(name: string, metadata: Event.EventMetadata);
    getEventDescription(): Event.EventDescription;
    getName(): string;
}
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
    interface EventDescription extends EventMetadata {
        forms: Form[];
    }
}
export = Event;
//# sourceMappingURL=event.d.ts.map