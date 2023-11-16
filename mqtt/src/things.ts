
import Property from './property';
import Event from './event';
import Action from './action';
import { AnyType, SecurityScheme } from './types';


class Thing {
  private id: string;
  private title: string;
  private context: string;
  private description: string;
  private properties: { [name: string]: Property };
  private actions: { [name: string]: Action };
  private events: { [name: string]: Event };
  private hrefPrefix: string;
  private security: string;
  private securityDefinitions: { [security: string]: SecurityScheme };

  constructor(id: string, title: string, description: string) {
    this.id = id;
    this.title = title;
    this.context = 'https://www.w3.org/2022/wot/td/v1.1';
    this.description = description || '';
    this.properties = {};
    this.actions = {};
    this.events = {};
    this.hrefPrefix = '';
    this.securityDefinitions = {
      nosec_sc: {
        scheme: 'nosec',
        in: 'header',
        name : 'authorization'
      },
    }
    this.security = 'nosec_sc';
  }

  /**
   * Return the thing state as a Thing Description.

   */
  getTD(): Thing.ThingDescription {
    const thing: Omit<Thing.ThingDescription, 'name' | 'href'> = {
      id: this.id,
      title: this.title,
      '@context': this.context,
      properties: this.getPropertyDescriptions(),
      actions: this.getActionDescriptions(),
      events: this.getEventDescriptions(),
      securityDefinitions: this.securityDefinitions,
      security: this.security,
      base: ''
    };
    if (this.description) {
      thing.description = this.description;
    }
    return thing as Thing.ThingDescription;
  }

  /**
   * Get this thing's href.
   */
  getHref(): string {
    if (this.hrefPrefix) {
      return this.hrefPrefix;
    }
    return '/';
  }

  getThingDescription() {
    return this.description
  }
  setHrefPrefix(prefix: string): void {
    this.hrefPrefix = prefix;
  }

  setsecurity(definition: any, security: string): void {
    this.security = security
    this.securityDefinitions = definition;
    if (!definition[this.security].hasOwnProperty('in')) {
      this.securityDefinitions[this.security].in = 'header'
    }if (!definition[this.security].hasOwnProperty('name')) {
      this.securityDefinitions[this.security].name = 'authorization'
    }
  }

  getSecurityScheme() {
    return this.securityDefinitions[this.security].scheme
  }
  getSecurityIn() {
    return this.securityDefinitions[this.security].in
  }
  getSecurityName() {
    return this.securityDefinitions[this.security].name
  }
  getSecurityParameter() {
    return this.securityDefinitions[this.security]
  }


  /**
   * Get the title of the thing.
   */
  getTitle(): string {
    return this.title;
  }

  /**
   * Get the actions as an object.
   */
  getActionDescriptions(): { [name: string]: Action.ActionDescription } {
    const descriptions: { [name: string]: Action.ActionDescription } = {};
    for (const name in this.actions) {
      descriptions[name] = this.actions[name].getActionDescription();
    }
    return descriptions;
  }
  /**
     * Get the event as an object.
     */
  getEventDescriptions(): { [name: string]: Event.EventDescription } {
    const descriptions: { [name: string]: Event.EventDescription } = {};
    for (const name in this.events) {
      descriptions[name] = this.events[name].getEventDescription();
    }
    return descriptions;
  }
  /**
  * Get the properties as an object.
  */
  getPropertyDescriptions(): { [name: string]: Property.PropertyDescription } {
    const descriptions: { [name: string]: Property.PropertyDescription } = {};
    for (const name in this.properties) {
      descriptions[name] = this.properties[name].getPropertyDescription();
    }
    return descriptions;
  }

  /**
   * Add a property to this thing.
   */
  addProperty(property: Property): void {
    this.properties[property.getName()] = property;
  }

  findProperty(propertyName: string): Property | null {
    if (this.properties.hasOwnProperty(propertyName)) {
      return this.properties[propertyName];
    }

    return null;
  }

  /**
   * Get a property's value.
   */
  getProperty(propertyName: string): unknown | null {
    const prop = this.findProperty(propertyName);
    if (prop) {
      return prop.getValue();
    }
    return null;
  }

  hasProperty(propertyName: string): boolean {
    return this.properties.hasOwnProperty(propertyName);
  }

  /**
   * Set a property value.
   */
  setWriteProperty(propertyName: string, value: AnyType): void {
    const property = this.findProperty(propertyName);
    //console.log(prop)
    if (!property) {
      return;
    }
    property.setValue(value);
  }


  addEvent(event: Event): void {
    this.events[event.getName()] = event
  }

  addAction(action: Action): void {
    this.actions[action.getName()] = action
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Thing {
  export interface ThingDescription {
    id: string;
    title: string;
    name: string;
    href: string;
    '@context': string;
    properties: { [name: string]: Property.PropertyDescription };
    actions: { [name: string]: Action.ActionMetadata };
    events: { [name: string]: Event.EventMetadata };
    description?: string;
    base?: string;
    securityDefinitions?: { [security: string]: SecurityScheme };
    security?: string;
  }
}

export = Thing;
