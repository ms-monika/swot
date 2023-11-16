import { AnyType, Form, PrimitiveJsonType } from './types';
/**
 *  Action Affordance.
 */
declare class Action<InputType = AnyType> {
    private name;
    private href;
    private metadata;
    constructor(name: string, metadata: Action.ActionMetadata);
    /**
     * Get the action description.
     */
    getActionDescription(): Action.ActionDescription;
    getName(): string;
}
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
    interface ActionDescription extends ActionMetadata {
        forms: Form[];
    }
}
export = Action;
//# sourceMappingURL=action.d.ts.map