"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const ajv_1 = __importDefault(require("ajv"));
const ajv = new ajv_1.default();
class Property {
    constructor(thing, name, value, metadata) {
        this.thing = thing;
        this.name = name;
        this.value = value;
        this.href = `properties/${this.name}`;
        this.metadata = JSON.parse(JSON.stringify(metadata || {}));
        delete metadata.unit;
        this.validate = ajv.compile(metadata);
    }
    /**
     * Validate the property value
     */
    validatePropertyValue(value) {
        if (this.metadata.hasOwnProperty('readOnly') && this.metadata.readOnly) {
            throw new Error('Read-only property');
        }
        const valid = this.validate(value);
        if (!valid) {
            throw new Error('Invalid property value');
        }
    }
    /**
     * property description.
     */
    getPropertyDescription() {
        const description = JSON.parse(JSON.stringify(this.metadata));
        if (!description.hasOwnProperty('forms')) {
            description.forms = [];
        }
        if (!description.hasOwnProperty('readOnly')) {
            description.readOnly = false;
        }
        if (!description.hasOwnProperty('writeOnly')) {
            description.writeOnly = false;
        }
        if (!description.hasOwnProperty('observable')) {
            description.observable = false;
        }
        let operand = [];
        if (description.readOnly != undefined && description.readOnly) {
            operand.push("readproperty");
        }
        else if (description.writeOnly != undefined && description.writeOnly) {
            operand.push("writeproperty");
        }
        else {
            operand.push("readproperty");
            operand.push("writeproperty");
        }
        description.forms.push({
            op: operand,
            href: this.href,
            contentType: "application/json"
        });
        return description;
    }
    getValue() {
        return this.value;
    }
    setValue(value) {
        this.validatePropertyValue(value);
        this.value = value;
    }
    getName() {
        return this.name;
    }
    getThing() {
        return this.thing;
    }
}
module.exports = Property;
//# sourceMappingURL=property.js.map