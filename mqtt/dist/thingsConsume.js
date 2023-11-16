"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const things_1 = __importDefault(require("./things"));
const property_1 = __importDefault(require("./property"));
const action_1 = __importDefault(require("./action"));
const event_1 = __importDefault(require("./event"));
class ThingsConsume extends things_1.default {
    constructor(td) {
        super(td.id, td.title, td.description);
        let metaData = {};
        if (td.hasOwnProperty("securityDefinitions") && td.hasOwnProperty("security")) {
            this.setsecurity(td.securityDefinitions, td.security);
        }
        else {
            let def = {
                nosec_sc: {
                    scheme: 'nosec',
                },
            };
            this.setsecurity(def, 'nosec_sc');
        }
        //console.log(typeof td.properties + " " + Object.keys(td.properties).length);
        for (const property in td.properties) {
            metaData = {};
            // adding the property
            Object.entries(td.properties[property]).forEach(([key, value]) => {
                metaData[key] = value;
            });
            this.addProperty(new property_1.default(this, property, null, metaData));
        }
        // adding the actions
        if (Object.keys(td.actions).length > 0) {
            for (const action in td.actions) {
                metaData = {};
                Object.entries(td.actions[action]).forEach(([key, value]) => {
                    metaData[key] = value;
                });
                this.addAction(new action_1.default(action, metaData));
            }
        }
        if (Object.keys(td.events).length > 0) {
            // adding the events
            for (const event in td.events) {
                metaData = {};
                Object.entries(td.events[event]).forEach(([key, value]) => {
                    metaData[key] = value;
                });
                this.addEvent(new event_1.default(event, metaData));
            }
        }
    }
}
module.exports = ThingsConsume;
//# sourceMappingURL=thingsConsume.js.map