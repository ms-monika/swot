"use strict";
//const EventEmitter = require('events')
class Event {
    constructor(name, metadata) {
        //super()
        this.name = name;
        this.metadata = JSON.parse(JSON.stringify(metadata || {}));
        this.href = `events/${this.name}`;
    }
    getEventDescription() {
        const description = JSON.parse(JSON.stringify(this.metadata));
        description.forms = [{
                op: [
                    "subscribeevent",
                    "unsubscribeevent"
                ],
                href: this.href,
                contentType: "application/json",
                subprotocol: "longpoll"
            }];
        return description;
    }
    getName() {
        return this.name;
    }
}
module.exports = Event;
//# sourceMappingURL=event.js.map