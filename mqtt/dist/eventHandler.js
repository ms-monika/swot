"use strict";
let eventEmitter = require('events').EventEmitter;
let emitEvent = new eventEmitter();
emitEvent.setMaxListeners(100);
exports.emitEvent = emitEvent;
//# sourceMappingURL=eventHandler.js.map