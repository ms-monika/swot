"use strict";
/**
 *  Action Affordance.
 */
class Action {
    constructor(name, metadata) {
        this.name = name;
        this.href = `actions/${this.name}`;
        this.metadata = JSON.parse(JSON.stringify(metadata || {}));
    }
    /**
     * Get the action description.
     */
    getActionDescription() {
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
    getName() {
        return this.name;
    }
}
module.exports = Action;
//# sourceMappingURL=action.js.map