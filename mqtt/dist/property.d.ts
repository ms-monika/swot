import Thing from './things';
import { AnyType, PrimitiveJsonType, Form } from './types';
declare class Property<ValueType = AnyType> {
    private thing;
    private name;
    private value;
    private metadata;
    private href;
    private validate;
    constructor(thing: Thing, name: string, value: any, metadata: Property.PropertyMetadata);
    /**
     * Validate the property value
     */
    validatePropertyValue(value: ValueType): void;
    /**
     * property description.
     */
    getPropertyDescription(): Property.PropertyDescription;
    getValue(): ValueType;
    setValue(value: ValueType): void;
    getName(): string;
    getThing(): Thing;
}
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
//# sourceMappingURL=property.d.ts.map