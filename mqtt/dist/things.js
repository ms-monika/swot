"use strict";
class Thing {
    constructor(id, title, description) {
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
                name: 'authorization'
            },
        };
        this.security = 'nosec_sc';
    }
    /**
     * Return the thing state as a Thing Description.
  
     */
    getTD() {
        const thing = {
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
        return thing;
    }
    /**
     * Get this thing's href.
     */
    getHref() {
        if (this.hrefPrefix) {
            return this.hrefPrefix;
        }
        return '/';
    }
    getThingDescription() {
        return this.description;
    }
    setHrefPrefix(prefix) {
        this.hrefPrefix = prefix;
    }
    setsecurity(definition, security) {
        this.security = security;
        this.securityDefinitions = definition;
        if (!definition[this.security].hasOwnProperty('in')) {
            this.securityDefinitions[this.security].in = 'header';
        }
        if (!definition[this.security].hasOwnProperty('name')) {
            this.securityDefinitions[this.security].name = 'authorization';
        }
    }
    getSecurityScheme() {
        return this.securityDefinitions[this.security].scheme;
    }
    getSecurityIn() {
        return this.securityDefinitions[this.security].in;
    }
    getSecurityName() {
        return this.securityDefinitions[this.security].name;
    }
    getSecurityParameter() {
        return this.securityDefinitions[this.security];
    }
    /**
     * Get the title of the thing.
     */
    getTitle() {
        return this.title;
    }
    /**
     * Get the actions as an object.
     */
    getActionDescriptions() {
        const descriptions = {};
        for (const name in this.actions) {
            descriptions[name] = this.actions[name].getActionDescription();
        }
        return descriptions;
    }
    /**
       * Get the event as an object.
       */
    getEventDescriptions() {
        const descriptions = {};
        for (const name in this.events) {
            descriptions[name] = this.events[name].getEventDescription();
        }
        return descriptions;
    }
    /**
    * Get the properties as an object.
    */
    getPropertyDescriptions() {
        const descriptions = {};
        for (const name in this.properties) {
            descriptions[name] = this.properties[name].getPropertyDescription();
        }
        return descriptions;
    }
    /**
     * Add a property to this thing.
     */
    addProperty(property) {
        this.properties[property.getName()] = property;
    }
    findProperty(propertyName) {
        if (this.properties.hasOwnProperty(propertyName)) {
            return this.properties[propertyName];
        }
        return null;
    }
    /**
     * Get a property's value.
     */
    getProperty(propertyName) {
        const prop = this.findProperty(propertyName);
        if (prop) {
            return prop.getValue();
        }
        return null;
    }
    hasProperty(propertyName) {
        return this.properties.hasOwnProperty(propertyName);
    }
    /**
     * Set a property value.
     */
    setWriteProperty(propertyName, value) {
        const property = this.findProperty(propertyName);
        //console.log(prop)
        if (!property) {
            return;
        }
        property.setValue(value);
    }
    addEvent(event) {
        this.events[event.getName()] = event;
    }
    addAction(action) {
        this.actions[action.getName()] = action;
    }
}
module.exports = Thing;
//# sourceMappingURL=things.js.map