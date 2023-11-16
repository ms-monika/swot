import Property from './property';
import Event from './event';
import Action from './action';
import { AnyType, SecurityScheme } from './types';
declare class Thing {
    private id;
    private title;
    private context;
    private description;
    private properties;
    private actions;
    private events;
    private hrefPrefix;
    private security;
    private securityDefinitions;
    constructor(id: string, title: string, description: string);
    /**
     * Return the thing state as a Thing Description.
  
     */
    getTD(): Thing.ThingDescription;
    /**
     * Get this thing's href.
     */
    getHref(): string;
    getThingDescription(): string;
    setHrefPrefix(prefix: string): void;
    setsecurity(definition: any, security: string): void;
    getSecurityScheme(): string;
    getSecurityIn(): string;
    getSecurityName(): string;
    getSecurityParameter(): SecurityScheme;
    /**
     * Get the title of the thing.
     */
    getTitle(): string;
    /**
     * Get the actions as an object.
     */
    getActionDescriptions(): {
        [name: string]: Action.ActionDescription;
    };
    /**
       * Get the event as an object.
       */
    getEventDescriptions(): {
        [name: string]: Event.EventDescription;
    };
    /**
    * Get the properties as an object.
    */
    getPropertyDescriptions(): {
        [name: string]: Property.PropertyDescription;
    };
    /**
     * Add a property to this thing.
     */
    addProperty(property: Property): void;
    findProperty(propertyName: string): Property | null;
    /**
     * Get a property's value.
     */
    getProperty(propertyName: string): unknown | null;
    hasProperty(propertyName: string): boolean;
    /**
     * Set a property value.
     */
    setWriteProperty(propertyName: string, value: AnyType): void;
    addEvent(event: Event): void;
    addAction(action: Action): void;
}
declare namespace Thing {
    interface ThingDescription {
        id: string;
        title: string;
        name: string;
        href: string;
        '@context': string;
        properties: {
            [name: string]: Property.PropertyDescription;
        };
        actions: {
            [name: string]: Action.ActionMetadata;
        };
        events: {
            [name: string]: Event.EventMetadata;
        };
        description?: string;
        base?: string;
        securityDefinitions?: {
            [security: string]: SecurityScheme;
        };
        security?: string;
    }
}
export = Thing;
//# sourceMappingURL=things.d.ts.map