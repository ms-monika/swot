
import Ajv, { ValidateFunction } from 'ajv';
import Thing from './things';
import { AnyType, PrimitiveJsonType, Form } from './types';

const ajv = new Ajv();


class Property<ValueType = AnyType> {
  private thing: Thing;
  private name: string;
  private value: any;
  private metadata: Property.PropertyMetadata;
  private href: string;
  private validate: ValidateFunction;
  constructor(
    thing: Thing,
    name: string,
    value: any,
    metadata: Property.PropertyMetadata,
  ) {
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
  validatePropertyValue(value: ValueType): void {
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
  getPropertyDescription(): Property.PropertyDescription {
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
    let operand = []
    if (description.readOnly != undefined && description.readOnly) {
      operand.push("readproperty")
    } else if (description.writeOnly != undefined && description.writeOnly) {
      operand.push("writeproperty")
    } else {
      operand.push("readproperty")
      operand.push("writeproperty")
    }
    description.forms.push({
      op: operand,
      href: this.href,
      contentType: "application/json"
    });
    return description;
  }

  getValue(): ValueType {
    return this.value
  }

  setValue(value: ValueType): void {
    this.validatePropertyValue(value);
    this.value = value
  }

  getName(): string {
    return this.name;
  }

  getThing(): Thing {
    return this.thing;
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Property {
  interface PropertyMetadata {
    type?: PrimitiveJsonType;
    unit?: string;
    title?: string;
    description?: string;
    forms?: Form[];
    enum?: AnyType[];
    readOnly?: boolean;
    writeOnly?: boolean;
    observable?: boolean;
    minimum?: number;
    maximum?: number;
    multipleOf?: number;
    properties?: PropertyMetadata[];
  }

  interface PropertyDescription extends PropertyMetadata {
    forms: Form[];
  }
}

export = Property;
